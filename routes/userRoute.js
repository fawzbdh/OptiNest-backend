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

} = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
// Admin

router
  .route("/")
  .get(authController.protect, authController.allowedTo("admin"), getUsers);
router
  .route("/:id")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    getUserValidator,
    getUser
  )
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    updateUserValidator,
    updateUser
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
