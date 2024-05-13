const { sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Container = sequelize.define(
    "Container",
    {
      ecart_top: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      ecart_right: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      ecart_left: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      ecart_bottom: {
        type: DataTypes.DOUBLE,
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
