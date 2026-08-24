const WorkoutTemplate = require("../models/WorkoutTemplate");

const createTemplate = async (req, res) => {
    try {
        const template = await WorkoutTemplate.create(req.body);

        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const getTemplates = async (req, res) => {
    try {
        const templates = await WorkoutTemplate.find()
            .populate("exercises.exercise");

        res.json(templates);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const updateTemplate = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findByIdAndUpdate(
            req.params.templateId,
            req.body,
            { new: true }
        );

        res.json(template);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        await WorkoutTemplate.findByIdAndDelete(
            req.params.templateId
        );

        res.json({
            message: "Template deleted"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const addExercise = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findById(
            req.params.templateId
        );

        template.exercises.push(req.body);

        await template.save();

        res.json(template);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const addSets = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findById(
            req.params.templateId
        );

        const exercise = template.exercises.id(
            req.params.exerciseId
        );

        exercise.sets.push(req.body);

        await template.save();

        res.json(template);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
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