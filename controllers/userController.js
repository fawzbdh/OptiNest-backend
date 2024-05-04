const User = require("../models").User;
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const bcrypt = require("bcryptjs");

// @desc    Get all user
// @route   GET api/User/
// @access  Private
exports.getUsers = asyncHandler(async (req, res) => {
  const user = await User.findAll();
  res.status(200).json({ results: user.length, data: user });
});

// @desc    Get specific User by id
// @route   GET api/User/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ where: { id: id } });
  if (!user) {
    return next(new ApiError(`User not found for this id ${id}`, 404));
  }
  res.status(200).json({ data: user });
});

// @desc    update specified User
// @route   PUT api/User/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  await user.update({
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
  });

  const updatedUser = await User.findByPk(id);

  res.status(200).json({ data: updatedUser });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  await user.update({
    password: await bcrypt.hash(req.body.password, 12),
    passwordChangedAt: Date.now(),
  });
  const updatedUser = await User.findByPk(id);
  res.status(200).json({ data: updatedUser });
});

// @desc    delete specified user
// @route   DELETE api/User/:id
// @access  Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return next(new ApiError(`No User for this id ${id}`, 404));
  } else {
    await User.destroy({ where: { id: id } });
    res.status(200).json({ message: "user deleted" });
  }
});
