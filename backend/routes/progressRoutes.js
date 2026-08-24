const express = require("express");

const {
    getProgress,
    getProgressStats,
    getProgressHistory
} = require("../controllers/progressController");

const router = express.Router();

router.get("/:exerciseId", getProgress);

router.get(
    "/:exerciseId/stats",
    getProgressStats
);

router.get(
    "/:exerciseId/history",
    getProgressHistory
);

module.exports = router;