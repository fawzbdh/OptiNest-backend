const { sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },

    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: async (user, options) => {
          const hashedPassword = await bcrypt.hash(user.password, 12);
          user.password = hashedPassword;
        },
      },
    }
  );

  User.associate = (models) => {
    // User.belongsTo(models.Camion,{
    //     allowNull:true
    // })
    // User.belongsTo(models.Etablissement,{
    //     allowNull:true
    // })
    User.hasMany(models.Project, {
      onDelete: "cascade",
    });
    User.hasMany(models.Feedback, {
      onDelete: "cascade",
    });
  };

  return User;
};
