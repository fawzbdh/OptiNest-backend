const expressAsyncHandler = require("express-async-handler");

const Resultat = require("../models").Resultat;
const Format = require("../models").Format;

exports.getResualtByProjectId = expressAsyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Fetch formats associated with the specified user ID
  const resultats = await Resultat.findAll({
    where: { ProjectId: projectId },
    include: [
      {
        model: Format,
        attributes: ["id", "nom"], // Specify the attributes you want to include from Fichier model
      },
    ],
  });

  res.status(200).json({ results: resultats.length, data: resultats });
});
