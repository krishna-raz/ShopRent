const mongoose = require('mongoose');
const Shop = require('./models/Shop');
const Tenant = require('./models/Tenant');
const Payment = require('./models/Payment');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB for cleaning...');

    // Delete all Shops, Tenants, Payments, ActivityLogs
    const shopResult = await Shop.deleteMany({});
    const tenantResult = await Tenant.deleteMany({});
    const paymentResult = await Payment.deleteMany({});
    const logResult = await ActivityLog.deleteMany({});

    console.log(`✅ Deleted ${shopResult.deletedCount} Shops`);
    console.log(`✅ Deleted ${tenantResult.deletedCount} Tenants`);
    console.log(`✅ Deleted ${paymentResult.deletedCount} Payments`);
    console.log(`✅ Deleted ${logResult.deletedCount} Activity Logs`);

    // Delete all Users EXCEPT superadmin
    const userResult = await User.deleteMany({ email: { $ne: 'admin@shop.com' } });
    console.log(`✅ Deleted ${userResult.deletedCount} Admin Users (Kept admin@shop.com)`);

    console.log('\n✨ Database is now CLEAN and ready for production use!');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error during cleaning:', err);
    process.exit(1);
  }
}

cleanDatabase();
