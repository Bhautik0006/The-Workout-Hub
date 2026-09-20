const Share = require("../models/Share");
const User = require("../models/User");
const Workout = require("../models/workout");
const Progress = require("../models/Progress");

const findRecipient = async ({ toUserId, username, email }) => {
    if (toUserId) return User.findById(toUserId);
    if (username) return User.findOne({ username: username.toLowerCase() });
    if (email) return User.findOne({ email: email.toLowerCase() });
    return null;
};

const createShare = async (req, res) => {
    try {
        const recipient = await findRecipient(req.body);
        if (!recipient) return res.status(404).json({ error: "Recipient user not found" });
        if (recipient._id.equals(req.user._id)) {
            return res.status(400).json({ error: "You cannot share with yourself" });
        }

        const type = req.params.type;
        if (!["workout", "progress"].includes(type)) {
            return res.status(400).json({ error: "Invalid share type" });
        }

        let workout = null;
        if (type === "workout") {
            workout = await Workout.findOne({
                _id: req.body.workoutId,
                user: req.user._id
            });
            if (!workout) return res.status(404).json({ error: "Workout not found" });
        }

        const share = await Share.findOneAndUpdate(
            {
                fromUser: req.user._id,
                toUser: recipient._id,
                type,
                ...(workout ? { workout: workout._id } : {})
            },
            {
                fromUser: req.user._id,
                toUser: recipient._id,
                type,
                workout: workout ? workout._id : null,
                status: "active"
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(share);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getInbox = async (req, res) => {
    try {
        const shares = await Share.find({ toUser: req.user._id, status: "active" })
            .populate("fromUser", "name username")
            .populate({ path: "workout", populate: { path: "exercises.exercise" } })
            .sort({ createdAt: -1 });
        res.json(shares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSharedWorkout = async (req, res) => {
    try {
        const share = await Share.findOne({
            _id: req.params.shareId,
            toUser: req.user._id,
            type: "workout",
            status: "active"
        }).populate({ path: "workout", populate: { path: "exercises.exercise" } });
        if (!share || !share.workout) return res.status(404).json({ error: "Shared workout not found" });
        res.json(share.workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const revokeShare = async (req, res) => {
    try {
        const share = await Share.findOneAndUpdate(
            { _id: req.params.shareId, fromUser: req.user._id },
            { status: "revoked" },
            { new: true }
        );
        if (!share) return res.status(404).json({ error: "Share not found" });
        res.json(share);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPermittedWorkouts = async (req, res) => {
    try {
        const permission = await Share.exists({
            fromUser: req.params.userId,
            toUser: req.user._id,
            type: "progress",
            status: "active"
        });
        if (!permission) return res.status(403).json({ error: "Progress permission not granted" });
        const workouts = await Workout.find({ user: req.params.userId })
            .sort({ startedAt: -1 })
            .populate("exercises.exercise");
        res.json(workouts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPermittedProgress = async (req, res) => {
    try {
        const permission = await Share.exists({
            fromUser: req.params.userId,
            toUser: req.user._id,
            type: "progress",
            status: "active"
        });
        if (!permission) return res.status(403).json({ error: "Progress permission not granted" });
        const progress = await Progress.find({
            user: req.params.userId,
            exercise: req.params.exerciseId
        }).sort({ date: -1 }).populate("exercise");
        res.json(progress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createShare,
    getInbox,
    getSharedWorkout,
    revokeShare,
    getPermittedWorkouts,
    getPermittedProgress
};
