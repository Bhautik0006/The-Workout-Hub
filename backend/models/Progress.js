const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true
        },

        weight: {
            type: Number,
            default: 0
        },

        reps: {
            type: Number,
            default: 0
        },

        distance: Number,

        duration: Number,

        sourceWorkout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workout",
            default: null
        },

        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Progress", progressSchema);