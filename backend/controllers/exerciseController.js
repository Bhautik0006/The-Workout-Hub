const Exercise = require("../models/Exercise");

const getExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find();

        res.json(exercises);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const createExercise = async (req, res) => {
    try {
        const exercise = await Exercise.create(req.body);

        res.status(201).json(exercise);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const updateExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findByIdAndUpdate(
            req.params.exerciseId,
            req.body,
            { new: true }
        );

        res.json(exercise);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const deleteExercise = async (req, res) => {
    try {
        await Exercise.findByIdAndDelete(
            req.params.exerciseId
        );

        res.json({
            message: "Exercise deleted"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise
};