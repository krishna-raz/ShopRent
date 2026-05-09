const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopNumber: {
    type: String,
    required: [true, 'Please add a shop number'],
    unique: true,
  },
  shopName: {
    type: String,
    trim: true,
  },
  floor: {
    type: String,
    required: [true, 'Please specify the floor'],
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Please add monthly rent amount'],
  },
  rentAmount: {
    type: Number,
    required: [true, 'Please add monthly rent amount'],
  },
  occupancyStatus: {
    type: String,
    enum: ['Vacant', 'Occupied'],
    default: 'Vacant',
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Shop', shopSchema);
