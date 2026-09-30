const mongoose = require('mongoose');

const chargerSchema = new mongoose.Schema({
  stationID: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingStation', required: true },
  vehicleType: { type: String, required: true },
  chargingSpeed: { type: String, required: true },
  pricePerKwh: { type: Number, required: true }, // ADDED
  quantity: { type: Number, default: 1, required: true }, // ADDED (Defaults to 1)
  status: { type: String, default: 'Available' }
});

module.exports = mongoose.model('Charger', chargerSchema);