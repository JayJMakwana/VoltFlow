const express = require('express');
const router = express.Router();

const {
  processPayment,
  getBill,
  getOwnerEarnings
} = require('../controllers/paymentController');

const {
  protect
} = require('../middleware/authMiddleware');


// Process payment
router.post(
  '/process/:paymentId',
  protect,
  processPayment
);


// View bill
router.get(
  '/bill/:bookingID',
  protect,
  getBill
);


// Owner earnings
router.get(
  '/owner/earnings',
  protect,
  getOwnerEarnings
);

module.exports = router;