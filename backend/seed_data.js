const mongoose = require('mongoose');
const Shop = require('./models/Shop');
const Tenant = require('./models/Tenant');
const Payment = require('./models/Payment');
const User = require('./models/User');
require('dotenv').config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Seeding production-ready data...');

    const superAdmin = await User.findOne({ email: 'admin@shop.com' });
    if (!superAdmin) {
      console.log('❌ Super Admin not found. Please run init_superadmin.js first.');
      return;
    }

    // 1. Create Shops
    const shops = await Shop.create([
      { shopNumber: 'G-101', floor: 'Ground', occupancyStatus: 'Occupied', monthlyRent: 12000, shopName: 'General Store' },
      { shopNumber: 'F-205', floor: 'First', occupancyStatus: 'Occupied', monthlyRent: 15000, shopName: 'Mobile World' },
      { shopNumber: 'S-302', floor: 'Second', occupancyStatus: 'Vacant', monthlyRent: 8000, shopName: 'Empty Space' }
    ]);

    // 2. Create Tenants
    const tenants = await Tenant.create([
      {
        tenantName: 'Rahul Kumar',
        phone: '9876543210',
        aadhaar: '1234 5678 9012',
        address: 'Sector 15, Noida',
        shopId: shops[0]._id,
        shopNumber: 'G-101',
        rentAmount: 12000,
        joiningDate: new Date('2026-01-01'),
        securityDeposit: 30000,
        refundableAmount: 30000,
        status: 'Active'
      },
      {
        tenantName: 'Sanjay Singh',
        phone: '9988776655',
        aadhaar: '5566 7788 9900',
        address: 'Sector 62, Noida',
        shopId: shops[1]._id,
        shopNumber: 'F-205',
        rentAmount: 15000,
        joiningDate: new Date('2026-02-15'),
        securityDeposit: 45000,
        refundableAmount: 45000,
        status: 'Active'
      }
    ]);

    // Update shops with tenant IDs
    await Shop.findByIdAndUpdate(shops[0]._id, { tenantId: tenants[0]._id });
    await Shop.findByIdAndUpdate(shops[1]._id, { tenantId: tenants[1]._id });

    // 3. Create a partial payment for Rahul (May 2026)
    const month = new Date().toISOString().slice(0, 7);
    await Payment.create({
      tenantId: tenants[0]._id,
      tenantName: tenants[0].tenantName,
      shopNumber: tenants[0].shopNumber,
      month: month,
      rentAmount: 12000,
      paidAmount: 5000,
      dueAmount: 7000,
      status: 'Partial',
      paymentMode: 'Cash',
      notes: 'Initial part payment'
    });

    console.log('✅ 3 Shops created');
    console.log('✅ 2 Tenants added and assigned');
    console.log(`✅ 1 Partial Payment recorded for ${month}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedData();
