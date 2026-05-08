const express = require('express');
const router = express.Router();
const {
  addPayment,
  getPayments,
  getPaymentHistory,
  getPendingDues,
  updatePayment,
  getTransactions,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// IMPORTANT: Put specific routes BEFORE general routes
router.get('/transactions', protect, getTransactions);
router.get('/pending-dues', protect, getPendingDues);
router.get('/tenant/:tenantId', protect, getPaymentHistory);

router.post('/', protect, addPayment);
router.get('/', protect, getPayments);
router.put('/:id', protect, updatePayment);

module.exports = router;
