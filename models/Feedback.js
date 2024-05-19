const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback",
    {
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    
    },
    {
      timestamps: true,
      updatedAt: true,
    }
  );

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Project, {
      onDelete: "cascade",
    });
    Feedback.belongsTo(models.User, {
      onDelete: "cascade",
    });
  };

  return Feedback;
};
