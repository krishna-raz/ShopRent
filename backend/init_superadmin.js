const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'admin@shop.com'; // New Super Admin
    const userExists = await User.findOne({ email });

    if (userExists) {
      userExists.role = 'superadmin';
      await userExists.save();
      console.log(`✅ User ${email} promoted to Super Admin!`);
    } else {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: email,
        password: 'superpassword123',
        role: 'superadmin'
      });
      console.log(`✨ Super Admin created! Email: ${email}, Password: superpassword123`);
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createSuperAdmin();
