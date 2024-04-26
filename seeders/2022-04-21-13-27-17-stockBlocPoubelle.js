const fs = require('fs');
const path = require('path');
const Stock_blocPoubelle = require("../models").Stock_blocPoubelle;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/stockblocpoubelle.json');
    const etage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Stock_blocPoubelle.bulkCreate(etage);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Stock_blocPoubelle.destroy({ truncate: true });
  },
};
