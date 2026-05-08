const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    enum: ['Tenant', 'Shop', 'Payment', 'Deposit', 'Auth'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for system-level or early auth actions
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
