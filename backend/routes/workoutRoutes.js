const express = require("express");

const {
    startWorkout,
    getWorkouts,
    getWorkout,
    updateWorkout,
    updateSet,
    completeWorkout,
    deleteWorkout
} = require("../controllers/workoutController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.post("/", startWorkout);
router.get("/", getWorkouts);

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