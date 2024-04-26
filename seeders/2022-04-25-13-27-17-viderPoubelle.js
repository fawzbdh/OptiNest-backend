const fs = require('fs');
const path = require('path');
const Vider_poubelle = require("../models").Vider_poubelle;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/viderpoubelle.json');
    const viderpoubelle = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Vider_poubelle.bulkCreate(viderpoubelle);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Vider_poubelle.destroy({ truncate: true });
  },
};
