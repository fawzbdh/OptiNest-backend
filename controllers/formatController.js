const Format = require("../models").Format;

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all format
// @route   GET api/user/
// @access  Private
exports.getFormats = asyncHandler(async (req, res) => {
  const format = await Format.findAll();
  res.status(200).json({ results: format.length, data: format });
});

// @desc    Get specific Format by id
// @route   GET api/user/:id
// @access  Private
exports.getFormat = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the format by ID
  const format = await Format.findOne({ where: { id: id } });
  if (!format) {
    return next(new ApiError(`Format not found for this id ${id}`, 404));
  }

  // Return the format data along with the file count
  res.status(200).json({
    data: format,
  });
});

// @desc    Get formats by user ID
// @route   GET api/user/:userId
// @access  Private
exports.getFormatsByProjectId = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Fetch formats associated with the specified user ID
  const formats = await Format.findAll({ where: { ProjectId: projectId } });

  res.status(200).json({ results: formats.length, data: formats });
});

// @desc    Create a new Format
// @route   POST api/user/
// @access  Private
exports.createFormat = asyncHandler(async (req, res) => {
  const body = req.body;
  const format = await Format.create({
    nom: body.nom,
    hauteur: body.hauteur,
    largeur: body.largeur,
    priority: body.priority,
    quantity: body.quantity,
    ProjectId: body.ProjectId,
  });
  res.status(201).json({ data: format });
});
// @desc    Create multiple Formats
// @route   POST api/user/multiple
// @access  Private
exports.createMultipleFormat = asyncHandler(async (req, res) => {
  const formatsData = req.body.formatsData;
  const ProjectId = req.params.ProjectId;
  // Array to store the created formats
  const createdFormats = [];
  console.log("formatsData", formatsData);
  console.log("ProjectId", ProjectId);

  // Iterate over each format data and create a new format
  for (const formatData of formatsData) {
    const format = await Format.create({
      nom: formatData.name,
      hauteur: formatData.hauteur,
      largeur: formatData.largeur,
      quantity: formatData.quantity,
      ProjectId: ProjectId,
    });
    createdFormats.push(format);
  }

  res.status(201).json({ data: createdFormats });
});

// @desc    update specified Format,f velfk
// @route   PUT api/user/:id
// @access  Private
exports.updateFormat = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await Format.update(req.body, { where: { id: id } });

  const format = await Format.findOne({ where: { id: id } });

  res.status(200).json({ data: format });
});
exports.updateMultipleFormats = asyncHandler(async (req, res, next) => {
  const formats = req.body; // Assume body contains an array of format objects

  if (!Array.isArray(formats)) {
    return res.status(400).json({ message: 'Invalid data format. Expected an array of formats.' });
  }

  const updatedFormats = [];

  for (const formatData of formats) {
    const { id, ...updateData } = formatData;

    await Format.update(updateData, { where: { id } });

    const updatedFormat = await Format.findOne({ where: { id } });

    if (updatedFormat) {
      updatedFormats.push(updatedFormat);
    }
  }

  res.status(200).json({ data: updatedFormats });
});
// @desc    delete specified format
// @route   DELETE api/user/:id
// @access  Private
exports.deleteFormat = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const format = await Format.findByPk(id);
  if (!format) {
    return next(new ApiError(`Aucun format pour cet ID ${id}`, 404));
  } else {
    const deletedFormat = { ...format.toJSON() };

    await Format.destroy({ where: { id: id } });
    res.status(200).json({ data: deletedFormat });
  }
});
