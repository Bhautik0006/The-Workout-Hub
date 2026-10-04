const Achievement = require("../models/Achievement");
const Progress = require("../models/Progress");
const Exercise = require("../models/Exercise");

const calculateOneRepMax = (weight, reps) => {
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round((w * (1 + r / 30)) * 10) / 10;
};

/**
 * Check and record achievements for a single set/progress entry
 */
const checkAndAwardSinglePR = async ({
    userId,
    exerciseId,
    weight,
    reps,
    sourceWorkoutId = null,
    sourceProgressId = null,
    date = new Date()
}) => {
    try {
        const w = Number(weight) || 0;
        const r = Number(reps) || 0;
        if (w <= 0 || r <= 0) return [];

        const current1RM = calculateOneRepMax(w, r);
        const exercise = await Exercise.findById(exerciseId).select("name");
        const exerciseName = exercise?.name || "Exercise";

        // Find all historical progress for this exercise (excluding current workout if specified)
        const query = {
            user: userId,
            exercise: exerciseId
        };
        if (sourceWorkoutId) {
            query.sourceWorkout = { $ne: sourceWorkoutId };
        }
        if (sourceProgressId) {
            query._id = { $ne: sourceProgressId };
        }

        const pastRecords = await Progress.find(query);

        let prevMax1RM = 0;
        let prevMaxWeight = 0;

        pastRecords.forEach(rec => {
            const pw = Number(rec.weight) || 0;
            const pr = Number(rec.reps) || 0;
            const p1rm = rec.oneRepMax && rec.oneRepMax > 0 ? rec.oneRepMax : calculateOneRepMax(pw, pr);
            if (p1rm > prevMax1RM) prevMax1RM = p1rm;
            if (pw > prevMaxWeight) prevMaxWeight = pw;
        });

        const newAchievements = [];

        // Check 1 Rep Max PR
        if (current1RM > 0 && (pastRecords.length === 0 || current1RM > prevMax1RM)) {
            const improvement = prevMax1RM > 0 ? Math.round((current1RM - prevMax1RM) * 10) / 10 : 0;
            const ach = await Achievement.create({
                user: userId,
                type: "PR_1RM",
                title: "New 1 Rep Max Record!",
                description: prevMax1RM > 0
                    ? `Crushed a new estimated 1RM of ${current1RM} kg (+${improvement} kg over previous record)!`
                    : `Established first 1RM record of ${current1RM} kg!`,
                exercise: exerciseId,
                exerciseName,
                metric: "oneRepMax",
                value: current1RM,
                previousValue: prevMax1RM,
                improvement,
                weight: w,
                reps: r,
                sourceWorkout: sourceWorkoutId,
                sourceProgress: sourceProgressId,
                date
            });
            newAchievements.push(ach);
        }

        // Check Max Weight PR (if distinct and heavier than past max weight)
        if (w > 0 && prevMaxWeight > 0 && w > prevMaxWeight) {
            const improvement = Math.round((w - prevMaxWeight) * 10) / 10;
            const ach = await Achievement.create({
                user: userId,
                type: "PR_WEIGHT",
                title: "New Heaviest Lift!",
                description: `Lifted ${w} kg for ${r} ${r === 1 ? "rep" : "reps"} (+${improvement} kg heavier than previous record)!`,
                exercise: exerciseId,
                exerciseName,
                metric: "weight",
                value: w,
                previousValue: prevMaxWeight,
                improvement,
                weight: w,
                reps: r,
                sourceWorkout: sourceWorkoutId,
                sourceProgress: sourceProgressId,
                date
            });
            newAchievements.push(ach);
        }

        return newAchievements;
    } catch (err) {
        console.error("Error evaluating single PR:", err.message);
        return [];
    }
};

/**
 * Check and record achievements for completed workout session
 */
const checkAndAwardWorkoutPRs = async (workout, userId) => {
    try {
        if (!workout || !workout.exercises || !workout.exercises.length) return [];

        const achievements = [];

        for (const item of workout.exercises) {
            const exerciseId = item.exercise?._id || item.exercise;
            if (!exerciseId) continue;

            const completedSets = (item.sets || []).filter(s => s.completed && Number(s.weight) > 0 && Number(s.reps) > 0);
            if (!completedSets.length) continue;

            // Find peak 1RM and peak weight performed in this workout for this exercise
            let peak1RM = 0;
            let peakWeight = 0;
            let peak1RMSet = null;
            let peakWeightSet = null;

            completedSets.forEach(set => {
                const w = Number(set.weight) || 0;
                const r = Number(set.reps) || 0;
                const orm = calculateOneRepMax(w, r);
                if (orm > peak1RM) {
                    peak1RM = orm;
                    peak1RMSet = { weight: w, reps: r };
                }
                if (w > peakWeight) {
                    peakWeight = w;
                    peakWeightSet = { weight: w, reps: r };
                }
            });

            // Find prior progress records for this user and exercise (excluding this workout)
            const pastRecords = await Progress.find({
                user: userId,
                exercise: exerciseId,
                sourceWorkout: { $ne: workout._id }
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

            const exercise = await Exercise.findById(exerciseId).select("name");
            const exerciseName = exercise?.name || item.exercise?.name || "Exercise";

            // If beaten prior 1RM
            if (peak1RM > 0 && (pastRecords.length === 0 || peak1RM > prevMax1RM)) {
                const improvement = prevMax1RM > 0 ? Math.round((peak1RM - prevMax1RM) * 10) / 10 : 0;
                const ach = await Achievement.create({
                    user: userId,
                    type: "PR_1RM",
                    title: "New 1 Rep Max Record!",
                    description: prevMax1RM > 0
                        ? `Crushed a new estimated 1RM of ${peak1RM} kg (+${improvement} kg over previous record)!`
                        : `Established first 1RM record of ${peak1RM} kg!`,
                    exercise: exerciseId,
                    exerciseName,
                    metric: "oneRepMax",
                    value: peak1RM,
                    previousValue: prevMax1RM,
                    improvement,
                    weight: peak1RMSet?.weight || 0,
                    reps: peak1RMSet?.reps || 0,
                    sourceWorkout: workout._id,
                    date: workout.completedAt || new Date()
                });
                achievements.push(ach);
            }

            // If beaten prior heaviest weight (and not already identical 1-rep scenario)
            if (peakWeight > 0 && prevMaxWeight > 0 && peakWeight > prevMaxWeight) {
                const improvement = Math.round((peakWeight - prevMaxWeight) * 10) / 10;
                const ach = await Achievement.create({
                    user: userId,
                    type: "PR_WEIGHT",
                    title: "New Heaviest Lift!",
                    description: `Lifted ${peakWeight} kg for ${peakWeightSet?.reps || 1} reps (+${improvement} kg heavier than previous best)!`,
                    exercise: exerciseId,
                    exerciseName,
                    metric: "weight",
                    value: peakWeight,
                    previousValue: prevMaxWeight,
                    improvement,
                    weight: peakWeight,
                    reps: peakWeightSet?.reps || 1,
                    sourceWorkout: workout._id,
                    date: workout.completedAt || new Date()
                });
                achievements.push(ach);
            }
        }

        return achievements;
    } catch (err) {
        console.error("Error evaluating workout PRs:", err.message);
        return [];
    }
};

module.exports = {
    calculateOneRepMax,
    checkAndAwardSinglePR,
    checkAndAwardWorkoutPRs
};
