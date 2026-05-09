const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.get('/users', protect, authorize('superadmin'), getUsers);
router.post('/users', protect, authorize('superadmin'), createUser);
router.put('/users/:id', protect, authorize('superadmin'), updateUser);
router.delete('/users/:id', protect, authorize('superadmin'), deleteUser);

module.exports = router;
