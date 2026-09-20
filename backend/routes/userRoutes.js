const express = require("express");

const {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getProfile);
router.put("/me", requireAuth, updateProfile);

module.exports = router;