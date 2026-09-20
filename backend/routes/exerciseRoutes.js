const express = require("express");

const {
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise
} = require("../controllers/exerciseController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getExercises);
router.post("/", createExercise);
router.put("/:exerciseId", updateExercise);
router.delete("/:exerciseId", deleteExercise);

module.exports = router;