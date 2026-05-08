const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  month: {
    type: String, // Format: YYYY-MM
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
  },
  dueAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Partial', 'Pending'],
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    default: 'Cash',
  },
  notes: {
    type: String,
  },
  transactions: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      mode: { type: String, default: 'Cash' },
      remainingDue: { type: Number },
      notes: { type: String }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce one payment record per tenant per month
paymentSchema.index({ tenantId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
