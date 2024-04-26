const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/ValidatoMiddleware");
const User = require("../../models").User;

exports.signupValidator = [
  check("username")
    .notEmpty()
    .withMessage("Username required")
    .isLength({ min: 3 })
    .withMessage("Too short User name"),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ where: { email: val } }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
,

  // check('passwordConfirm')
  //   .notEmpty()
  //   .withMessage('Password confirmation required'),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];
