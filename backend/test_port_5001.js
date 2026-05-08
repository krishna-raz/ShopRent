const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:5001/api`;

const testData = {
  user: {
    name: 'Port 5001 Tester',
    email: `p5001_${Date.now()}@example.com`,
    password: 'password123'
  },
  shop: {
    shopNumber: `P-${Math.floor(Math.random() * 1000)}`,
    shopName: 'Port 5001 Hub',
    floor: 'Ground Floor',
    monthlyRent: 15000
  },
  tenant: {
    tenantName: 'John 5001',
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

async function runTests() {
  try {
    const regResponse = await axios.post(`${API_URL}/auth/register`, testData.user);
    authToken = regResponse.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

    const shopResponse = await axios.post(`${API_URL}/shops`, testData.shop, authHeaders);
    shopId = shopResponse.data._id;

    const tenantData = { ...testData.tenant, shopId, shopNumber: testData.shop.shopNumber };
    const tenantResponse = await axios.post(`${API_URL}/tenants`, tenantData, authHeaders);
    tenantId = tenantResponse.data._id;

    const refundData = { deductionAmount: 0, deductionReason: 'Full refund move-out' };
    await axios.put(`${API_URL}/tenants/${tenantId}/refund`, refundData, authHeaders);

    const verifyShopResponse = await axios.get(`${API_URL}/shops/${shopId}`, authHeaders);
    console.log(`Final Shop Status: ${verifyShopResponse.data.occupancyStatus}`);

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

runTests();
