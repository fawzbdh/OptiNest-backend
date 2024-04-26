const express = require("express");
const {
  changeUserPasswordValidator,
  deleteUserValidator,
  getUserValidator,
  updateUserValidator,
} = require("../utils/validators/userValidator");

const {
  changeUserPassword,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} = require("../services/userService");

const router = express.Router();

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
// Admin

router.route("/").get(getUsers);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
