const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Container = sequelize.define(
    "Container",
    {
      offset: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      mergs: {
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
