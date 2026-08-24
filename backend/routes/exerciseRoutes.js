const express = require("express");

const {
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise
} = require("../controllers/exerciseController");

const router = express.Router();

router.get("/", getExercises);
router.post("/", createExercise);
router.put("/:exerciseId", updateExercise);
router.delete("/:exerciseId", deleteExercise);

module.exports = router;