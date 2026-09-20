const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        dob: Date,

        gender: {
            type: String,
            trim: true
        },

        height: {
            value: Number,
            unit: {
                type: String,
                enum: ["cm", "in"],
                default: "cm"
            }
        },

        weight: {
            value: Number,
            unit: {
                type: String,
                enum: ["kg", "lb"],
                default: "kg"
            }
        },

        bodyMeasurements: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);