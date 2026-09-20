const WorkoutTemplate = require("../models/WorkoutTemplate");

const getOwnedTemplate = (templateId, userId) => WorkoutTemplate.findOne({
    _id: templateId,
    user: userId
});

const createTemplate = async (req, res) => {
    try {
        const template = await WorkoutTemplate.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getTemplates = async (req, res) => {
    try {
        const templates = await WorkoutTemplate.find({ user: req.user._id })
            .populate("exercises.exercise");
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTemplate = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findOneAndUpdate(
            { _id: req.params.templateId, user: req.user._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findOneAndDelete({
            _id: req.params.templateId,
            user: req.user._id
        });
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.json({ message: "Template deleted" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const addExercise = async (req, res) => {
    try {
        const template = await getOwnedTemplate(req.params.templateId, req.user._id);
        if (!template) return res.status(404).json({ error: "Template not found" });
        template.exercises.push(req.body);
        await template.save();
        res.json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const addSets = async (req, res) => {
    try {
        const template = await getOwnedTemplate(req.params.templateId, req.user._id);
        if (!template) return res.status(404).json({ error: "Template not found" });
        const exercise = template.exercises.id(req.params.exerciseId);
        if (!exercise) return res.status(404).json({ error: "Template exercise not found" });
        exercise.sets.push(req.body);
        await template.save();
        res.json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createTemplate,
    getTemplates,
    updateTemplate,
    deleteTemplate,
    addExercise,
    addSets
};
