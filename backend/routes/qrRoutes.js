const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

// @route POST /api/qr/create
router.post('/create', qrController.createQR);

// @route GET /api/qr
router.get('/', qrController.getAllQRs);

// @route GET /api/qr/analytics/overview
router.get('/analytics/overview', qrController.getOverallAnalytics);

// @route GET /api/qr/:code/analytics
router.get('/:code/analytics', qrController.getAnalytics);

// @route GET /api/qr/:code
router.get('/:code', qrController.getQRByCode);

// @route PUT /api/qr/:code
router.put('/:code', qrController.updateQR);

// @route DELETE /api/qr/:code
router.delete('/:code', qrController.deleteQR);

module.exports = router;
