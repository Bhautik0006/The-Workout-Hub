const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
    {
        workout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workout",
            required: true
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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Share", shareSchema);