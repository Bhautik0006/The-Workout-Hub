const Progress = require("../models/Progress");
const Exercise = require("../models/Exercise");
const Achievement = require("../models/Achievement");
const { checkAndAwardSinglePR } = require("../utils/achievementHelper");
require("../models/workout");

const calculateOneRepMax = (weight, reps) => {
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    // Standard Epley formula: 1RM = weight * (1 + reps / 30)
    return Math.round((w * (1 + r / 30)) * 10) / 10;
};

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

        const weight = Number(req.body.weight) || 0;
        const reps = Number(req.body.reps) || 0;
        const oneRepMax = req.body.oneRepMax !== undefined
            ? Number(req.body.oneRepMax)
            : calculateOneRepMax(weight, reps);
        const volume = req.body.volume !== undefined
            ? Number(req.body.volume)
            : (weight * reps);

        const progress = await Progress.create({
            ...req.body,
            weight,
            reps,
            oneRepMax,
            volume,
            user: req.user._id,
            date: req.body.date ? new Date(req.body.date) : new Date()
        });

        // Check if this performance breaks a PR and link to sourceProgress
        let achievements = [];
        try {
            achievements = await checkAndAwardSinglePR({
                userId: req.user._id,
                exerciseId: req.body.exercise,
                weight,
                reps,
                sourceWorkoutId: req.body.sourceWorkout || null,
                sourceProgressId: progress._id,
                date: progress.date
            });
        } catch (achErr) {
            console.error("PR check note:", achErr.message);
        }

        const resp = progress.toObject();
        resp.achievements = achievements;
        res.status(201).json(resp);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProgress = async (req, res) => {
    try {
        const progress = await Progress.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!progress) return res.status(404).json({ error: "Progress entry not found" });

        // Clean up any achievements created from this progress record
        await Achievement.deleteMany({ sourceProgress: progress._id, user: req.user._id });

        res.json({ message: "Progress entry deleted and associated achievement removed" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProgress = async (req, res) => {
    try {
        const progress = await Progress.find(exerciseFilter(req, req.params.exerciseId))
            .sort({ date: -1 })
            .populate("exercise")
            .populate("sourceWorkout", "name status completedAt");

        const normalized = progress.map(item => {
            const obj = item.toObject();
            if (!obj.oneRepMax || obj.oneRepMax === 0) {
                obj.oneRepMax = calculateOneRepMax(obj.weight, obj.reps);
            }
            if (!obj.volume || obj.volume === 0) {
                obj.volume = (Number(obj.weight) || 0) * (Number(obj.reps) || 0);
            }
            return obj;
        });

        res.json(normalized);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProgressStats = async (req, res) => {
    try {
        const progress = await Progress.find(exerciseFilter(req, req.params.exerciseId))
            .sort({ date: 1 });

        const totalRecords = progress.length;
        const maxWeight = totalRecords ? Math.max(...progress.map(item => item.weight || 0)) : 0;
        const maxReps = totalRecords ? Math.max(...progress.map(item => item.reps || 0)) : 0;
        const maxOneRepMax = totalRecords ? Math.max(...progress.map(item => {
            if (item.oneRepMax && item.oneRepMax > 0) return item.oneRepMax;
            return calculateOneRepMax(item.weight, item.reps);
        })) : 0;
        const totalVolume = progress.reduce((total, item) => {
            const vol = item.volume !== undefined && item.volume > 0
                ? item.volume
                : (Number(item.weight) || 0) * (Number(item.reps) || 0);
            return total + vol;
        }, 0);

        const firstEntry = progress[0];
        const lastEntry = progress[progress.length - 1];

        const first1RM = firstEntry ? (firstEntry.oneRepMax || calculateOneRepMax(firstEntry.weight, firstEntry.reps)) : 0;
        const last1RM = lastEntry ? (lastEntry.oneRepMax || calculateOneRepMax(lastEntry.weight, lastEntry.reps)) : 0;

        let improvementPct = 0;
        if (first1RM > 0 && maxOneRepMax > 0) {
            improvementPct = Math.round(((maxOneRepMax - first1RM) / first1RM) * 100);
        }

        res.json({
            totalRecords,
            maxWeight,
            maxReps,
            maxOneRepMax,
            totalVolume,
            first1RM,
            last1RM,
            improvementPct
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProgressHistory = async (req, res) => {
    try {
        const progress = await Progress.find(exerciseFilter(req, req.params.exerciseId))
            .sort({ date: 1 })
            .populate("sourceWorkout", "name status completedAt");

        const normalized = progress.map(item => {
            const obj = item.toObject();
            if (!obj.oneRepMax || obj.oneRepMax === 0) {
                obj.oneRepMax = calculateOneRepMax(obj.weight, obj.reps);
            }
            if (!obj.volume || obj.volume === 0) {
                obj.volume = (Number(obj.weight) || 0) * (Number(obj.reps) || 0);
            }
            return obj;
        });

        res.json(normalized);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    recordProgress,
    deleteProgress,
    getProgress,
    getProgressStats,
    getProgressHistory
};

