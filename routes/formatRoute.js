const express = require("express");

const {
  updateMultipleFormats,
createFormat,deleteFormat,getFormat,getFormats,getFormatsByProjectId,updateFormat,createMultipleFormat
} = require("../controllers/formatController.js");

const authService = require("../controllers/authController.js");

const router = express.Router();
router
  .route("/byProjectId/:projectId")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFormatsByProjectId
  );
  router
  .route("/updateMultiple")
  .put(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    updateMultipleFormats
  );
  router
  .route("/multiple/:ProjectId")
  .post(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    createMultipleFormat
  );
router
  .route("/")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFormats
  )
  .post(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    createFormat
  );

router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFormat
  )
  .put(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    updateFormat
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    deleteFormat
  );
module.exports = router;
