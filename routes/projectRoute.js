const express = require("express");

const {
  createProject,
  deleteProject,
  getProject,
  updateProject,
  getProjects,
} = require("../services/projectService");

const router = express.Router();

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
module.exports = router;
