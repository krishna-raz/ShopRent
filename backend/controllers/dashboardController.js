const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Shop = require('../models/Shop');
const ActivityLog = require('../models/ActivityLog');
const DepositTransaction = require('../models/DepositTransaction');

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard
// @access  Private
const getDashboardKPIs = async (req, res, next) => {
  try {
    // Get tenants
    const allTenants = await Tenant.find();
    const activeTenants = await Tenant.find({ status: 'Active' });
    const inactiveTenants = await Tenant.find({ status: 'Inactive' });

    // Calculate deposit metrics
    const activeDeposits = allTenants.filter(t => t.depositStatus === 'Active');
    const totalDepositsHeld = activeDeposits.reduce((sum, t) => sum + (t.securityDeposit || 0), 0);
    const totalRefundableAmount = activeDeposits.reduce((sum, t) => sum + (t.refundableAmount || 0), 0);

    const refundedDeposits = await DepositTransaction.find({ type: 'Refund' });
    const totalRefunded = refundedDeposits.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Get shop metrics
    const allShops = await Shop.find();
    const occupiedShops = await Shop.countDocuments({ occupancyStatus: 'Occupied' });
    const vacantShops = allShops.length - occupiedShops;

    // Calculate revenue
    const paidPayments = await Payment.find({ status: { $in: ['Paid', 'Partial'] } });
    const monthlyRevenue = paidPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

    // Calculate pending dues
    const pendingPayments = await Payment.find({ status: { $ne: 'Paid' } });
    const totalPendingDues = pendingPayments.reduce((sum, p) => sum + (p.dueAmount || 0), 0);

    // Get recent data
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const recentPayments = await Payment.find()
      .sort({ paymentDate: -1 })
      .limit(5);

    res.json({
      deposits: {
        totalDepositsHeld,
        totalRefundableAmount,
        totalRefunded,
        activeDepositsCount: activeDeposits.length,
      },
      shops: {
        total: allShops.length,
        occupied: occupiedShops,
        vacant: vacantShops,
      },
      tenants: {
        total: allTenants.length,
        active: activeTenants.length,
        inactive: inactiveTenants.length,
      },
      financial: {
        monthlyRevenue,
        totalPendingDues,
      },
      recentActivities,
      recentPayments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    await getDashboardKPIs(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardKPIs,
  getDashboardSummary,
};
