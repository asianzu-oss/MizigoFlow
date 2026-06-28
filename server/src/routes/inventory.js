const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, receiveGoods, getLowStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getProducts);
router.get('/lowstock', protect, getLowStock);
router.get('/:id', protect, getProduct);
router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager', 'storekeeper'), updateProduct);
router.post('/grn', protect, authorize('admin', 'manager', 'storekeeper'), receiveGoods);

module.exports = router;