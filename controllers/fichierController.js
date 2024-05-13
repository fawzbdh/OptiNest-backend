const Fichier = require("../models").Fichier;
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { v4: uuidv4 } = require("uuid"); // Import UUID module
const path = require("path");
const { spawn } = require("child_process");
const iconv = require("iconv-lite");
const fs = require('fs');

// @route   GET api/fichier/
// @access  Private
exports.getFichiers = asyncHandler(async (req, res) => {
  const fichier = await Fichier.findAll();
  res.status(200).json({ results: fichier.length, data: fichier });
});

// @desc    Get specific Fichier by id
// @route   GET api/fichier/:id
// @access  Private
exports.getFichier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const fichier = await Fichier.findOne({ where: { id: id } });
  if (!fichier) {
    return next(new ApiError(`Fichier not found for this id ${id}`, 404));
  }
  res.status(200).json({ data: fichier });
});
// @desc    Get fichiers by fichier ID
// @route   GET api/fichier/:fichierId
// @access  Private
exports.getFichiersByProjectId = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Fetch fichiers associated with the specified fichier ID
  const fichiers = await Fichier.findAll({ where: { ProjectId: projectId } });

  res.status(200).json({ results: fichiers.length, data: fichiers });
});

// @desc    Create a new Fichier with multiple files
// @route   POST api/fichier/
// @access  Private
exports.createFichier = asyncHandler(async (req, res, next) => {
  const baseUrl = "http://localhost:8000";

  // Assuming your file input field name is 'files'
  upload.array("files")(req, res, async (err) => {
    if (err) {
      return next(new ApiError("Error uploading files", 400));
    }

    const files = req.files;
    const projectId = req.body.projectId; // Assuming projectId is sent in the request body

    const createdFiles = [];

    // Loop through uploaded files and save them to the database
    for (const file of files) {
      const uniqueFileName = `${uuidv4()}.png`; // Generate unique file name
      const imagePath = path.join(__dirname, "..", "uploads", uniqueFileName); // Path to save the file

      // Execute your Python script to process the file
      const pythonProcess = spawn("python", [
        "parse_dxf.py",
        file.path,
        imagePath,
      ]);

      pythonProcess.stdout.on("data", async (data) => {
        const dimensions = JSON.parse(data); // Parse JSON output from Python script
        const { width, height } = dimensions; // Extract width and height
        const decodedFileName = iconv.decode(
          Buffer.from(file.originalname, "binary"),
          "utf-8"
        ); // Decode the file name to handle special characters

        // Save file details to the database
        const newFile = await Fichier.create({
          ProjectId: projectId,
          name: decodedFileName, // Change property name to 'name'
          path: baseUrl + "/uploads/" + uniqueFileName, // Save the path to retrieve the file later
          width: width,
          height: height,
          quantity: 1,
        });

        createdFiles.push(newFile);

        // If all files are processed, send response
        if (createdFiles.length === files.length) {
          res.status(201).json({ data: createdFiles });
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
        fs.unlinkSync(file.path); // Delete the file if processing fails
        return next(new ApiError("Error processing files", 500));
      });
    }
  });
});

// @desc    update specified Fichier
// @route   PUT api/fichier/:id
// @access  Private
exports.updateFichier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
   await Fichier.update(req.body, { where: { id: id } });
  const updatedFichier = await Fichier.findOne({ where: { id: id } });
  res.status(200).json({ data: updatedFichier });
});

// @desc    delete specified fichier
// @route   DELETE api/fichier/:id
// @access  Private
exports.deleteFichier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletes = await Fichier.destroy({ where: { id: id } });
  res.status(204).send();
});
