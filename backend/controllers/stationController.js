const ChargingStation = require('../models/ChargingStation');
const Charger = require('../models/Charger');

// ============================================================
// CREATE STATION
// ============================================================
// POST /api/stations
exports.createStation = async (req, res) => {
  try {
    const {
      stationName,
      address,
      longitude,
      latitude,
      openingTime,
      closingTime
    } = req.body;

    if (
      !stationName ||
      !address ||
      longitude === undefined ||
      latitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const station = new ChargingStation({
      ownerID: req.user.id,
      stationName,
      address,
      longitude,
      latitude,
      openingTime: openingTime || '09:00',
      closingTime: closingTime || '21:00'
    });

    await station.save();

    res.status(201).json({
      success: true,
      message: 'Charging station created successfully',
      data: station
    });
  } catch (error) {
    console.error('Create station error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ============================================================
// GET ALL STATIONS
// ============================================================
// GET /api/stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await ChargingStation.find();
    const chargers = await Charger.find();

    const stationsWithChargers = stations.map(station => ({
      ...station.toObject(),

      chargers: chargers.filter(
        charger =>
          charger.stationID.toString() ===
          station._id.toString()
      )
    }));

    res.status(200).json({
      success: true,
      data: stationsWithChargers
    });
  } catch (error) {
    console.error('Error fetching stations:', error);

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};


// ============================================================
// GET OWNER'S STATIONS
// ============================================================
// GET /api/stations/my-stations
exports.getMyStations = async (req, res) => {
  try {
    const stations = await ChargingStation.find({
      ownerID: req.user.id
    });

    const stationIds = stations.map(
      station => station._id
    );

    const chargers = await Charger.find({
      stationID: { $in: stationIds }
    });

    const stationsWithChargers = stations.map(station => ({
      ...station.toObject(),

      chargers: chargers.filter(
        charger =>
          charger.stationID.toString() ===
          station._id.toString()
      )
    }));

    res.status(200).json({
      success: true,
      count: stationsWithChargers.length,
      data: stationsWithChargers
    });
  } catch (error) {
    console.error(
      'Error fetching owner stations:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ============================================================
// GET SINGLE STATION
// ============================================================
// GET /api/stations/:id
exports.getStationById = async (req, res) => {
  try {
    const station = await ChargingStation.findById(
      req.params.id
    ).populate(
      'ownerID',
      'name email phone businessName businessAddress'
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ============================================================
// UPDATE STATION
// ============================================================
// PUT /api/stations/:id
exports.updateStation = async (req, res) => {
  try {
    const station = await ChargingStation.findById(
      req.params.id
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Owner can update only their own station.
    // Admin can update any station.
    if (
      station.ownerID.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not own this station'
      });
    }

    const allowedFields = [
      'stationName',
      'address',
      'longitude',
      'latitude',
      'openingTime',
      'closingTime'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        station[field] = req.body[field];
      }
    });

    await station.save();

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station
    });
  } catch (error) {
    console.error('Update station error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ============================================================
// DELETE STATION
// ============================================================
// DELETE /api/stations/:id
exports.deleteStation = async (req, res) => {
  try {
    const station = await ChargingStation.findById(
      req.params.id
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Owner can delete only their own station.
    // Admin can delete any station.
    if (
      station.ownerID.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not own this station'
      });
    }

    // Delete all chargers belonging to this station
    await Charger.deleteMany({
      stationID: station._id
    });

    await station.deleteOne();

    res.status(200).json({
      success: true,
      message:
        'Station and its chargers deleted successfully'
    });
  } catch (error) {
    console.error('Delete station error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ============================================================
// ROAD DISTANCES
// ============================================================
// POST /api/stations/road-distances
exports.getRoadDistances = async (req, res) => {
  try {
    const { origin, destinations } = req.body;

    if (
      !origin ||
      origin.latitude === undefined ||
      origin.longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Origin latitude and longitude are required'
      });
    }

    if (
      !Array.isArray(destinations) ||
      destinations.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Destinations are required'
      });
    }

    if (!process.env.ROUTES_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          'Google Routes API key is not configured'
      });
    }

    const requestBody = {
      origins: [
        {
          waypoint: {
            location: {
              latLng: {
                latitude: Number(origin.latitude),
                longitude: Number(origin.longitude)
              }
            }
          }
        }
      ],

      destinations: destinations.map(station => ({
        waypoint: {
          location: {
            latLng: {
              latitude: Number(station.latitude),
              longitude: Number(station.longitude)
            }
          }
        }
      })),

      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE'
    };

    const response = await fetch(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.ROUTES_API_KEY,
          'X-Goog-FieldMask':
            'originIndex,destinationIndex,distanceMeters,duration,condition,status'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Google Routes API error:',
        errorText
      );

      return res.status(response.status).json({
        success: false,
        message:
          'Failed to calculate road distances',
        error: errorText
      });
    }

    const responseText = await response.text();

    let routeResults;

    try {
      routeResults = JSON.parse(responseText);
    } catch {
      routeResults = responseText
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));
    }

    const results = routeResults.map(route => ({
      destinationIndex: route.destinationIndex,
      distanceMeters: route.distanceMeters,

      distanceKm: route.distanceMeters
        ? route.distanceMeters / 1000
        : null,

      duration: route.duration || null,
      condition: route.condition || null,
      status: route.status || null
    }));

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error(
      'Error calculating road distances:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};