const express = require('express');
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getAvailableSlots,
  completeCharging,
  cancelBooking
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/owner-bookings', protect, getOwnerBookings);
router.get('/available-slots/:stationID/:chargerID/:date', protect, getAvailableSlots);
router.post('/complete/:bookingID', protect, completeCharging);
router.put('/cancel/:bookingID', protect, cancelBooking);

module.exports = router;