const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantName: {
    type: String,
    required: [true, 'Please add tenant name'],
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
  },
  aadhaar: {
    type: String,
  },
  address: {
    type: String,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  shopNumber: {
    type: String, // Denormalized for quick access
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  // Security Deposit Fields
  securityDeposit: {
    type: Number,
    required: true,
  },
  depositDate: {
    type: Date,
    default: Date.now,
  },
  depositStatus: {
    type: String,
    enum: ['Active', 'Refunded', 'Partial Refund', 'Deducted'],
    default: 'Active',
  },
  refundableAmount: {
    type: Number,
    required: true,
  },
  refundDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tenant', tenantSchema);
