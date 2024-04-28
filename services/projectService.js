const Project = require("../models").Project;
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all project
// @route   GET api/user/
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
  const project = await Project.findAll();
  res.status(200).json({ results: project.length, data: project });
});

// @desc    Get specific Project by id
// @route   GET api/user/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findOne({ where: { id: id } });
  if (!project) {
    return next(new ApiError(`Project not found for this id ${id}`, 404));
  }
  res.status(200).json({ data: project });
});
// @desc    Get projects by user ID
// @route   GET api/user/:userId
// @access  Private
exports.getProjectsByUserId = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Fetch projects associated with the specified user ID
  const projects = await Project.findAll({ where: { UserId: userId } });

  res.status(200).json({ results: projects.length, data: projects });
});

// @desc    Create a new Project
// @route   POST api/user/
// @access  Private
exports.createProject = asyncHandler(async (req, res) => {
  const body = req.body;
  const userId = req.user.id;
    const project = await Project.create({
      name: body.name ?? "",
      steps: 0,
      status: "Ebauche",
      UserId: userId,
    });
    res.status(201).json({ data: project });
});

// @desc    update specified Project
// @route   PUT api/user/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.update(req.body, { where: { id: id } });
  res.status(200).json({ message: true });
});

// @desc    delete specified project
// @route   DELETE api/user/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletes = await Project.destroy({ where: { id: id } });
  res.status(204).send();
});
