const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
let token = '';

async function testIncrementalPayment() {
  try {
    console.log('🚀 Testing Incremental Payment Logic...');

    // 1. Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@shop.com',
      password: 'superpassword123'
    });
    token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Get an active tenant
    const tenantsRes = await axios.get(`${API_URL}/tenants`, config);
    const tenant = tenantsRes.data.find(t => t.status === 'Active');

    if (!tenant) {
      console.log('❌ No active tenant found to test with.');
      return;
    }

    const month = '2026-05';
    console.log(`👤 Using Tenant: ${tenant.tenantName} (Rent: ₹${tenant.rentAmount}) for Month: ${month}`);

    // 3. First Payment (Partial)
    console.log('\n💸 Recording First Payment: ₹3500...');
    const pay1 = await axios.post(`${API_URL}/payments`, {
      tenantId: tenant._id,
      month,
      paidAmount: 3500,
      paymentMode: 'UPI'
    }, config);

    console.log(`✅ Result: Paid: ₹${pay1.data.paidAmount}, Due: ₹${pay1.data.dueAmount}, Status: ${pay1.data.status}`);

    // 4. Second Payment (Completing the rent)
    const secondAmount = tenant.rentAmount - 3500;
    console.log(`\n💸 Recording Second Payment: ₹${secondAmount}...`);
    const pay2 = await axios.post(`${API_URL}/payments`, {
      tenantId: tenant._id,
      month,
      paidAmount: secondAmount,
      paymentMode: 'Cash'
    }, config);

    console.log(`✅ Result: Total Paid: ₹${pay2.data.paidAmount}, Due: ₹${pay2.data.dueAmount}, Status: ${pay2.data.status}`);

    // 5. Final check: Count payment records for this month
    const allPayments = await axios.get(`${API_URL}/payments?tenantId=${tenant._id}&month=${month}`, config);
    console.log(`\n📊 Total database records for this month: ${allPayments.data.length}`);

    if (allPayments.data.length === 1) {
      console.log('🏆 SUCCESS: Only ONE row exists and it has been updated correctly!');
    } else {
      console.log('❌ FAILURE: Multiple rows found.');
    }

  } catch (err) {
    console.error('❌ Error during test:', err.response?.data || err.message);
  }
}

testIncrementalPayment();
