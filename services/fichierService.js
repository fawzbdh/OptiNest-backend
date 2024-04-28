const Fichier = require("../models").Fichier;
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// @desc    Get all fichier
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
  const projectId = req.body.projectId;

  // Fetch fichiers associated with the specified fichier ID
  const fichiers = await Fichier.findAll({ where: { ProjectId: projectId } });

  res.status(200).json({ results: fichiers.length, data: fichiers });
});

// @desc    Create a new Fichier
// @route   POST api/fichier/
// @access  Private
exports.createFichier = asyncHandler(async (req, res) => {
    const files = req.files; // Access the array of uploaded files
    const baseUrl = "http://localhost:8000"; // Assuming your server is running on localhost:3001
  
    // Process each uploaded file
    const fichierPromises = files.map(async (file) => {
      const dxfFilePath = file.path;
      const uniqueFileName = `${uuidv4()}.png`; // Generate a unique file name
      const imageFilePath = path.join(__dirname, "uploads", uniqueFileName);
  
      // Call the Python script to parse the DXF file
      const pythonProcess = spawn("python", [
        "parse_dxf.py",
        dxfFilePath,
        imageFilePath,
      ]);
  
      // Handle Python process stdout data
      const dimensionsPromise = new Promise((resolve, reject) => {
        pythonProcess.stdout.on("data", (data) => {
          const dimensions = JSON.parse(data);
          resolve(dimensions);
        });
      });
  
      // Handle Python process stderr data
      pythonProcess.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
        reject(new Error("Error parsing DXF"));
      });
  
      try {
        // Wait for the dimensions promise to resolve
        const dimensions = await dimensionsPromise;
  
        // Construct the full image URL with the base URL
        const imagePath = `${baseUrl}/uploads/${uniqueFileName}`;
  
        // Create a new Fichier record in the database
        const fichier = await Fichier.create({
          name: file.originalname, // Use the original filename of the uploaded file
          width: dimensions.width,
          height: dimensions.height,
          path: imagePath,
          ProjectId: req.body.projectId, // Assuming projectId is provided in the request body
        });
  
        return fichier; // Return the created Fichier object
      } catch (error) {
        console.error("Error creating Fichier record:", error);
        throw error; // Throw the error to be caught by the error handler
      }
    });
  
    try {
      // Wait for all the Fichier creation promises to resolve
      const fichiers = await Promise.all(fichierPromises);
  
      // Send the response with the created Fichier objects
      res.status(201).json({ data: fichiers });
    } catch (error) {
      // Handle any errors that occurred during Fichier creation
      res.status(500).json({ error: error.message });
    }
  });
  

// @desc    update specified Fichier
// @route   PUT api/fichier/:id
// @access  Private
exports.updateFichier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const fichier = await Fichier.update(req.body, { where: { id: id } });
  res.status(200).json({ message: true });
});

// @desc    delete specified fichier
// @route   DELETE api/fichier/:id
// @access  Private
exports.deleteFichier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletes = await Fichier.destroy({ where: { id: id } });
  res.status(204).send();
});
