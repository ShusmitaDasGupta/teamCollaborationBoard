const express = require('express');
const {
  getAllUsers, getUser, updateUser, deleteUser, getDashboardStats
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getAllUsers);
router.get('/stats', getDashboardStats);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
