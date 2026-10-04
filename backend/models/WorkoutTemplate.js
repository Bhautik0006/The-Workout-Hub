const mongoose = require("mongoose");
require("./Exercise");
require("./User");

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

        category: {
            type: String,
            default: "Full Body"
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
                        distance: Number,
                        duration: Number,
                        restSeconds: Number,
                        notes: String
                    }
                ],
                restSeconds: Number,
                notes: String,
                media: [
                    {
                        type: {
                            type: String,
                            enum: ["image", "video"]
                        },
                        url: String
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