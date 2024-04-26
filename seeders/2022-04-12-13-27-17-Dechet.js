const fs = require('fs');
const path = require('path');
const Dechet = require("../models").Dechet;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/dechet.json');
    const dechet = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Dechet.bulkCreate(dechet);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Dechet.destroy({ truncate: true });
  },
};
