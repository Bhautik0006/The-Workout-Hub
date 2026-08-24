const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        muscleGroup: {
            type: String,
            required: true
        },

        equipment: {
            type: String,
            default: ""
        },

        isCustom: {
            type: Boolean,
            default: false
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Exercise", exerciseSchema);