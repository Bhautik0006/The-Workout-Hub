const express = require("express");

const {
    recordProgress,
    getProgress,
    getProgressStats,
    getProgressHistory
} = require("../controllers/progressController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.post("/", recordProgress);

router.get(
    "/:exerciseId/stats",
    getProgressStats
);

router.get(
    "/:exerciseId/history",
    getProgressHistory
);

router.get("/:exerciseId", getProgress);

module.exports = router;