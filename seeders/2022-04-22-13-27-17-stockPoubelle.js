const fs = require('fs');
const path = require('path');
const Stock_poubelle = require("../models").Stock_poubelle;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/stockpoubelle.json');
    const stockpoubelle = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Stock_poubelle.bulkCreate(stockpoubelle);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Stock_poubelle.destroy({ truncate: true });
  },
};
