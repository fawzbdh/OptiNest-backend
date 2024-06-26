const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const createToken = require("../utils/createToken");

const User = require("../models").User;

// @desc    Inscription
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
  });

  // 2- Générer un jeton
  const token = createToken(user.id);

  res.status(201).json({ data: user, token });
});

// @desc    Connexion
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) Vérifier si le mot de passe et l'email sont présents (validation)
  // 2) Vérifier si l'utilisateur existe et si le mot de passe est correct
  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new ApiError("Email ou mot de passe incorrect", 401));
  }
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Mot de passe incorrect", 401));
  }
  // 3) Générer un jeton
  const token = createToken(user.id);

  // Supprimer le mot de passe de la réponse
  const { password: _, ...userWithoutPassword } = user.toJSON();
  // 4) Envoyer la réponse au côté client
  res.status(200).json({ data: userWithoutPassword, token });
});

// @desc   Assurer que l'utilisateur est connecté
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Si le jeton n'existe pas, renvoyer une erreur
  if (!token) {
    return next(
      new ApiError(
        "Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à cette route",
        401
      )
    );
  }

  try {
    // Vérifier le jeton et extraire l'ID de l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Vérifier si l'utilisateur existe
    const currentUser = await User.findByPk(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError(
          "L'utilisateur auquel appartient ce jeton n'existe pas",
          401
        )
      );
    }

    // Vérifier si l'utilisateur a changé son mot de passe après la création du jeton
    if (currentUser.passwordChangedAt) {
      const passChangedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      // Mot de passe changé après la création du jeton (Erreur)
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "L'utilisateur a récemment changé son mot de passe. Veuillez vous reconnecter.",
            401
          )
        );
      }
    }

    // Attacher les informations de l'utilisateur à l'objet req.user
    req.user = currentUser;
    next();
  } catch (error) {
    // Gérer les erreurs de vérification du jeton
    return next(
      new ApiError("Jeton invalide. Veuillez vous reconnecter.", 401)
    );
  }
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) Rôles d'accès
    // 2) Accès utilisateur enregistré (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("Vous n'êtes pas autorisé à accéder à cette route", 403)
      );
    }
    next();
  });
