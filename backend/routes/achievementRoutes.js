const express = require("express");
const {
    getAchievements,
    getAchievementStats,
    markViewed,
    checkPotentialPR
} = require("../controllers/achievementController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getAchievements);
router.get("/stats", getAchievementStats);
router.post("/check", checkPotentialPR);
router.post("/:id/view", markViewed);
router.patch("/:id/view", markViewed);

module.exports = router;
