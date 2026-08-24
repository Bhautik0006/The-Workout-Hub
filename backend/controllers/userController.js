const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
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
    logoutUser
};