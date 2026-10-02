const express = require('express');

const router = express.Router();

const {
  createStation,
  getAllStations,
  getMyStations,
  getStationById,
  updateStation,
  deleteStation,
  getRoadDistances
} = require('../controllers/stationController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');


// ============================================================
// PUBLIC STATION ROUTES
// ============================================================

// Get all stations
// Used by EV users for station discovery
router.get(
  '/',
  getAllStations
);


// ============================================================
// OWNER STATION ROUTE
// ============================================================

// Get only stations belonging to logged-in owner
router.get(
  '/my-stations',
  protect,
  authorize('StationOwner'),
  getMyStations
);


// ============================================================
// SINGLE STATION
// ============================================================

router.get(
  '/:id',
  getStationById
);


// ============================================================
// CREATE STATION
// ============================================================

router.post(
  '/',
  protect,
  authorize('StationOwner', 'Admin'),
  createStation
);


// ============================================================
// UPDATE STATION
// ============================================================

router.put(
  '/:id',
  protect,
  updateStation
);


// ============================================================
// DELETE STATION
// ============================================================

router.delete(
  '/:id',
  protect,
  deleteStation
);


// ============================================================
// ROAD DISTANCES
// ============================================================

router.post(
  '/road-distances',
  getRoadDistances
);


module.exports = router;