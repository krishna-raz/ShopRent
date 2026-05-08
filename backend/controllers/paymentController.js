const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const PaymentTransaction = require('../models/PaymentTransaction');
const { logActivity } = require('../utils/logger');

// @desc    Add monthly rent payment
// @route   POST /api/payments
// @access  Private
const addPayment = async (req, res, next) => {
  try {
    const { tenantId, month, paidAmount, paymentMode, notes, paymentDate } = req.body;
    const amount = parseFloat(paidAmount);

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404);
      throw new Error('Tenant not found');
    }

    const rentAmount = tenant.rentAmount;

    // 1. Check if a payment record already exists for this tenant and month
    let payment = await Payment.findOne({ tenantId, month });

    if (payment) {
      // 2. Incremental: Update existing merged monthly record
      const totalPaid = payment.paidAmount + amount;
      const currentDue = Math.max(0, rentAmount - totalPaid);
      const currentStatus = totalPaid >= rentAmount ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending';

      payment.paidAmount = totalPaid;
      payment.dueAmount = currentDue;
      payment.status = currentStatus;
      payment.paymentMode = paymentMode || payment.paymentMode;
      payment.notes = notes ? `${payment.notes || ''}\n[Update]: ${notes}` : payment.notes;
      payment.paymentDate = paymentDate || new Date();
      await payment.save();

      // Create individual transaction record
      await PaymentTransaction.create({
        paymentId: payment._id,
        tenantId: tenant._id,
        tenantName: tenant.tenantName,
        shopNumber: tenant.shopNumber,
        month,
        rentAmount,
        transactionAmount: amount,
        paidAmount: totalPaid,
        remainingDue: currentDue,
        status: currentStatus,
        paymentMode: paymentMode || 'Cash',
        notes: notes,
        date: paymentDate || new Date()
      });

      await logActivity({
        action: 'Payment Updated',
        description: `Additional payment of ₹${amount} recorded for ${tenant.tenantName} - Month: ${month}. New Total: ₹${totalPaid}, Status: ${currentStatus}`,
        entityType: 'Payment',
        entityId: payment._id,
        performedBy: req.user._id,
      });

    } else {
      // 3. First time payment for this month
      const dueAmount = Math.max(0, rentAmount - amount);
      const status = amount >= rentAmount ? 'Paid' : amount > 0 ? 'Partial' : 'Pending';

      payment = await Payment.create({
        tenantId,
        tenantName: tenant.tenantName,
        shopNumber: tenant.shopNumber,
        month,
        rentAmount,
        paidAmount: amount,
        dueAmount,
        status,
        paymentMode: paymentMode || 'Cash',
        paymentDate: paymentDate || new Date(),
        notes,
      });

      // Create individual transaction record
      await PaymentTransaction.create({
        paymentId: payment._id,
        tenantId: tenant._id,
        tenantName: tenant.tenantName,
        shopNumber: tenant.shopNumber,
        month,
        rentAmount,
        transactionAmount: amount,
        paidAmount: amount,
        remainingDue: dueAmount,
        status: status,
        paymentMode: paymentMode || 'Cash',
        notes: notes,
        date: paymentDate || new Date()
      });

      await logActivity({
        action: 'Payment Added',
        description: `Initial payment of ₹${amount} recorded for ${tenant.tenantName} - Month: ${month}, Status: ${status}`,
        entityType: 'Payment',
        entityId: payment._id,
        performedBy: req.user._id,
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (merged monthly records)
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    const { tenantId, status, month } = req.query;
    const query = {};

    if (tenantId) query.tenantId = tenantId;
    if (status) query.status = status;
    if (month) query.month = month;

    const payments = await Payment.find(query)
      .populate('tenantId', 'tenantName phone shopNumber')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history for a tenant
// @route   GET /api/payments/tenant/:tenantId
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ tenantId: req.params.tenantId })
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending dues
// @route   GET /api/payments/pending-dues
// @access  Private
const getPendingDues = async (req, res, next) => {
  try {
    const pendingPayments = await Payment.find({ status: { $ne: 'Paid' } })
      .populate('tenantId', 'tenantName phone shopNumber status')
      .sort({ paymentDate: -1 });

    const duesMap = {};
    pendingPayments.forEach(payment => {
      if (payment.tenantId) {
        const tenantId = payment.tenantId._id.toString();
        if (!duesMap[tenantId]) {
          duesMap[tenantId] = {
            tenantId: payment.tenantId._id,
            tenantName: payment.tenantId.tenantName,
            phone: payment.tenantId.phone,
            shopNumber: payment.tenantId.shopNumber,
            status: payment.tenantId.status,
            totalDue: 0,
            pendingCount: 0,
            lastPaymentDate: null,
          };
        }
        duesMap[tenantId].totalDue += payment.dueAmount;
        duesMap[tenantId].pendingCount += 1;
        duesMap[tenantId].lastPaymentDate = payment.paymentDate;
      }
    });

    const dues = Object.values(duesMap);
    res.json(dues);
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    await logActivity({
      action: 'Payment Updated',
      description: `Payment updated for ${payment.tenantName} - Month: ${payment.month}`,
      entityType: 'Payment',
      entityId: payment._id,
      performedBy: req.user._id,
    });

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all individual payment transactions (oldest first)
// @route   GET /api/payments/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await PaymentTransaction.find()
      .sort({ date: 1 });  // oldest first, latest last
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPayment,
  getPayments,
  getPaymentHistory,
  getPendingDues,
  updatePayment,
  getTransactions,
};
