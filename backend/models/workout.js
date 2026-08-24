const mongoose = require("mongoose");

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

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active"
        },

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