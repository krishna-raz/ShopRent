const Shop = require('../models/Shop');
const { logActivity } = require('../utils/logger');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Private
const getShops = async (req, res, next) => {
  try {
    const shops = await Shop.find().populate('tenantId', 'tenantName phone');
    res.json(shops);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Private
const getShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('tenantId', 'tenantName phone');
    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }
    res.json(shop);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new shop
// @route   POST /api/shops
// @access  Private
const createShop = async (req, res, next) => {
  try {
    const { shopNumber, shopName, floor, monthlyRent, rentAmount } = req.body;

    const shopExists = await Shop.findOne({ shopNumber });
    if (shopExists) {
      res.status(400);
      throw new Error('Shop number already exists');
    }

    const shop = await Shop.create({
      shopNumber,
      shopName,
      floor,
      monthlyRent,
      rentAmount: rentAmount || monthlyRent,
    });

    await logActivity({
      action: 'Shop Created',
      description: `Shop ${shopNumber} created`,
      entityType: 'Shop',
      entityId: shop._id,
      performedBy: req.user._id,
    });

    res.status(201).json(shop);
  } catch (error) {
    next(error);
  }
};

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private
const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }

    const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logActivity({
      action: 'Shop Updated',
      description: `Shop ${shop.shopNumber} updated`,
      entityType: 'Shop',
      entityId: shop._id,
      performedBy: req.user._id,
    });

    res.json(updatedShop);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private
const deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }

    if (shop.occupancyStatus === 'Occupied') {
      res.status(400);
      throw new Error('Cannot delete an occupied shop');
    }

    await shop.deleteOne();

    await logActivity({
      action: 'Shop Deleted',
      description: `Shop ${shop.shopNumber} deleted`,
      entityType: 'Shop',
      entityId: shop._id,
      performedBy: req.user._id,
    });

    res.json({ id: req.params.id, message: 'Shop deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShops,
  getShop,
  createShop,
  updateShop,
  deleteShop,
};
