const Workout = require("../models/workout");

const startWorkout = async (req, res) => {
    try {
        const workout = await Workout.create({
            ...req.body,
            status: "active"
        });

        res.status(201).json(workout);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const getWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(
            req.params.workoutId
        ).populate("exercises.exercise");

        res.json(workout);
    } catch (error) {
        res.status(404).json({
            error: "Workout not found"
        });
    }
};

const updateWorkout = async (req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(
            req.params.workoutId,
            req.body,
            { new: true }
        );

        res.json(workout);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const updateSet = async (req, res) => {
    try {
        const workout = await Workout.findById(
            req.params.workoutId
        );

        for (const exercise of workout.exercises) {
            const set = exercise.sets.id(req.params.setId);

            if (set) {
                Object.assign(set, req.body);
            }
        }

        await workout.save();

        res.json(workout);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const completeWorkout = async (req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(
            req.params.workoutId,
            {
                status: "completed",
                completedAt: new Date()
            },
            { new: true }
        );

        res.json(workout);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const deleteWorkout = async (req, res) => {
    try {
        await Workout.findByIdAndDelete(
            req.params.workoutId
        );

        res.json({
            message: "Workout discarded"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    startWorkout,
    getWorkout,
    updateWorkout,
    updateSet,
    completeWorkout,
    deleteWorkout
};