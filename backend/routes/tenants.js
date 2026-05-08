const express = require('express');
const router = express.Router();
const { 
  createTenant, 
  processRefund,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant 
} = require('../controllers/tenantController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getTenants).post(protect, createTenant);
router
  .route('/:id')
  .get(protect, getTenant)
  .put(protect, updateTenant)
  .delete(protect, deleteTenant);

router.put('/:id/refund', protect, processRefund);

module.exports = router;
