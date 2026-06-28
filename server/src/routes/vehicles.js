const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getVehicles);
router.get('/:id', protect, getVehicle);
router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createVehicle);
router.put('/:id', protect, authorize('admin', 'manager'), updateVehicle);
router.delete('/:id', protect, authorize('admin'), deleteVehicle);

module.exports = router;