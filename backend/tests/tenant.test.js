const request = require('supertest');
const app = require('../server');
const dbHandler = require('./db');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

let token;

beforeAll(async () => {
  await dbHandler.connect();
  
  // Register and login an admin user to get a token
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin',
      email: 'admin_tenant_test@test.com',
      password: 'password123',
    });

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin_tenant_test@test.com',
      password: 'password123',
    });

  token = res.body.token;
});

afterEach(async () => {
  await Tenant.deleteMany();
});

afterAll(async () => {
  await User.deleteMany({ email: 'admin_tenant_test@test.com' });
  await dbHandler.closeDatabase();
});

describe('Tenant Endpoints (Security Deposit Management)', () => {
  it('should create a new tenant with security deposit', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenantName: 'John Doe',
        phone: '1234567890',
        shopId: '507f1f77bcf86cd799439011', // Dummy ObjectId
        shopNumber: 'A-1',
        rentAmount: 5000,
        joiningDate: '2025-01-15',
        securityDeposit: 20000,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.tenantName).toEqual('John Doe');
    expect(res.body.securityDeposit).toEqual(20000);
    expect(res.body.depositStatus).toEqual('Active');
    expect(res.body.refundableAmount).toEqual(20000);
    expect(res.body).toHaveProperty('depositDate');
  });

  it('should update tenant security deposit refund', async () => {
    // Create tenant
    const createRes = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenantName: 'Jane Smith',
        phone: '0987654321',
        shopId: '507f1f77bcf86cd799439012',
        shopNumber: 'B-2',
        rentAmount: 6000,
        joiningDate: '2025-01-15',
        securityDeposit: 30000,
      });

    const tenantId = createRes.body._id;

    // Refund part of the deposit
    const updateRes = await request(app)
      .put(`/api/tenants/${tenantId}/refund`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        deductionAmount: 5000,
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.depositStatus).toEqual('Partial Refund');
    expect(updateRes.body.refundableAmount).toEqual(25000); // 30000 - 5000
    expect(updateRes.body).toHaveProperty('refundDate');
  });
});
