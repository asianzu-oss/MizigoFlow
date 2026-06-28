const express = require('express');
const router = express.Router();
const { getGateLogs, getGateLog, checkIn, checkOut } = require('../controllers/gateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getGateLogs);
router.get('/:id', protect, getGateLog);
router.post('/checkin', protect, authorize('admin', 'manager', 'gate_guard'), checkIn);
router.put('/checkout/:id', protect, authorize('admin', 'manager', 'gate_guard'), checkOut);

module.exports = router;