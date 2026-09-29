const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getOwnerBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/owner-bookings', protect, authorize('StationOwner'), getOwnerBookings);

module.exports = router;