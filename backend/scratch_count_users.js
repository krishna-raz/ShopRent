const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function countUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const userCount = await User.countDocuments();
    const adminNames = await User.find().select('name email');
    
    console.log('\n--- User Statistics ---');
    console.log(`Total Admin Users: ${userCount}`);
    console.log('\nList of Registered Admins:');
    adminNames.forEach(u => console.log(`- ${u.name} (${u.email})`));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

countUsers();
