const fs = require('fs');
const path = require('path');
const Etablissement = require("../models").Etablissement;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/etablissement.json');
    const etablissement = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Etablissement.bulkCreate(etablissement);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Etablissement.destroy({ truncate: true });
  },
};
