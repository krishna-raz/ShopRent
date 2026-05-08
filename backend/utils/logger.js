const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ action, description, entityType, entityId, performedBy }) => {
  try {
    await ActivityLog.create({
      action,
      description,
      entityType,
      entityId,
      performedBy,
    });
  } catch (error) {
    console.error('Activity Log Error:', error.message);
  }
};

module.exports = { logActivity };
