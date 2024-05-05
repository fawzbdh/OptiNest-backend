const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/ValidatoMiddleware");
const User = require("../../models").User;

exports.signupValidator = [
  check("username")
    .notEmpty()
    .withMessage("Nom d'utilisateur requis")
    .isLength({ min: 3 })
    .withMessage("Nom d'utilisateur trop court"),
  check("email")
    .notEmpty()
    .withMessage("Email requis")
    .isEmail()
    .withMessage("Adresse email invalide")
    .custom((val) =>
      User.findOne({ where: { email: val } }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Adresse e-mail déjà utilisée"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Mot de passe requis")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit comporter au moins 6 caractères"),

  // check('passwordConfirm')
  //   .notEmpty()
  //   .withMessage('Confirmation du mot de passe requise'),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email requis")
    .isEmail()
    .withMessage("Adresse email invalide"),

  check("password")
    .notEmpty()
    .withMessage("Mot de passe requis")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit comporter au moins 6 caractères"),

  validatorMiddleware,
];
