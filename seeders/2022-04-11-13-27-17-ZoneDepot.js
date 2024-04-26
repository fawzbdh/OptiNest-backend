const fs = require('fs');
const path = require('path');
const Zone_depot = require("../models").Zone_depot;

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const filePath = path.join(__dirname, '../json/zoneDepot.json');
    const zoneDeDepot = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Insert dummy product data
    await Zone_depot.bulkCreate(zoneDeDepot);
  },
  down: async (queryInterface, Sequelize) => {
    // Delete all product data
    await Zone_depot.destroy({ truncate: true });
  },
};
