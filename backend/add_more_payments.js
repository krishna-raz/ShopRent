const mongoose = require('mongoose');
const Tenant = require('./models/Tenant');
const Payment = require('./models/Payment');
require('dotenv').config();

async function addMorePayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('💰 Adding more payment history...');

    const rahul = await Tenant.findOne({ tenantName: 'Rahul Kumar' });
    const sanjay = await Tenant.findOne({ tenantName: 'Sanjay Singh' });

    if (!rahul || !sanjay) {
      console.log('❌ Tenants not found. Run seed_data first.');
      return;
    }

    const additionalPayments = [
      // Rahul - March
      {
        tenantId: rahul._id,
        tenantName: rahul.tenantName,
        shopNumber: rahul.shopNumber,
        month: '2026-03',
        rentAmount: 12000,
        paidAmount: 12000,
        dueAmount: 0,
        status: 'Paid',
        paymentMode: 'Cash',
        paymentDate: new Date('2026-03-05')
      },
      // Rahul - April
      {
        tenantId: rahul._id,
        tenantName: rahul.tenantName,
        shopNumber: rahul.shopNumber,
        month: '2026-04',
        rentAmount: 12000,
        paidAmount: 12000,
        dueAmount: 0,
        status: 'Paid',
        paymentMode: 'UPI',
        paymentDate: new Date('2026-04-02')
      },
      // Sanjay - March
      {
        tenantId: sanjay._id,
        tenantName: sanjay.tenantName,
        shopNumber: sanjay.shopNumber,
        month: '2026-03',
        rentAmount: 15000,
        paidAmount: 15000,
        dueAmount: 0,
        status: 'Paid',
        paymentMode: 'Bank Transfer',
        paymentDate: new Date('2026-03-10')
      },
      // Sanjay - April
      {
        tenantId: sanjay._id,
        tenantName: sanjay.tenantName,
        shopNumber: sanjay.shopNumber,
        month: '2026-04',
        rentAmount: 15000,
        paidAmount: 8000,
        dueAmount: 7000,
        status: 'Partial',
        paymentMode: 'Cash',
        paymentDate: new Date('2026-04-15')
      }
    ];

    await Payment.insertMany(additionalPayments);
    console.log('✅ Added 4 more payment records successfully!');

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addMorePayments();
