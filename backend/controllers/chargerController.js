const Charger = require('../models/Charger');
const ChargingStation = require('../models/ChargingStation');

// @desc    Add a new charger
// @route   POST /api/chargers
exports.createCharger = async (req, res) => {
  try {
    const { stationID, vehicleType, chargingSpeed, pricePerKwh, chargingDuration, quantity, status } = req.body;

    if (!stationID || !vehicleType || !chargingSpeed || pricePerKwh === undefined || chargingDuration === undefined || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide stationID, vehicleType, chargingSpeed, pricePerKwh, chargingDuration and quantity' });
    }
    if (Number(pricePerKwh) <= 0) return res.status(400).json({ success: false, message: 'Price per kWh must be greater than 0' });
    if (Number(chargingDuration) <= 0) return res.status(400).json({ success: false, message: 'Charging duration must be greater than 0' });
    if (Number(quantity) <= 0) return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });

    const station = await ChargingStation.findById(stationID);
    if (!station) return res.status(404).json({ success: false, message: 'Charging station not found' });

    if (station.ownerID.toString() !== req.user.id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this station' });
    }

    const charger = new Charger({
      stationID,
      vehicleType,
      chargingSpeed,
      pricePerKwh: Number(pricePerKwh),
      chargingDuration: Number(chargingDuration),
      quantity: Number(quantity),
      status: status || 'Available'
    });

    await charger.save();
    res.status(201).json({ success: true, message: 'Charger added successfully to station', data: charger });
  } catch (error) {
    console.error('Error adding charger:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all chargers for a station (PUBLIC VIEW)
// @route   GET /api/chargers/station/:stationId
exports.getChargersByStation = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.stationId);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Charging station not found' });
    }

    // AUTH BLOCK REMOVED SO DRIVERS CAN VIEW THIS LIST
    const chargers = await Charger.find({ stationID: req.params.stationId });

    res.status(200).json({ success: true, count: chargers.length, data: chargers });
  } catch (error) {
    console.error('Error fetching chargers:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single charger (PUBLIC VIEW)
// @route   GET /api/chargers/:id
exports.getChargerById = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id).populate('stationID', 'stationName address ownerID');
    if (!charger) {
      return res.status(404).json({ success: false, message: 'Charger not found' });
    }

    // AUTH BLOCK REMOVED SO DRIVERS CAN VIEW THE CHARGER

    res.status(200).json({ success: true, data: charger });
  } catch (error) {
    console.error('Error fetching charger:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update charger
// @route   PUT /api/chargers/:id
exports.updateCharger = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).json({ success: false, message: 'Charger not found' });

    const station = await ChargingStation.findById(charger.stationID);
    if (!station) return res.status(404).json({ success: false, message: 'Charging station not found' });

    if (station.ownerID.toString() !== req.user.id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this charger' });
    }

    const allowedFields = ['vehicleType', 'chargingSpeed', 'pricePerKwh', 'chargingDuration', 'quantity', 'status'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (updateData.pricePerKwh !== undefined && Number(updateData.pricePerKwh) <= 0) return res.status(400).json({ success: false, message: 'Price per kWh must be greater than 0' });
    if (updateData.chargingDuration !== undefined && Number(updateData.chargingDuration) <= 0) return res.status(400).json({ success: false, message: 'Charging duration must be greater than 0' });
    if (updateData.quantity !== undefined && Number(updateData.quantity) <= 0) return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });

    if (updateData.pricePerKwh !== undefined) updateData.pricePerKwh = Number(updateData.pricePerKwh);
    if (updateData.chargingDuration !== undefined) updateData.chargingDuration = Number(updateData.chargingDuration);
    if (updateData.quantity !== undefined) updateData.quantity = Number(updateData.quantity);

    const updatedCharger = await Charger.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Charger updated successfully', data: updatedCharger });
  } catch (error) {
    console.error('Error updating charger:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete charger
// @route   DELETE /api/chargers/:id
exports.deleteCharger = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).json({ success: false, message: 'Charger not found' });

    const station = await ChargingStation.findById(charger.stationID);
    if (!station) return res.status(404).json({ success: false, message: 'Charging station not found' });

    if (station.ownerID.toString() !== req.user.id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this charger' });
    }

    await charger.deleteOne();
    res.status(200).json({ success: true, message: 'Charger deleted successfully' });
  } catch (error) {
    console.error('Error deleting charger:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};