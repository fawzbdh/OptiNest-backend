const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Container = sequelize.define(
    "Container",
    {
      x: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      y: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      vertical: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      updatedAt: true,
    }
  );

  Container.associate = (models) => {
    Container.belongsTo(models.Project, {
      onDelete: "cascade",
    });
  };

  return Container;
};
