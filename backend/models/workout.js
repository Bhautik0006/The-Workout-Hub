const mongoose = require("mongoose");
require("./Exercise");
require("./User");
require("./WorkoutTemplate");

const workoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        template: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkoutTemplate",
            default: null
        },

        name: {
            type: String,
            required: true
        },

        notes: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active"
        },

        duration: {
            type: Number,
            default: 0
        },

        volume: {
            type: Number,
            default: 0
        },

        media: [
            {
                type: {
                    type: String,
                    enum: ["image", "video"],
                    default: "image"
                },
                url: String
            }
        ],

        exercises: [
            {
                exercise: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Exercise"
                },

                sets: [
                    {
                        reps: Number,
                        weight: Number,
                        distance: Number,
                        duration: Number,
                        restSeconds: Number,
                        notes: String,
                        completed: {
                            type: Boolean,
                            default: false
                        }
                    }
                ]
            }
        ],

        startedAt: {
            type: Date,
            default: Date.now
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Workout", workoutSchema);