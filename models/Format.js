const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Format = sequelize.define(
    "Format",
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hauteur: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      largeur: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      updatedAt: true,
    }
  );

  Format.associate = (models) => {
    Format.belongsTo(models.Project, {
      onDelete: "cascade",
    });
    Format.hasMany(models.Resultat, {
      onDelete: "cascade",
    });
  };

  return Format;
};
