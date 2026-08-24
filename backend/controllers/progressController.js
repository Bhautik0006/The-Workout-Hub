const Progress = require("../models/Progress");

const getProgress = async (req, res) => {
    try {
        const progress = await Progress.find({
            exercise: req.params.exerciseId
        }).sort({ date: -1 });

        res.json(progress);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const getProgressStats = async (req, res) => {
    try {
        const progress = await Progress.find({
            exercise: req.params.exerciseId
        });

        const maxWeight = progress.length
            ? Math.max(...progress.map(p => p.weight))
            : 0;

        const maxReps = progress.length
            ? Math.max(...progress.map(p => p.reps))
            : 0;

        res.json({
            totalRecords: progress.length,
            maxWeight,
            maxReps
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const getProgressHistory = async (req, res) => {
    try {
        const progress = await Progress.find({
            exercise: req.params.exerciseId
        }).sort({ date: 1 });

        res.json(progress);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getProgress,
    getProgressStats,
    getProgressHistory
};