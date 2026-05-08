const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// @desc    Get all activity logs
// @route   GET /api/activity-logs
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { entityType, limit } = req.query;
    const query = {};
    
    if (entityType) query.entityType = entityType;

    const logs = await ActivityLog.find(query)
      .populate('entityId performedBy', 'tenantName shopNumber email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100);

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// @desc    Get activity logs by type
// @route   GET /api/activity-logs/type/:entityType
// @access  Private
router.get('/type/:entityType', protect, async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ entityType: req.params.entityType })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
