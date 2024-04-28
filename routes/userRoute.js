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
const authService = require("../services/authService");

const router = express.Router();

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
// Admin

router
  .route("/")
  .get(authService.protect, authService.allowedTo("admin"), getUsers);
router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin"),
    getUserValidator,
    getUser
  )
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updateUserValidator,
    updateUser
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
