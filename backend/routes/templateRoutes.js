const express = require("express");

const {
    createTemplate,
    getTemplates,
    updateTemplate,
    deleteTemplate,
    addExercise,
    addSets
} = require("../controllers/templateController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.post("/", createTemplate);
router.get("/", getTemplates);
router.put("/:templateId", updateTemplate);
router.delete("/:templateId", deleteTemplate);

router.post("/:templateId/exercises", addExercise);

router.post(
    "/:templateId/exercises/:exerciseId/sets",
    addSets
);

module.exports = router;