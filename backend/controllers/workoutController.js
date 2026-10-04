const Workout = require("../models/workout");
const WorkoutTemplate = require("../models/WorkoutTemplate");
const Progress = require("../models/Progress");
const Achievement = require("../models/Achievement");
const { checkAndAwardWorkoutPRs } = require("../utils/achievementHelper");
require("../models/Exercise");

const sanitizeExerciseInput = (exercises) => {
    if (!Array.isArray(exercises)) return [];
    return exercises.map(ex => {
        const rawExerciseId = ex.exercise?._id || ex.exercise;
        const validExerciseId = rawExerciseId && require("mongoose").Types.ObjectId.isValid(rawExerciseId)
            ? rawExerciseId
            : undefined;

        const cleanSets = (ex.sets || []).map(s => ({
            _id: s._id && require("mongoose").Types.ObjectId.isValid(s._id) ? s._id : undefined,
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            distance: s.distance !== undefined && s.distance !== "" ? Number(s.distance) : undefined,
            duration: s.duration !== undefined && s.duration !== "" ? Number(s.duration) : undefined,
            restSeconds: Number(s.restSeconds) || 0,
            completed: Boolean(s.completed),
            notes: s.notes || ""
        }));

        const cleanEx = {
            sets: cleanSets,
            notes: ex.notes || ""
        };
        if (ex._id && require("mongoose").Types.ObjectId.isValid(ex._id)) {
            cleanEx._id = ex._id;
        }
        if (validExerciseId) {
            cleanEx.exercise = validExerciseId;
        }
        return cleanEx;
    });
};

const getOwnedWorkout = (workoutId, userId) => Workout.findOne({
    _id: workoutId,
    user: userId
});

