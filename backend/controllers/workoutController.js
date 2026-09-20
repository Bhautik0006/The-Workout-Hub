const Workout = require("../models/workout");
const WorkoutTemplate = require("../models/WorkoutTemplate");
const Progress = require("../models/Progress");

const getOwnedWorkout = (workoutId, userId) => Workout.findOne({
    _id: workoutId,
    user: userId
});

const startWorkout = async (req, res) => {
    try {
        let exercises = req.body.exercises || [];
        let name = req.body.name;
        let template = null;

        if (req.body.template) {
            template = await WorkoutTemplate.findOne({
                _id: req.body.template,
                user: req.user._id
            });
            if (!template) return res.status(404).json({ error: "Template not found" });
            exercises = template.exercises.map(item => item.toObject());
            name = name || template.name;
        }

        if (!name) return res.status(400).json({ error: "Workout name is required" });

        const workout = await Workout.create({
            ...req.body,
            user: req.user._id,
            template: template ? template._id : null,
            name,
            exercises,
            status: "active"
        });
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
        const allowed = ["name", "notes", "exercises", "startedAt"];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowed.includes(key))
        );
        const workout = await Workout.findOneAndUpdate(
            { _id: req.params.workoutId, user: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!workout) return res.status(404).json({ error: "Workout not found" });
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
        workout.completedAt = new Date();
        await workout.save();

        const records = workout.exercises.flatMap(item => item.sets
            .filter(set => set.completed && item.exercise)
            .map(set => ({
                user: req.user._id,
                exercise: item.exercise,
                weight: set.weight || 0,
                reps: set.reps || 0,
                distance: set.distance,
                duration: set.duration,
                sourceWorkout: workout._id
            }))
        );
        if (records.length) await Progress.insertMany(records);
        res.json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({
            _id: req.params.workoutId,
            user: req.user._id,
            status: "active"
        });
        if (!workout) return res.status(404).json({ error: "Active workout not found" });
        res.json({ message: "Workout discarded" });
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
