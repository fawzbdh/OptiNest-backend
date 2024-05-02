const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Fichier = sequelize.define(
    "Fichier",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      height: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      width: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priority:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      timestamps: true,
      updatedAt: true,
    }
  );

  Fichier.associate = (models) => {
    Fichier.belongsTo(models.Project, {
      onDelete: "cascade",
    });
  };

  return Fichier;
};
