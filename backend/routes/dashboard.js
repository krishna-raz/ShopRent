const express = require('express');
const router = express.Router();
const { getDashboardKPIs } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, getDashboardKPIs);

module.exports = router;
