const mongoose = require('mongoose');

const chargerSchema = new mongoose.Schema(
  {
    stationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingStation',
      required: true
    },

    vehicleType: {
      type: String,
      required: true
    },

    chargingSpeed: {
      type: String,
      required: true
    },

    pricePerKwh: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    chargingDuration: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['Available', 'Unavailable', 'Maintenance'],
      default: 'Available'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Charger', chargerSchema);