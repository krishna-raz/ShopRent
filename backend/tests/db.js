const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to the database.
 */
const connect = async () => {
  let uri = process.env.MONGODB_URI;
  // Modify URI to point to a test database
  if (!uri.includes('test_db')) {
    uri = uri.replace('shop-rental-management', 'shop-rental-test');
  }
  await mongoose.connect(uri);
};

/**
 * Drop database, close the connection
 */
const closeDatabase = async () => {
  // await mongoose.connection.dropDatabase(); // Be careful not to drop the production DB!
  await mongoose.connection.close();
};

/**
 * Remove all the data for all db collections.
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase,
};

