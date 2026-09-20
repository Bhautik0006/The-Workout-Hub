const express = require("express");
const {
    createShare,
    getInbox,
    getSharedWorkout,
    revokeShare,
    getPermittedWorkouts,
    getPermittedProgress
} = require("../controllers/shareController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/inbox", getInbox);
router.post("/:type", createShare);
router.get("/workout/:shareId", getSharedWorkout);
router.delete("/:shareId", revokeShare);
router.get("/users/:userId/workouts", getPermittedWorkouts);
router.get("/users/:userId/progress/:exerciseId", getPermittedProgress);

module.exports = router;
