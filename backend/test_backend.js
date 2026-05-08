const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const testData = {
  user: {
    name: 'Test Admin',
    email: `tester_${Date.now()}@example.com`,
    password: 'password123'
  },
  shop: {
    shopNumber: `T-${Math.floor(Math.random() * 1000)}`,
    shopName: 'Test Electronics',
    floor: 'First Floor',
    monthlyRent: 25000
  }
};

let authToken = '';

async function runTests() {
  console.log('🚀 Starting Backend API Tests...\n');

  try {
    // 1. Test Server Connectivity
    console.log('--- Testing Connectivity ---');
    const rootResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/`);
    console.log('✅ Server is running:', rootResponse.data.message);

    // 2. Register Test User
    console.log('\n--- Testing User Registration ---');
    try {
      const regResponse = await axios.post(`${API_URL}/auth/register`, testData.user);
      authToken = regResponse.data.token;
      console.log('✅ Registration successful!');
    } catch (err) {
      console.log('❌ Registration failed:', err.response?.data?.message || err.message);
      return;
    }

    // 3. Login Test (Verification)
    console.log('\n--- Testing User Login ---');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testData.user.email,
      password: testData.user.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful! Token received.');

    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

    // 4. Test Fetching Shops
    console.log('\n--- Testing Fetch Shops ---');
    const shopsResponse = await axios.get(`${API_URL}/shops`, authHeaders);
    console.log(`✅ Successfully fetched ${shopsResponse.data.length} shops.`);

    // 5. Test Creating a Shop
    console.log('\n--- Testing Create Shop ---');
    const createShopResponse = await axios.post(`${API_URL}/shops`, testData.shop, authHeaders);
    console.log(`✅ Shop ${createShopResponse.data.shopNumber} created successfully.`);

    // 6. Test Dashboard Stats
    console.log('\n--- Testing Dashboard Summary ---');
    const dashboardResponse = await axios.get(`${API_URL}/dashboard`, authHeaders);
    console.log('✅ Dashboard stats fetched:', dashboardResponse.data);

    // 7. Test Activity Logs
    console.log('\n--- Testing Activity Logs ---');
    const logsResponse = await axios.get(`${API_URL}/activity-logs`, authHeaders);
    console.log(`✅ Fetched ${logsResponse.data.length} activity logs.`);

    console.log('\n✨ All tests passed successfully!');

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

runTests();
