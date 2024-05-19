const express = require("express");

const {
  createFeedback,
  deleteFeedback,
  getFeedback,
  getFeedbacks,
  getFeedbacksByProjectId,
  updateFeedback,
} = require("../controllers/feedbackController");

const authService = require("../controllers/authController.js");

const router = express.Router();
router
  .route("/byProjectId/:projectId")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFeedbacksByProjectId
  );
router
  .route("/")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFeedbacks
  )
  .post(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    createFeedback
  );

router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFeedback
  )
  .put(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    updateFeedback
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    deleteFeedback
  );
module.exports = router;
