const express = require("express");

const {
  getResualtByProjectId,
} = require("../controllers/resultatController.js");

const authService = require("../controllers/authController.js");

const router = express.Router();
router
  .route("/byProjectId/:projectId")
  .get(
    // authService.protect,
    // authService.allowedTo("admin", "utilisateur"),
    getResualtByProjectId
  );
module.exports = router;
