const ChargingStation = require('../models/ChargingStation');
const Station = require('../models/ChargingStation'); 
const Charger = require('../models/Charger');
// @desc    Create a new charging station (StationOwner only)
// @route   POST /api/stations
exports.createStation = async (req, res) => {
  try {
    const { stationName, address, longitude, latitude } = req.body;

    // Verify coordinates and name
    if (!stationName || !address || longitude === undefined || latitude === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // req.user.id comes from authMiddleware
    const station = new ChargingStation({
      ownerID: req.user.id,
      stationName,
      address,
      longitude,
      latitude
    });

    await station.save();

    res.status(201).json({
      success: true,
      message: 'Charging station created successfully',
      data: station
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all stations with their chargers attached
// @route   GET /api/stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    const chargers = await Charger.find();

    // Loop through stations and attach their specific chargers
    const stationsWithChargers = stations.map(station => {
      return {
        ...station.toObject(), 
        chargers: chargers.filter(charger => 
          charger.stationID.toString() === station._id.toString()
        )
      };
    });

    res.status(200).json({ success: true, data: stationsWithChargers });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// @desc    Get single station by ID
// @route   GET /api/stations/:id
exports.getStationById = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id).populate('ownerID', 'name email phone businessName businessAddress');

    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    res.status(200).json({ success: true, data: station });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update station details (Owner only)
// @route   PUT /api/stations/:id
exports.updateStation = async (req, res) => {
  try {
    let station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // Ensure the logged-in user is the owner of this station or an Admin
    if (station.ownerID.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this station' });
    }

    station = await ChargingStation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete station (Owner or Admin)
// @route   DELETE /api/stations/:id
exports.deleteStation = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // Ensure the logged-in user is the owner or an Admin
    if (station.ownerID.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this station' });
    }

    await station.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// @desc    Get road distance and travel time from user to stations
// @route   POST /api/stations/road-distances
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
        message: 'Origin latitude and longitude are required'
      });
    }

    if (!Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Destinations are required'
      });
    }

    if (!process.env.ROUTES_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Google Routes API key is not configured'
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

      destinations: destinations.map((station) => ({
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

      console.error('Google Routes API error:', errorText);

      return res.status(response.status).json({
        success: false,
        message: 'Failed to calculate road distances',
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
        .map((line) => JSON.parse(line));
    }

    const results = routeResults.map((route) => ({
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
    console.error('Error calculating road distances:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Get stations owned by logged-in Station Owner
// @route   GET /api/stations/my-stations
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

    const stationsWithChargers = stations.map(
      station => {
        return {
          ...station.toObject(),

          chargers: chargers.filter(
            charger =>
              charger.stationID.toString() ===
              station._id.toString()
          )
        };
      }
    );

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