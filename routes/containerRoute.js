const express = require("express");

const {
  createContainer,
  deleteContainer,
  getContainer,
  getContainers,
  getContainersByProjectId,
  updateContainer,
} = require("../controllers/containerController.js");

const authService = require("../controllers/authController.js");

const router = express.Router();
router
  .route("/byProjectId/:projectId")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getContainersByProjectId
  );
router
  .route("/")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getContainers
  )
  .post(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    createContainer
  );

router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getContainer
  )
  .put(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    updateContainer
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    deleteContainer
  );
module.exports = router;
