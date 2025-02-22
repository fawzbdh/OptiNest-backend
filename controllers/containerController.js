const Container = require("../models").Container;
const Fichier = require("../models").Fichier;

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all container
// @route   GET api/user/
// @access  Private
exports.getContainers = asyncHandler(async (req, res) => {
  const container = await Container.findAll();
  res.status(200).json({ results: container.length, data: container });
});

// @desc    Get specific Container by id
// @route   GET api/user/:id
// @access  Private
exports.getContainer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the container by ID
  const container = await Container.findOne({ where: { id: id } });
  if (!container) {
    return next(new ApiError(`Container not found for this id ${id}`, 404));
  }


  // Return the container data along with the file count
  res.status(200).json({
    data: container,
  });
});

// @desc    Get containers by user ID
// @route   GET api/user/:userId
// @access  Private
exports.getContainersByProjectId = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Fetch containers associated with the specified user ID
  const containers = await Container.findAll({ where: { ProjectId : projectId } });

  res.status(200).json({ results: containers.length, data: containers });
});

// @desc    Create a new Container
// @route   POST api/user/
// @access  Private
exports.createContainer = asyncHandler(async (req, res) => {
  const body = req.body;
  const container = await Container.create({
    x: body.x,
    y: body.y ,
    vertical: body.vertical ,
    ProjectId: body.ProjectId,
  });
  res.status(201).json({ data: container });
});

// @desc    update specified Container
// @route   PUT api/user/:id
// @access  Private
exports.updateContainer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await Container.update(req.body, { where: { id: id } });

  const container = await Container.findOne({ where: { id: id } });

  res.status(200).json({ data: container });
});

// @desc    delete specified container
// @route   DELETE api/user/:id
// @access  Private
exports.deleteContainer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const container = await Container.findByPk(id);
  if (!container) {
    return next(new ApiError(`Aucun container pour cet ID ${id}`, 404));
  } else {
    const deletedContainer = { ...container.toJSON() };

    await Container.destroy({ where: { id: id } });
    res.status(200).json({ data: deletedContainer });
  }
});
