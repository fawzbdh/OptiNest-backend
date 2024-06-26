const express = require("express");

const {
  createProject,
  deleteProject,
  getProject,
  updateProject,
  getProjects,
  getProjectsByUserId,
} = require("../controllers/projectController");

const authController = require("../controllers/authController");

const router = express.Router();
router
  .route("/byUserId")
  .get(
    authController.protect,
    authController.allowedTo("admin", "utilisateur"),
    getProjectsByUserId
  );
router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    getProjects
  )
  .post(
    authController.protect,
    authController.allowedTo("admin", "utilisateur"),
    createProject
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.allowedTo("admin", "utilisateur"),
    getProject
  )
  .put(
    authController.protect,
    authController.allowedTo("admin", "utilisateur"),
    updateProject
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "utilisateur"),
    deleteProject
  );
module.exports = router;
