const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Resultat = sequelize.define(
    "Resultat",
    {
    
      fichier_dxf: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url_image: {
        type: DataTypes.STRING,
        allowNull: false,
      },


    },
    {
      timestamps: true,
      updatedAt: true,
    }
  );

  Resultat.associate = (models) => {
    Resultat.belongsTo(models.Project, {
      onDelete: "cascade",
    });
    Resultat.belongsTo(models.Format, {
      onDelete: "cascade",
    });
  };

  return Resultat;
};