const startWorkout = async (req, res) => {
    try {
        let exercises = req.body.exercises || [];
        let name = req.body.name;
        let template = null;

        // Ensure user has at most one active workout by marking prior active sessions as completed
        await Workout.updateMany(
            { user: req.user._id, status: "active" },
            { $set: { status: "completed", completedAt: new Date() } }
        );

        if (req.body.template) {
            template = await WorkoutTemplate.findOne({
                _id: req.body.template,
                user: req.user._id
            }).populate("exercises.exercise");
            if (!template) return res.status(404).json({ error: "Template not found" });
            exercises = template.exercises.map(item => {
                const exObj = item.toObject ? item.toObject() : item;
                const sets = (exObj.sets || []).map(s => ({
                    reps: s.reps || 0,
                    weight: s.weight || 0,
                    distance: s.distance || 0,
                    duration: s.duration || 0,
                    restSeconds: s.restSeconds || exObj.restSeconds || 0,
                    notes: s.notes || "",
                    completed: false
                }));
                return {
                    exercise: exObj.exercise?._id || exObj.exercise,
                    sets: sets.length > 0 ? sets : [{ reps: 10, weight: 0, completed: false, restSeconds: 60 }],
                    notes: exObj.notes || ""
                };
            });
            name = name || template.name;
        }

        if (!name) name = "Freestyle Workout";

        const workout = await Workout.create({
            ...req.body,
            user: req.user._id,
            template: template ? template._id : null,
            name,
            exercises: sanitizeExerciseInput(exercises),
            status: "active",
            startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date()
        });
        await workout.populate("exercises.exercise");
        res.status(201).json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getWorkouts = async (req, res) => {
    try {
        const filter = { user: req.user._id };
        if (req.query.status) filter.status = req.query.status;
        const workouts = await Workout.find(filter)
            .sort({ startedAt: -1 })
            .populate("exercises.exercise");
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWorkout = async (req, res) => {
    try {
        const workout = await getOwnedWorkout(req.params.workoutId, req.user._id)
            .populate("exercises.exercise");
        if (!workout) return res.status(404).json({ error: "Workout not found" });
        res.json(workout);
    } catch (error) {
        res.status(400).json({ error: "Invalid workout id" });
    }
};

const updateWorkout = async (req, res) => {
    try {
        const allowed = ["name", "notes", "exercises", "startedAt", "completedAt", "duration", "volume", "media", "status"];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowed.includes(key))
        );
        if (updates.exercises) {
            updates.exercises = sanitizeExerciseInput(updates.exercises);
        }
        if (updates.name) {
            updates.name = updates.name.trim();
        }

        // Calculate live volume if exercises were provided and volume was not explicitly sent
        if (updates.exercises && updates.volume === undefined) {
            let calculatedVolume = 0;
            updates.exercises.forEach(ex => {
                (ex.sets || []).forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        calculatedVolume += (Number(set.weight) * Number(set.reps));
                    }
                });
            });
            updates.volume = calculatedVolume;
        }

        const workout = await Workout.findOneAndUpdate(
            { _id: req.params.workoutId, user: req.user._id },
            { $set: updates },
            { returnDocument: "after", runValidators: true }
        ).populate("exercises.exercise");
        if (!workout) return res.status(404).json({ error: "Workout not found" });

        // If a completed workout is reverted to active, or its exercises were modified, re-sync progress & achievements
        if (updates.status === "active") {
            await Progress.deleteMany({ sourceWorkout: workout._id, user: req.user._id });
            await Achievement.deleteMany({ sourceWorkout: workout._id, user: req.user._id });
        } else if (workout.status === "completed" && updates.exercises) {
            await Progress.deleteMany({ sourceWorkout: workout._id, user: req.user._id });
            await Achievement.deleteMany({ sourceWorkout: workout._id, user: req.user._id });
            await checkAndAwardWorkoutPRs(workout, req.user._id);
            const records = workout.exercises.flatMap(item => {
                const exId = item.exercise?._id || item.exercise;
                if (!exId || !require("mongoose").Types.ObjectId.isValid(exId)) return [];
                return (item.sets || [])
                    .filter(set => set.completed)
                    .map(set => {
                        const w = Number(set.weight) || 0;
                        const r = Number(set.reps) || 0;
                        const oneRepMax = r === 1 ? w : (w > 0 && r > 0 ? Math.round((w * (1 + r / 30)) * 10) / 10 : 0);
                        return {
                            user: req.user._id,
                            exercise: exId,
                            weight: w,
                            reps: r,
                            oneRepMax,
                            volume: w * r,
                            distance: set.distance,
                            duration: set.duration,
                            sourceWorkout: workout._id,
                            date: workout.completedAt || new Date()
                        };
                    });
            });
            if (records.length) await Progress.insertMany(records);
        }

        res.json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSet = async (req, res) => {
    try {
        const workout = await getOwnedWorkout(req.params.workoutId, req.user._id);
        if (!workout) return res.status(404).json({ error: "Workout not found" });

        let updated = false;
        for (const exercise of workout.exercises) {
            const set = exercise.sets.id(req.params.setId);
            if (set) {
                Object.assign(set, req.body);
                updated = true;
                break;
            }
        }
        if (!updated) return res.status(404).json({ error: "Set not found" });
        await workout.save();
        await workout.populate("exercises.exercise");
        res.json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const completeWorkout = async (req, res) => {
    try {
        const workout = await getOwnedWorkout(req.params.workoutId, req.user._id);
        if (!workout) return res.status(404).json({ error: "Workout not found" });

        workout.status = "completed";
        workout.completedAt = req.body?.completedAt ? new Date(req.body.completedAt) : new Date();
        const durationSec = Math.max(0, Math.round((workout.completedAt.getTime() - new Date(workout.startedAt).getTime()) / 1000));
        workout.duration = req.body?.duration !== undefined ? Number(req.body.duration) : durationSec;

        if (req.body?.name) workout.name = req.body.name.trim() || workout.name;
        if (req.body?.notes !== undefined) workout.notes = req.body.notes;
        if (req.body?.media !== undefined) workout.media = req.body.media;
        if (req.body?.exercises) {
            workout.exercises = sanitizeExerciseInput(req.body.exercises);
        }

        let calculatedVolume = 0;
        workout.exercises.forEach(ex => {
            (ex.sets || []).forEach(set => {
                if (set.completed && set.weight && set.reps) {
                    calculatedVolume += (Number(set.weight) * Number(set.reps));
                }
            });
        });
        workout.volume = req.body?.volume !== undefined ? Number(req.body.volume) : calculatedVolume;

        await workout.save();
        await workout.populate("exercises.exercise");

        // Check and record achievements for any new PRs set in this workout
        let achievements = [];
        try {
            achievements = await checkAndAwardWorkoutPRs(workout, req.user._id);
        } catch (achErr) {
            console.error("PR evaluation note:", achErr.message);
        }

        // Safely record progress records for completed sets with valid exercise references
        try {
            const records = workout.exercises.flatMap(item => {
                const exId = item.exercise?._id || item.exercise;
                if (!exId || !require("mongoose").Types.ObjectId.isValid(exId)) return [];
                return (item.sets || [])
                    .filter(set => set.completed)
                    .map(set => {
                        const w = Number(set.weight) || 0;
                        const r = Number(set.reps) || 0;
                        const oneRepMax = r === 1 ? w : (w > 0 && r > 0 ? Math.round((w * (1 + r / 30)) * 10) / 10 : 0);
                        return {
                            user: req.user._id,
                            exercise: exId,
                            weight: w,
                            reps: r,
                            oneRepMax,
                            volume: w * r,
                            distance: set.distance,
                            duration: set.duration,
                            sourceWorkout: workout._id,
                            date: workout.completedAt || new Date()
                        };
                    });
            });
            if (records.length) await Progress.insertMany(records);
        } catch (progressErr) {
            console.error("Progress recording note:", progressErr.message);
        }

        const responseObj = workout.toObject();
        responseObj.achievements = achievements;
        res.json(responseObj);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({
            _id: req.params.workoutId,
            user: req.user._id
        });
        if (!workout) return res.status(404).json({ error: "Workout not found" });

        // Clean up any progress records and achievements created for this workout
        await Progress.deleteMany({ sourceWorkout: req.params.workoutId, user: req.user._id });
        await Achievement.deleteMany({ sourceWorkout: req.params.workoutId, user: req.user._id });

        res.json({ message: "Workout deleted and associated achievements/progress removed" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    startWorkout,
    getWorkouts,
    getWorkout,
    updateWorkout,
    updateSet,
    completeWorkout,
    deleteWorkout
};
