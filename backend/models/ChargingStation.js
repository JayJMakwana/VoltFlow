const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema(
  {
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    stationName: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    longitude: {
      type: Number,
      required: true
    },

    latitude: {
      type: Number,
      required: true
    },

    openingTime: {
      type: String,
      required: true,
      default: '09:00'
    },

    closingTime: {
      type: String,
      required: true,
      default: '21:00'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'ChargingStation',
  chargingStationSchema
);