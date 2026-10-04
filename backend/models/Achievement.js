const mongoose = require("mongoose");
require("./Exercise");
require("./User");

const achievementSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["PR_1RM", "PR_WEIGHT", "PR_VOLUME", "MILESTONE"],
            default: "PR_1RM"
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
            index: true
        },
        exerciseName: {
            type: String,
            default: ""
        },
        metric: {
            type: String,
            enum: ["oneRepMax", "weight", "volume"],
            default: "oneRepMax"
        },
        value: {
            type: Number,
            required: true
        },
        previousValue: {
            type: Number,
            default: 0
        },
        improvement: {
            type: Number,
            default: 0
        },
        weight: {
            type: Number,
            default: 0
        },
        reps: {
            type: Number,
            default: 0
        },
        sourceWorkout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workout",
            default: null
        },
        sourceProgress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Progress",
            default: null
        },
        date: {
            type: Date,
            default: Date.now
        },
        viewed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Achievement", achievementSchema);
