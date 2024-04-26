const fs = require('fs');
const path = require('path');
const CodePostal = require("../models").CodePostal;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/codepostal.json');
    const codePostal = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await CodePostal.bulkCreate(codePostal);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await CodePostal.destroy({ truncate: true });
  },
};
