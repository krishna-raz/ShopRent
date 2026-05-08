const mongoose = require('mongoose');

const depositTransactionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  tenantName: {
    type: String,
    required: true,
  },
  shopNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Collection', 'Deduction', 'Refund'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DepositTransaction', depositTransactionSchema);
