const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const credentials = {
  email: 'admin@shop.com',
  password: 'superpassword123'
};

async function testEndpoint() {
  try {
    console.log('--- Step 1: Logging in ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, credentials);
    const token = loginRes.data.token;
    console.log('Login successful! Token acquired.');

    console.log('\n--- Step 2: Testing /api/payments/transactions ---');
    const transactionsRes = await axios.get(`${API_URL}/payments/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Status Code: ${transactionsRes.status}`);
    console.log('Response Data:', JSON.stringify(transactionsRes.data, null, 2));
    
    if (Array.isArray(transactionsRes.data)) {
      console.log(`\nSUCCESS: Received ${transactionsRes.data.length} transactions.`);
    } else {
      console.log('\nWARNING: Response is not an array.');
    }

  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEndpoint();
