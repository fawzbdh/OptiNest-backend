const Feedback = require("../models").Feedback;
const User = require("../models").User;

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all feedback
// @route   GET api/feedback/
// @access  Private
exports.getFeedbacks = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findAll();
  res.status(200).json({ results: feedback.length, data: feedback });
});

// @desc    Get specific Feedback by id
// @route   GET api/feedback/:id
// @access  Private
exports.getFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the feedback by ID
  const feedback = await Feedback.findOne({ where: { id: id } });
  if (!feedback) {
    return next(new ApiError(`Feedback not found for this id ${id}`, 404));
  }

  // Return the feedback data along with the file count
  res.status(200).json({
    data: feedback,
  });
});

// @desc    Get feedbacks by user ID
// @route   GET api/feedback/:userId
// @access  Private
exports.getFeedbacksByProjectId = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Fetch feedbacks associated with the specified user ID
  const feedbacks = await Feedback.findAll({
    where: { ProjectId: projectId },
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
  });

  res.status(200).json({ results: feedbacks.length, data: feedbacks });
});

// @desc    Create a new Feedback
// @route   POST api/feedback/
// @access  Private
exports.createFeedback = asyncHandler(async (req, res) => {
  const body = req.body;
  const feedback = await Feedback.create({
    description: body.description,
    UserId: body.UserId,
    ProjectId: body.ProjectId,
  });
  res.status(201).json({ data: feedback.dataValues });
});

// @desc    update specified Feedback
// @route   PUT api/feedback/:id
// @access  Private
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await Feedback.update(req.body, { where: { id: id } });

  const feedback = await Feedback.findOne({ where: { id: id } });

  res.status(200).json({ data: feedback });
});

// @desc    delete specified feedback
// @route   DELETE api/feedback/:id
// @access  Private
exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const feedback = await Feedback.findByPk(id);
  if (!feedback) {
    return next(new ApiError(`Aucun feedback pour cet ID ${id}`, 404));
  } else {
    const deletedFeedback = { ...feedback.toJSON() };

    await Feedback.destroy({ where: { id: id } });
    res.status(200).json({ data: deletedFeedback });
  }
});
