const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const testData = {
  user: {
    name: 'Finance Tester',
    email: `finance_${Date.now()}@example.com`,
    password: 'password123'
  },
  shop: {
    shopNumber: `F-${Math.floor(Math.random() * 1000)}`,
    shopName: 'Finance Test Hub',
    floor: 'Ground Floor',
    monthlyRent: 15000
  },
  tenant: {
    tenantName: 'John Finance',
    phone: '9876543210',
    aadhaar: '1234 5678 9012',
    address: 'Mumbai, India',
    rentAmount: 15000,
    securityDeposit: 50000,
    joiningDate: new Date().toISOString().split('T')[0]
  }
};

let authToken = '';
let shopId = '';
let tenantId = '';

async function runFinanceTests() {
  console.log('💰 Starting Finance & History Backend Tests...\n');

  try {
    // 1. Auth
    console.log('--- Auth ---');
    const regResponse = await axios.post(`${API_URL}/auth/register`, testData.user);
    authToken = regResponse.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };
    console.log('✅ Auth successful.');

    // 2. Create Shop
    console.log('\n--- Create Shop ---');
    const shopResponse = await axios.post(`${API_URL}/shops`, testData.shop, authHeaders);
    shopId = shopResponse.data._id;
    console.log(`✅ Shop ${shopResponse.data.shopNumber} created.`);

    // 3. Create Tenant (Onboarding with Deposit)
    console.log('\n--- Tenant Onboarding (Initial Deposit) ---');
    const tenantData = { ...testData.tenant, shopId, shopNumber: testData.shop.shopNumber };
    const tenantResponse = await axios.post(`${API_URL}/tenants`, tenantData, authHeaders);
    tenantId = tenantResponse.data._id;
    console.log(`✅ Tenant ${tenantResponse.data.tenantName} onboarded with ₹${tenantResponse.data.securityDeposit} deposit.`);

    // 4. Test Rent Payment
    console.log('\n--- Recording Rent Payment ---');
    const paymentData = {
      tenantId,
      paidAmount: 15000,
      month: 'October',
      year: 2025,
      date: new Date().toISOString(),
      status: 'Paid',
      paymentMethod: 'UPI'
    };
    const paymentResponse = await axios.post(`${API_URL}/payments`, paymentData, authHeaders);
    console.log(`✅ Payment of ₹${paymentResponse.data.paidAmount} recorded for ${paymentResponse.data.month}.`);

    // 5. Test Deposit Deduction (Full Refund / Move Out)
    console.log('\n--- Processing Full Refund (Move Out) ---');
    const refundData = {
      deductionAmount: 0,
      deductionReason: 'Full refund on move-out'
    };
    const refundResponse = await axios.put(`${API_URL}/tenants/${tenantId}/refund`, refundData, authHeaders);
    console.log(`✅ Deduction processed. New refundable amount: ₹${refundResponse.data.refundableAmount}. Status: ${refundResponse.data.depositStatus}`);

    // 6. Verify Shop is Vacant
    console.log('\n--- Verifying Shop Status ---');
    const verifyShopResponse = await axios.get(`${API_URL}/shops/${shopId}`, authHeaders);
    console.log(`✅ Shop Status after refund: ${verifyShopResponse.data.occupancyStatus}`);
    if (verifyShopResponse.data.occupancyStatus === 'Vacant') {
      console.log('✨ Success: Shop is now empty!');
    } else {
      console.log('⚠️ Warning: Shop is still occupied.');
    }

    // 7. Test History (Deposit Transactions)
    console.log('\n--- Fetching Deposit History ---');
    const historyResponse = await axios.get(`${API_URL}/deposits/${tenantId}/transactions`, authHeaders);
    console.log(`✅ Fetched ${historyResponse.data.length} transactions for tenant.`);
    historyResponse.data.forEach((tx, i) => {
      console.log(`   [${i+1}] ${tx.type}: ₹${tx.amount} (${tx.reason}) | Balance: ₹${tx.balanceAfter}`);
    });

    // 7. Test Global History (Activity Logs)
    console.log('\n--- Fetching Global Activity History ---');
    const logsResponse = await axios.get(`${API_URL}/activity-logs`, authHeaders);
    console.log(`✅ Fetched ${logsResponse.data.length} activity logs.`);
    logsResponse.data.slice(0, 5).forEach((log, i) => {
      console.log(`   • ${log.action}: ${log.description}`);
    });

    console.log('\n✨ Finance & History tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

runFinanceTests();
