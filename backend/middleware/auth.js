const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ")
            ? header.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.userId).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ")
            ? header.slice(7)
            : null;

        if (token) {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(payload.userId).select("-password");
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently proceed if token is invalid or expired
    }
    next();
};

module.exports = { requireAuth, optionalAuth };
