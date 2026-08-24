const express = require("express");

const {
    startWorkout,
    getWorkout,
    updateWorkout,
    updateSet,
    completeWorkout,
    deleteWorkout
} = require("../controllers/workoutController");

const router = express.Router();

router.post("/", startWorkout);

router.get("/:workoutId", getWorkout);

router.put("/:workoutId", updateWorkout);

router.put(
    "/:workoutId/sets/:setId",
    updateSet
);

router.post(
    "/:workoutId/complete",
    completeWorkout
);

router.delete(
    "/:workoutId",
    deleteWorkout
);

module.exports = router;