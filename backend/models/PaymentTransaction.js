const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  tenantName: String,
  shopNumber: String,
  month: String,
  rentAmount: Number,
  transactionAmount: Number,  // THIS transaction's amount (e.g. ₹3500)
  paidAmount: Number,         // Total paid so far after this transaction
  remainingDue: Number,       // Remaining due after this transaction
  paymentMode: String,
  status: String,             // 'Paid' or 'Partial' after this transaction
  notes: String,
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
