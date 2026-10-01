const express = require('express');
const router = express.Router();
const {
  createStation,
  getAllStations,
  getStationById,
  updateStation,
  deleteStation,
  getRoadDistances
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes (anyone can view stations)
router.get('/', getAllStations);
router.get('/:id', getStationById);

// Protected routes (require valid JWT token)
router.post('/', protect, createStation);
router.put('/:id', protect, updateStation);
router.delete('/:id', protect, deleteStation);
router.post('/road-distances', getRoadDistances);
module.exports = router;