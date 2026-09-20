const Progress = require("../models/Progress");
const Exercise = require("../models/Exercise");

const exerciseFilter = (req, exerciseId) => ({
    exercise: exerciseId,
    user: req.user._id
});

const recordProgress = async (req, res) => {
    try {
        const exercise = await Exercise.findOne({
            _id: req.body.exercise,
            $or: [{ isCustom: false }, { createdBy: req.user._id }]
        });
        if (!exercise) return res.status(404).json({ error: "Exercise not found" });
        const progress = await Progress.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json(progress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProgress = async (req, res) => {
    try {
        const progress = await Progress.find(exerciseFilter(req, req.params.exerciseId))
            .sort({ date: -1 })
            .populate("exercise");
        res.json(progress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProgressStats = async (req, res) => {
    try {
        const progress = await Progress.find(exerciseFilter(req, req.params.exerciseId));
        const maxWeight = progress.length ? Math.max(...progress.map(item => item.weight || 0)) : 0;
        const maxReps = progress.length ? Math.max(...progress.map(item => item.reps || 0)) : 0;
        const maxDistance = progress.length ? Math.max(...progress.map(item => item.distance || 0)) : 0;
        const totalDuration = progress.reduce((total, item) => total + (item.duration || 0), 0);
        res.json({
            totalRecords: progress.length,
            maxWeight,
            maxReps,
            maxDistance,
            totalDuration
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProgressHistory = async (req, res) => {
    try {
        const progress = await Progress.find(exerciseFilter(req, req.params.exerciseId))
            .sort({ date: 1 });
        res.json(progress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    recordProgress,
    getProgress,
    getProgressStats,
    getProgressHistory
};
