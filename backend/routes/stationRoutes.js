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

router.get('/', getAllStations);

router.get(
  '/my-stations',
  protect,
  authorize('StationOwner'),
  getMyStations
);

router.get(
  '/:id',
  getStationById
);

router.post(
  '/',
  protect,
  authorize('StationOwner', 'Admin'),
  createStation
);

router.put(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  updateStation
);

router.delete(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  deleteStation
);

router.post(
  '/road-distances',
  getRoadDistances
);

module.exports = router;