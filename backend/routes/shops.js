const express = require('express');
const router = express.Router();
const {
  getShops,
  getShop,
  createShop,
  updateShop,
  deleteShop,
} = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getShops).post(protect, createShop);
router
  .route('/:id')
  .get(protect, getShop)
  .put(protect, updateShop)
  .delete(protect, deleteShop);

module.exports = router;
