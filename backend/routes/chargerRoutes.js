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

// PUBLIC/EV DRIVER ROUTES: Anyone logged in can view chargers
router.get(
  '/station/:stationId',
  protect,
  getChargersByStation
);

router.get(
  '/:id',
  protect,
  getChargerById
);

// OWNER/ADMIN ROUTES: Only authorized roles can modify chargers
router.post(
  '/',
  protect,
  authorize('StationOwner', 'Admin'),
  createCharger
);

router.put(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  updateCharger
);

router.delete(
  '/:id',
  protect,
  authorize('StationOwner', 'Admin'),
  deleteCharger
);

module.exports = router;