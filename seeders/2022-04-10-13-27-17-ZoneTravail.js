const fs = require('fs');
const path = require('path');
const Zone_travail = require("../models").Zone_travail;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.join(__dirname, '../json/zoneDeTravail.json');
    const zoneDeTravail = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
   

    // Insert dummy product data
    await Zone_travail.bulkCreate(zoneDeTravail);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Zone_travail.destroy({ truncate: true });
  },
};
