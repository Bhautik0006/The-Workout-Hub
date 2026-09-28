const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = userId => jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

const publicUser = user => {
    const result = user.toObject ? user.toObject() : { ...user };
    delete result.password;
    return result;
};

const registerUser = async (req, res) => {
    console.log("BODY:", req.body);
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                error: "Request body is missing. Send JSON with Content-Type: application/json"
            });
        }

        const { name, username, email, password, dob, gender, height, weight, bodyMeasurements } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ error: "Name, username, and password are required" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            username,
            email,
            password: passwordHash,
            dob,
            gender,
            height,
            weight,
            bodyMeasurements
        });

        res.status(201).json({ user: publicUser(user), token: createToken(user._id.toString()) });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                error: "Request body is missing. Send JSON with Content-Type: application/json"
            });
        }

        const { username, email, password } = req.body;

        const user = await User.findOne(username ? { username } : { email }).select("+password");

        if (!user || !(await bcrypt.compare(password || "", user.password))) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: publicUser(user),
            token: createToken(user._id.toString())
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
    try {
        const allowed = ["name", "dob", "gender", "height", "weight", "bodyMeasurements"];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowed.includes(key))
        );
        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        }).select("-password");
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const logoutUser = async (req, res) => {
    res.json({
        message: "Logout successful"
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile
};