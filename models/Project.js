const { sequelize } = require("sequelize");

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
  };

  return Project;
};
