const express = require('express');
const router = express.Router();
const { getDrivers, getDriver, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getDrivers);
router.get('/:id', protect, getDriver);
router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createDriver);
router.put('/:id', protect, authorize('admin', 'manager'), updateDriver);
router.delete('/:id', protect, authorize('admin'), deleteDriver);

module.exports = router;