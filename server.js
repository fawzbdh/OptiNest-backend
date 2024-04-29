const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const globalError = require("./middlewares/errorMiddleware");
const db = require("./models");
const app = express();
const path = require("path");
const multer = require('multer');
const { v4: uuidv4 } = require("uuid"); // Import UUID module

const upload = multer({ dest: 'uploads/' });
const { spawn } = require('child_process');

const cors = require("cors");
const compression = require("compression");
const ApiError = require("./apiError");
// middleware
dotenv.config({ path: "config.env" });
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("mode : dev");
}

app.use(express.urlencoded({ extended: true }));

// routers

const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

const projectRoute = require("./routes/projectRoute");
const fichierRoute = require("./routes/fichierRoute");


app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/project", projectRoute);
app.use("/api/fichier", fichierRoute);

// app.post('/api/fichier', upload.array('files', 5), (req, res) => {
//   const uploadedFiles = req.files;
//   const fileResponses = [];

//   uploadedFiles.forEach((file) => {
//     const dxfFilePath = file.path;
//     const uniqueFileName = `${uuidv4()}.png`;
//     const imageFilePath = path.join(__dirname, 'uploads', uniqueFileName);
//     const baseUrl = 'http://localhost:8000';

//     const pythonProcess = spawn('python', ['parse_dxf.py', dxfFilePath, imageFilePath]);

//     pythonProcess.stdout.on('data', (data) => {
//       const dimensions = JSON.parse(data);
//       const imagePath = `${baseUrl}/uploads/${uniqueFileName}`;
//       fileResponses.push({ width: dimensions.width, height: dimensions.height, imagePath, projectId: dimensions.projectId });

//       if (fileResponses.length === uploadedFiles.length) {
//         res.json(fileResponses);
//       }
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error('Python error:', data.toString());
//       res.status(500).send('Error parsing DXF');
//     });
//   });
// });
//static Images Folder

app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route : ${req.originalUrl}`, 400));
});
app.use(globalError);

const port = process.env.PORT || 8000;

const server = app.listen(8000, () =>
  console.log(`Example app listening on port ${8000}!`)
);
db.sequelize.sync().then(() => {
  app.listen(port, () =>
    process.on("unhandledRejection", (err) => {
      console.error(`unhandledRejection Error : ${err.name} | ${err.message} `);
      server.close(() => {
        console.error(`shutting down ...`);
        process.exit(1);
      });
    })
  );
});
