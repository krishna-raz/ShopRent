const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
let token = '';

async function testIncrementalPayment() {
  try {
    console.log('🚀 Starting CLEAN Incremental Payment Test...');

    // 1. Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@shop.com',
      password: 'superpassword123'
    });
    token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Get an active tenant
    const tenantsRes = await axios.get(`${API_URL}/tenants`, config);
    const tenant = tenantsRes.data.find(t => t.tenantName === 'krishna');

    if (!tenant) {
      console.log('❌ Tenant "krishna" not found.');
      return;
    }

    const month = '2026-08'; // Use a fresh month
    console.log(`👤 Testing for Tenant: ${tenant.tenantName} | Month: ${month} | Rent: ₹${tenant.rentAmount}`);

    // 3. First Payment: ₹3500
    console.log('\nStep 1: Paying ₹3500...');
    const pay1 = await axios.post(`${API_URL}/payments`, {
      tenantId: tenant._id,
      month,
      paidAmount: 3500,
      paymentMode: 'UPI'
    }, config);
    console.log(`✅ Status: ${pay1.data.status} | Paid: ₹${pay1.data.paidAmount} | Due: ₹${pay1.data.dueAmount}`);

    // 4. Second Payment: ₹4000
    console.log('\nStep 2: Paying remaining ₹4000...');
    const pay2 = await axios.post(`${API_URL}/payments`, {
      tenantId: tenant._id,
      month,
      paidAmount: 4000,
      paymentMode: 'Cash'
    }, config);
    console.log(`✅ Status: ${pay2.data.status} | Total Paid: ₹${pay2.data.paidAmount} | Due: ₹${pay2.data.dueAmount}`);

    // 5. Final Verification
    const allPayments = await axios.get(`${API_URL}/payments?tenantId=${tenant._id}&month=${month}`, config);
    console.log(`\n📊 Database Records for ${month}: ${allPayments.data.length}`);

    if (allPayments.data.length === 1 && pay2.data.paidAmount === 7500 && pay2.data.status === 'Paid') {
      console.log('\n🏆 SUCCESS: System correctly merged the payments into a single row!');
    } else {
      console.log('\n❌ FAILURE: Check console output for details.');
    }

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testIncrementalPayment();
