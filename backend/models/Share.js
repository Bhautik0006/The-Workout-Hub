const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
    {
        workout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workout",
            default: null
        },

        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["workout", "progress"],
            required: true
        },

        status: {
            type: String,
            enum: ["active", "revoked"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Share", shareSchema);