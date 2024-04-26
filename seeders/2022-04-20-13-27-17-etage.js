const fs = require('fs');
const path = require('path');
const Etage_etablissement = require("../models").Etage_etablissement;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/etage.json');
    const etage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Etage_etablissement.bulkCreate(etage);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Etage_etablissement.destroy({ truncate: true });
  },
};
