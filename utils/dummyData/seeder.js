const fs = require('fs');
require('colors');
const dotenv = require('dotenv');
const Zone_travail = require("../../models").Zone_travail;
const ZoneDepot = require("../../models").Zone_depot;
// const dbConnection = require('../../config/database');

// dotenv.config({ path: '../../config.env' });

// // connect to DB
// dbConnection();

// Read data
const zoneDeTravail = JSON.parse(fs.readFileSync('./zoneDeTravail.json'));
const zoneDeDepot = JSON.parse(fs.readFileSync('./zoneDepot.json'));

// Insert data into DB
const insertData = async () => {
  try {
    await Zone_travail.create(zoneDeTravail);
    await ZoneDepot.create(zoneDeDepot);

    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Zone_travail.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
}