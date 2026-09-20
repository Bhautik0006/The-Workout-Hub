const Exercise = require("../models/Exercise");

const getExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find({
            $or: [{ isCustom: false }, { createdBy: req.user._id }]
        }).sort({ name: 1 });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createExercise = async (req, res) => {
    try {
        const exercise = await Exercise.create({
            ...req.body,
            isCustom: true,
            createdBy: req.user._id
        });
        res.status(201).json(exercise);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findOneAndUpdate(
            { _id: req.params.exerciseId, createdBy: req.user._id, isCustom: true },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!exercise) return res.status(404).json({ error: "Custom exercise not found" });
        res.json(exercise);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findOneAndDelete({
            _id: req.params.exerciseId,
            createdBy: req.user._id,
            isCustom: true
        });
        if (!exercise) return res.status(404).json({ error: "Custom exercise not found" });
        res.json({ message: "Exercise deleted" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise
};
