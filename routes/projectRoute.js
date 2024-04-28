const express = require("express");

const {
  createProject,
  deleteProject,
  getProject,
  updateProject,
  getProjects,
  getProjectsByUserId,
} = require("../services/projectService");

const authService = require("../services/authService");

const router = express.Router();
router
  .route("/byUserId")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getProjectsByUserId
  );
router
  .route("/")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getProjects
  )
  .post(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    createProject
  );

router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getProject
  )
  .put(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    updateProject
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    deleteProject
  );
module.exports = router;
