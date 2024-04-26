const fs = require('fs');
const path = require('path');
const Bloc_etablissement = require("../models").Bloc_etablissement;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/blocEtablissement.json');
    const blocetablissement = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Bloc_etablissement.bulkCreate(blocetablissement);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Bloc_etablissement.destroy({ truncate: true });
  },
};
