const Project = require("../models").Project;
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all project
// @route   GET api/zonetravail/
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  const project = await Project.findAll();
  res.status(200).json({ results: project.length, data: project });
});

// @desc    Get specific Project by id
// @route   GET api/zonetravail/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findOne({ where: { id: id } });
  if (!project) {
    return next(new ApiError(`Project not found for this id ${id}`, 404));
  }
  res.status(200).json({ data: project });
});

// @desc    Create a new Project
// @route   POST api/zonetravail/
// @access  Private
exports.createProject = asyncHandler(async (req, res) => {
  const body = req.body;
  const project = await Project.create({
    name: body.name ?? "",
    steps: 0,
    status: "Ebauche",
    userId: req.user.id,
  });
  res.status(201).json({ data: project });
});

// @desc    update specified Project
// @route   PUT api/zonetravail/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.update(req.body, { where: { id: id } });
  res.status(200).json({ message: true });
});

// @desc    delete specified project
// @route   DELETE api/zonetravail/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletes = await Project.destroy({ where: { id: id } });
  res.status(204).send();
});
