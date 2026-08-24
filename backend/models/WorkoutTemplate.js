const mongoose = require("mongoose");

const workoutTemplateSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
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
                        weight: Number
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "WorkoutTemplate",
    workoutTemplateSchema
);