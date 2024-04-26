const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const globalError = require("./middlewares/errorMiddleware");
const db = require("./models");
const app = express();
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const ApiError = require("./apiError");
// middleware
dotenv.config({ path: "config.env" });
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(compression());
app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("mode : dev");
}

app.use(express.urlencoded({ extended: true }));

// routers

const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

const projectRoute = require("./routes/projectRoute");

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/project", projectRoute);

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
