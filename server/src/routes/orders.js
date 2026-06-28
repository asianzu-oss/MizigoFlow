const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, confirmDispatch } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createOrder);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.post('/:id/dispatch', protect, authorize('admin', 'manager', 'storekeeper'), confirmDispatch);

module.exports = router;