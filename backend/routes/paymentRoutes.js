const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/process/:paymentId', protect, processPayment);

module.exports = router;