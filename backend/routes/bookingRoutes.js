const express = require('express');
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getAvailableSlots
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

// Create booking
router.post('/', protect, createBooking);

// Get logged-in user's bookings
router.get('/my-bookings', protect, getUserBookings);

// Get bookings for owner's stations
router.get('/owner-bookings', protect, getOwnerBookings);

// Get available slots
router.get(
  '/available-slots/:stationID/:chargerID/:date',
  protect,
  getAvailableSlots
);

module.exports = router;