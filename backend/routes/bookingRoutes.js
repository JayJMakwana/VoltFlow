const express = require('express');

const router = express.Router();

const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getAvailableSlots,
  completeCharging
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

// ============================================================
// CREATE BOOKING
// ============================================================

router.post(
  '/',
  protect,
  createBooking
);

// ============================================================
// USER BOOKINGS
// ============================================================

router.get(
  '/my-bookings',
  protect,
  getUserBookings
);

// ============================================================
// OWNER BOOKINGS
// ============================================================

router.get(
  '/owner-bookings',
  protect,
  getOwnerBookings
);

// ============================================================
// AVAILABLE SLOTS
// ============================================================

router.get(
  '/available-slots/:stationID/:chargerID/:date',
  protect,
  getAvailableSlots
);

// ============================================================
// COMPLETE CHARGING
// ============================================================

router.post(
  '/complete/:bookingID',
  protect,
  completeCharging
);

module.exports = router;