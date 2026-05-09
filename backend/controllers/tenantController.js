const Tenant = require('../models/Tenant');
const Shop = require('../models/Shop');
const DepositTransaction = require('../models/DepositTransaction');
const { logActivity } = require('../utils/logger');

// @desc    Create new tenant
// @route   POST /api/tenants
// @access  Private
const createTenant = async (req, res, next) => {
  try {
    const {
      tenantName,
      phone,
      aadhaar,
      address,
      shopId,
      shopNumber,
      rentAmount,
      joiningDate,
      securityDeposit,
      depositDate,
    } = req.body;

    // Check if shop is already occupied
    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }

    if (shop.occupancyStatus === 'Occupied') {
      res.status(400);
      throw new Error('Shop is already occupied');
    }

    const tenant = await Tenant.create({
      tenantName,
      phone,
      aadhaar,
      address,
      shopId,
      shopNumber,
      rentAmount,
      joiningDate,
      securityDeposit,
      refundableAmount: securityDeposit, // Initial refundable amount is full deposit
      depositStatus: 'Active',
      depositDate: depositDate || new Date(),
    });

    // Update shop status
    shop.occupancyStatus = 'Occupied';
    shop.tenantId = tenant._id;
    await shop.save();

    // Record deposit transaction (non-blocking)
    setImmediate(() => {
      DepositTransaction.create({
        tenantId: tenant._id,
        tenantName,
        shopNumber: shopNumber || 'N/A',
        type: 'Collection',
        amount: securityDeposit,
        reason: 'Initial deposit on tenant onboarding',
        balanceBefore: 0,
        balanceAfter: securityDeposit,
      }).catch(err => console.error('Failed to record deposit transaction:', err.message));
    });

    // Log activity (non-blocking)
    setImmediate(() => {
      logActivity({
        action: 'Tenant Added',
        description: `Tenant ${tenantName} added with deposit ₹${securityDeposit}`,
        entityType: 'Tenant',
        entityId: tenant._id,
        performedBy: req.user._id,
      }).catch(err => console.error('Failed to log activity:', err.message));
    });

    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund or deduction for a tenant
// @route   PUT /api/tenants/:id/refund
// @access  Private
const processRefund = async (req, res, next) => {
  try {
    const { deductionAmount, deductionReason } = req.body;
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      res.status(404);
      throw new Error('Tenant not found');
    }

    const balanceBefore = tenant.refundableAmount;
    const amount = parseFloat(deductionAmount) || 0;
    
    // Calculate new refundable amount
    // If it's a deduction or refund, we subtract from the current refundable balance
    const newRefundable = Math.max(0, balanceBefore - amount);

    let status = 'Active';
    if (newRefundable === 0 && amount > 0) {
      status = 'Deducted';
    } else if (amount > 0 && newRefundable > 0) {
      status = 'Partial Refund';
    } else if (amount === 0 && newRefundable === 0) {
      status = 'Refunded'; // Full refund processed
    }

    tenant.refundableAmount = newRefundable;
    tenant.depositStatus = status;
    tenant.refundDate = new Date();

    const updatedTenant = await tenant.save();

    // If fully refunded or deducted (move-out settlement), vacate the shop
    if (status === 'Refunded' || status === 'Deducted') {
      await Shop.findByIdAndUpdate(tenant.shopId, {
        occupancyStatus: 'Vacant',
        tenantId: null
      });
      
      // Update tenant status to Inactive
      tenant.status = 'Inactive';
      await tenant.save();
    }

    // Record deposit transaction (non-blocking)
    setImmediate(() => {
      const transactionType = amount > 0 ? 'Deduction' : 'Refund';
      DepositTransaction.create({
        tenantId: tenant._id,
        tenantName: tenant.tenantName,
        shopNumber: tenant.shopNumber || 'N/A',
        type: transactionType,
        amount: amount,
        reason: deductionReason || (amount > 0 ? 'Deduction from deposit' : 'Refund processed'),
        balanceBefore,
        balanceAfter: newRefundable,
      }).catch(err => console.error('Failed to record deposit transaction:', err.message));
    });

    // Log activity (non-blocking)
    setImmediate(() => {
      logActivity({
        action: 'Deposit Refund Processed',
        description: `Refund processed for ${tenant.tenantName}. Deducted: ₹${amount}. Refunded: ₹${newRefundable}. Status: ${status}`,
        entityType: 'Deposit',
        entityId: tenant._id,
        performedBy: req.user._id,
      }).catch(err => console.error('Failed to log activity:', err.message));
    });

    res.json(updatedTenant);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private
const getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find().populate('shopId', 'shopNumber shopName');
    res.json(tenants);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private
const getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('shopId', 'shopNumber shopName');
    if (!tenant) {
      res.status(404);
      throw new Error('Tenant not found');
    }
    res.json(tenant);
  } catch (error) {
    next(error);
  }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private
const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      res.status(404);
      throw new Error('Tenant not found');
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logActivity({
      action: 'Tenant Updated',
      description: `Tenant ${updatedTenant.tenantName} details updated`,
      entityType: 'Tenant',
      entityId: updatedTenant._id,
      performedBy: req.user._id,
    });

    res.json(updatedTenant);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private
const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      res.status(404);
      throw new Error('Tenant not found');
    }

    // Update shop status back to Vacant
    if (tenant.shopId) {
      await Shop.findByIdAndUpdate(tenant.shopId, {
        occupancyStatus: 'Vacant',
        tenantId: null,
      });
    }

    await tenant.deleteOne();

    await logActivity({
      action: 'Tenant Deleted',
      description: `Tenant ${tenant.tenantName} deleted and shop vacated`,
      entityType: 'Tenant',
      entityId: tenant._id,
      performedBy: req.user._id,
    });

    res.json({ id: req.params.id, message: 'Tenant deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenant,
  processRefund,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
