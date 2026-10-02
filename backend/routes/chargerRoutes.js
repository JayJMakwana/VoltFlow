const express = require('express');

const router = express.Router();

const {
  createCharger,
  getChargersByStation,
  getChargerById,
  updateCharger,
  deleteCharger
} = require('../controllers/chargerController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

// Owner/Admin can view chargers of their station
router.get(
  '/station/:stationId',
  protect,
  authorize('StationOwner', 'Admin'),
  getChargersByStation
);

// Owner/Admin can view one charger
router.get(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  getChargerById
);

// Owner/Admin can add charger
router.post(
  '/',
  protect,
  authorize('StationOwner', 'Admin'),
  createCharger
);

// Owner/Admin can update charger
router.put(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  updateCharger
);

// Owner/Admin can delete charger
router.delete(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  deleteCharger
);

module.exports = router;