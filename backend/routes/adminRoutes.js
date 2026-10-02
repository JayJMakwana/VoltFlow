const express = require('express');

const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getAllStations,
  getAllBookings,
  deleteStation,
  getSystemReport,
  updateUser,
  updateStation,
  getAllChargers,
  updateCharger,
  deleteCharger
} = require('../controllers/adminController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');


// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  '/dashboard',
  protect,
  authorize('Admin'),
  getDashboardStats
);


// =====================================================
// USERS
// =====================================================

router.get(
  '/users',
  protect,
  authorize('Admin'),
  getAllUsers
);


// =====================================================
// STATIONS
// =====================================================

router.get(
  '/stations',
  protect,
  authorize('Admin'),
  getAllStations
);


// =====================================================
// BOOKINGS
// =====================================================

router.get(
  '/bookings',
  protect,
  authorize('Admin'),
  getAllBookings
);


// =====================================================
// DELETE STATION
// =====================================================

router.delete(
  '/stations/:id',
  protect,
  authorize('Admin'),
  deleteStation
);


// =====================================================
// SYSTEM REPORT
// =====================================================

router.get(
  '/reports',
  protect,
  authorize('Admin'),
  getSystemReport
);

router.put(
  '/users/:id',
  protect,
  authorize('Admin'),
  updateUser
);

router.put(
  '/stations/:id',
  protect,
  authorize('Admin'),
  updateStation
);

router.put(
  '/chargers/:id',
  protect,
  authorize('Admin'),
  updateCharger
);

router.put(
  '/users/:id',
  protect,
  authorize('Admin'),
  updateUser
);

router.put(
  '/stations/:id',
  protect,
  authorize('Admin'),
  updateStation
);

router.get(
  '/chargers',
  protect,
  authorize('Admin'),
  getAllChargers
);

router.put(
  '/chargers/:id',
  protect,
  authorize('Admin'),
  updateCharger
);

router.delete(
  '/chargers/:id',
  protect,
  authorize('Admin'),
  deleteCharger
);

module.exports = router;