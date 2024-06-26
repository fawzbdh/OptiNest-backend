const Fichier = require("../models").Fichier;
const Container = require("../models").Container;
const Resultat = require("../models").Resultat;

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { v4: uuidv4 } = require("uuid"); // Import UUID module
const path = require("path");
const { spawn } = require("child_process");
const iconv = require("iconv-lite");
const fs = require("fs");
const Format = require("../models").Format;

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
  const fichiers = await Fichier.findAll({
    where: { ProjectId: projectId },
    order: [["createdAt", "DESC"]],
  });

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

    const projectDir = path.join(
      __dirname,
      "..",
      "uploads",
      `project_${projectId}`
    );
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const createdFiles = [];
    const configFiles = [];

    // Loop through uploaded files and save them to the database
    for (const file of files) {
      const decodedFileName = iconv.decode(
        Buffer.from(file.originalname, "binary"),
        "utf-8"
      ); // Decode the file name to handle special characters
      const uniqueFileName = `${uuidv4()}.png`; // Generate unique file name for the processed image
      const imagePath = path.join(projectDir, uniqueFileName); // Path to save the processed image
      const dxfPath = path.join(projectDir, decodedFileName); // Path to save the original .DXF file

      // Move the uploaded .DXF file to the project directory
      fs.renameSync(file.path, dxfPath);

      // Execute your Python script to process the file
      const pythonProcess = spawn("python", [
        "parse_dxf.py",
        dxfPath,
        imagePath,
      ]);

      pythonProcess.stdout.on("data", async (data) => {
        const dimensions = JSON.parse(data); // Parse JSON output from Python script
        const { width, height } = dimensions; // Extract width and height

        // Save file details to the database
        const newFile = await Fichier.create({
          ProjectId: projectId,
          name: decodedFileName, // Original .dxf file name
          path: baseUrl + `/uploads/project_${projectId}/` + uniqueFileName, // Path to the processed image
          width: width,
          height: height,
          quantity: 1,
        });

        createdFiles.push(newFile);
        configFiles.push({
          id: newFile.id,
          filename:
            baseUrl + `/uploads/project_${projectId}/` + decodedFileName,
          quantity: 1,
          priority: 0,
        });

        // If all files are processed, send response
        if (createdFiles.length === files.length) {
          const configFilePath = path.join(
            projectDir,
            `fichier_config_${projectId}.json`
          );
          const configContent = JSON.stringify({ files: configFiles }, null, 2);

          fs.writeFileSync(configFilePath, configContent);

          res
            .status(201)
            .json({ data: createdFiles, configFile: configFilePath });
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
        fs.unlinkSync(dxfPath); // Delete the file if processing fails
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

  // Extract quantity and priority from the request body
  const { quantity, priority } = req.body;

  // Update the Fichier record in the database
  await Fichier.update(
    { quantity: quantity, priority: priority },
    { where: { id: id } }
  );

  // Find the updated Fichier record
  const updatedFichier = await Fichier.findOne({ where: { id: id } });

  // If the record is not found, return an error
  if (!updatedFichier) {
    return next(new ApiError("Fichier not found", 404));
  }

  res.status(200).json({ data: updatedFichier });
});
exports.createCsvFile = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;
  const projectDir = path.join(
    __dirname,
    "..",
    "uploads",
    `project_${projectId}`
  );

  try {
    const fichiers = await Fichier.findAll({
      where: { ProjectId: projectId },
    });

    const fichiersData = fichiers.map((fichier) => fichier.dataValues); // Extract data values

    const pythonProcess = spawn("python", [
      "dxf_to_poly.py",
      JSON.stringify({ files: fichiersData }), // Pass the configuration data as a JSON string
      projectDir,
      projectId,
    ]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python output: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        res.status(201).json({ message: "success" });
      } else {
        console.error("Python process exited with code", code);
        return next(new ApiError("Error creating CSV file", 500));
      }
    });
  } catch (error) {
    console.error("Error:", error);
    next(new ApiError("Internal server error", 500));
  }
});
exports.optimisation = asyncHandler(async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const projectDir = path.join(
      __dirname,
      "..",
      "uploads",
      `project_${projectId}`
    );
    const container = await Container.findOne({
      where: { ProjectId: projectId },
    });
    const formats = await Format.findAll({ where: { ProjectId: projectId } });

    if (!container) {
      return res.status(404).json({ error: "Container not found" });
    }
    if (formats.length === 0) {
      return res.status(404).json({ error: "Formats not found" });
    }

    const transformedData = [];
    formats.forEach((format) => {
      for (let i = 0; i < format.quantity; i++) {
        transformedData.push({
          formatId: format.id,
          width: format.largeur,
          length: format.hauteur,
          vertical: container.vertical,
          x: container.x,
          y: container.y, 
        });
      }
    });
    // Delete existing results for the same projectId
    await Resultat.destroy({ where: { ProjectId: projectId } });
    const pythonProcess = spawn("python", [
      "NEWCUMA.py",
      path.join(projectDir, `output_points.csv`), // Pass the configuration file path
      projectDir, // Pass the output directory
      JSON.stringify(transformedData),
    ]);

    let pythonOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({
          status: "error",
          message: "Veuillez augmenter la taille de conteneur",
        });
      }

      try {
        console.log("Raw Python output:", pythonOutput); // Log raw output for debugging

        // Extract only the JSON part of the output
        const jsonMatch = pythonOutput.match(/\[.*\]/s);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in Python output");
        }
        const results = JSON.parse(jsonMatch[0]);

        const savePromises = results.map((result) => {
          return Resultat.create({
            fichier_dxf: result.fichier_dxf,
            url_image: result.url_image,
            ProjectId: projectId,
            FormatId: result.formatId,
          });
        });

        Promise.all(savePromises)
          .then(() => res.status(200).json({ status: "success", results }))
          .catch((err) => {
            console.error(err);
            res.status(500).json({
              status: "error",
              message: "Failed to save results to the database",
            });
          });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          status: "error",
          message: "Error parsing Python output",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred",
    });
  }
});

// @desc    delete specified fichier
// @route   DELETE api/fichier/:id
// @access  Private
exports.deleteFichier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const fichier = await Fichier.findOne({ where: { id: id } });
  if (!fichier) {
    return next(new ApiError(`Fichier not found for this id ${id}`, 404));
  }
  const deletes = await Fichier.destroy({ where: { id: id } });
  res.status(204).send();
});
