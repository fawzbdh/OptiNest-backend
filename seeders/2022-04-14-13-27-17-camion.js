const fs = require('fs');
const path = require('path');
const Camion = require("../models").Camion;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/camion.json');
    const camion = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Camion.bulkCreate(camion);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Camion.destroy({ truncate: true });
  },
};
