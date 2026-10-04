const Achievement = require("../models/Achievement");
const Progress = require("../models/Progress");
const { calculateOneRepMax } = require("../utils/achievementHelper");

const getAchievements = async (req, res) => {
    try {
        const query = { user: req.user._id };
        if (req.query.exerciseId) {
            query.exercise = req.query.exerciseId;
        }
        if (req.query.type) {
            query.type = req.query.type;
        }

        const limit = parseInt(req.query.limit, 10) || 50;

        const achievements = await Achievement.find(query)
            .sort({ date: -1 })
            .limit(limit)
            .populate("exercise", "name muscleGroup equipment media")
            .populate("sourceWorkout", "name status completedAt");

        res.json(achievements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAchievementStats = async (req, res) => {
    try {
        const achievements = await Achievement.find({ user: req.user._id }).sort({ date: -1 });
        const total = achievements.length;
        const unviewed = achievements.filter(a => !a.viewed).length;
        const latest = achievements[0] || null;

        // Group by exercise
        const exerciseMap = {};
        achievements.forEach(a => {
            const exName = a.exerciseName || "Exercise";
            if (!exerciseMap[exName]) exerciseMap[exName] = 0;
            exerciseMap[exName]++;
        });

        res.json({
            total,
            unviewed,
            latest,
            byExercise: exerciseMap
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const markViewed = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === "all") {
            await Achievement.updateMany({ user: req.user._id, viewed: false }, { viewed: true });
            return res.json({ success: true, message: "All achievements marked as viewed" });
        }

        const ach = await Achievement.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { viewed: true },
            { new: true }
        );
        if (!ach) return res.status(404).json({ error: "Achievement not found" });
        res.json(ach);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const checkPotentialPR = async (req, res) => {
    try {
        const { exerciseId, weight, reps } = req.body;
        const w = Number(weight) || 0;
        const r = Number(reps) || 0;
        if (!exerciseId || w <= 0 || r <= 0) {
            return res.json({ isPR: false });
        }

        const current1RM = calculateOneRepMax(w, r);

        const pastRecords = await Progress.find({
            user: req.user._id,
            exercise: exerciseId
        });

        let prevMax1RM = 0;
        let prevMaxWeight = 0;

        pastRecords.forEach(rec => {
            const pw = Number(rec.weight) || 0;
            const pr = Number(rec.reps) || 0;
            const p1rm = rec.oneRepMax && rec.oneRepMax > 0 ? rec.oneRepMax : calculateOneRepMax(pw, pr);
            if (p1rm > prevMax1RM) prevMax1RM = p1rm;
            if (pw > prevMaxWeight) prevMaxWeight = pw;
        });

        const is1RMPR = current1RM > prevMax1RM;
        const isWeightPR = prevMaxWeight > 0 && w > prevMaxWeight;

        res.json({
            isPR: is1RMPR || isWeightPR,
            is1RMPR,
            isWeightPR,
            current1RM,
            prevMax1RM,
            prevMaxWeight,
            improvement1RM: prevMax1RM > 0 && is1RMPR ? Math.round((current1RM - prevMax1RM) * 10) / 10 : 0,
            improvementWeight: prevMaxWeight > 0 && isWeightPR ? Math.round((w - prevMaxWeight) * 10) / 10 : 0
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAchievements,
    getAchievementStats,
    markViewed,
    checkPotentialPR
};
