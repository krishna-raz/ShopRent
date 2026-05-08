const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const DepositTransaction = require('../models/DepositTransaction');
const { protect } = require('../middleware/auth');

// @desc    Get all deposits
// @route   GET /api/deposits
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const tenants = await Tenant.find().select(
      'tenantName shopNumber securityDeposit depositDate depositStatus refundableAmount refundDate phone status'
    );
    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

// @desc    Get deposits by status
// @route   GET /api/deposits/status/:status
// @access  Private
router.get('/status/:status', protect, async (req, res, next) => {
  try {
    const { status } = req.params;
    const tenants = await Tenant.find({ depositStatus: status }).select(
      'tenantName shopNumber securityDeposit depositDate depositStatus refundableAmount refundDate'
    );
    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

// @desc    Get deposit transaction history
// @route   GET /api/deposits/:tenantId/transactions
// @access  Private
router.get('/:tenantId/transactions', protect, async (req, res, next) => {
  try {
    const transactions = await DepositTransaction.find({ tenantId: req.params.tenantId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
