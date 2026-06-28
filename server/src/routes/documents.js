const express = require('express');
const router = express.Router();
const { getDocuments, getDocument, generateGRN, generateWaybill, generateDeliveryNote } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.post('/grn', protect, authorize('admin', 'manager', 'storekeeper'), generateGRN);
router.post('/waybill', protect, authorize('admin', 'manager', 'storekeeper'), generateWaybill);
router.post('/delivery-note', protect, authorize('admin', 'manager', 'storekeeper'), generateDeliveryNote);

module.exports = router;