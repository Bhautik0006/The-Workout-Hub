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
            required: true
        },

        reps: {
            type: Number,
            required: true
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