const { sequelize } = require("sequelize");
const FeedBack = require("./FeedBack");

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      steps: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      feedback:{
        type: DataTypes.STRING,
        allowNull: true,
      }
      
    },
    {
      timestamps: true,
      updatedAt: true, 
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      onDelete: "cascade",
    });
    Project.hasMany(models.Fichier, {
      onDelete: "cascade",
    });
  };

  return Project;
};
