const express = require("express");

const {
createFichier,deleteFichier,getFichier,getFichiers,getFichiersByProjectId,updateFichier,createCsvFile,optimisation
} = require("../controllers/fichierController");

const authService = require("../controllers/authController.js");

const router = express.Router();
router
  .route("/byProjectId/:projectId")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFichiersByProjectId
  );
  router
  .route("/csv/:projectId")
  .post(
    // authService.protect,
    // authService.allowedTo("admin", "utilisateur"),
    createCsvFile
  );
  router
  .route("/optimisation/:projectId")
  .post(
    // authService.protect,
    // authService.allowedTo("admin", "utilisateur"),
    optimisation

  );
router
  .route("/")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFichiers
  )
  .post(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    createFichier
  );

router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    getFichier
  )
  .put(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    updateFichier
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "utilisateur"),
    deleteFichier
  );
module.exports = router;
