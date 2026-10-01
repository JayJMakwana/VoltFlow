const Booking = require('../models/Booking');
const Charger = require('../models/Charger');
const Payment = require('../models/Payment');
const Station = require('../models/ChargingStation');

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      stationID,
      chargerID,
      bookingDate,
      startTime,
      endTime
    } = req.body;

    // Check charger
    const charger = await Charger.findById(chargerID);

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    // Check charger availability
    if (charger.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Charger is currently unavailable'
      });
    }

    // Check whether the selected time is already booked
    const existingBooking = await Booking.findOne({
      stationID,
      chargerID,
      bookingDate,
      bookingStatus: {
        $in: ['Pending', 'Confirmed']
      },
      startTime: {
        $lt: endTime
      },
      endTime: {
        $gt: startTime
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Generate verification PIN
    const verificationPIN = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    // Create booking
    const booking = new Booking({
      userID: req.user.id,
      stationID,
      chargerID,
      bookingDate,
      startTime,
      endTime,
      bookingStatus: 'Pending',
      verificationPIN
    });

    await booking.save();

    // Create payment
    const payment = new Payment({
      bookingID: booking._id,
      amount: 150,
      paymentStatus: 'Pending',
      transactionID: `TXN_${Date.now()}`
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Proceed to payment.',
      data: {
        booking,
        payment
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Get bookings of logged-in EV user
// @route   GET /api/bookings/my-bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userID: req.user.id
    })
      .populate(
        'stationID',
        'stationName address openingTime closingTime'
      )
      .populate(
        'chargerID',
        'vehicleType chargingSpeed pricePerKwh chargingDuration status'
      )
      .sort({
        bookingDate: -1,
        startTime: -1
      });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Get bookings for stations owned by Station Owner
// @route   GET /api/bookings/owner-bookings
exports.getOwnerBookings = async (req, res) => {
  try {
    // Find stations owned by logged-in owner
    const ownerStations = await Station.find({
      ownerID: req.user.id
    }).select('_id');

    const stationIds = ownerStations.map(
      station => station._id
    );

    // Find bookings for those stations
    const bookings = await Booking.find({
      stationID: {
        $in: stationIds
      }
    })
      .populate(
        'userID',
        'name email phone'
      )
      .populate(
        'stationID',
        'stationName address openingTime closingTime'
      )
      .populate(
        'chargerID',
        'vehicleType chargingSpeed pricePerKwh chargingDuration status'
      )
      .sort({
        bookingDate: -1,
        startTime: -1
      });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error(
      'Error fetching owner bookings:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Get available slots for a charger
// @route   GET /api/bookings/available-slots/:stationID/:chargerID/:date
exports.getAvailableSlots = async (req, res) => {
  try {
    const {
      stationID,
      chargerID,
      date
    } = req.params;

    // Find station
    const station = await Station.findById(
      stationID
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // Find charger
    const charger = await Charger.findById(
      chargerID
    );

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    // Make sure charger belongs to selected station
    if (
      charger.stationID.toString() !==
      stationID.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Charger does not belong to this station'
      });
    }

    // Get existing bookings for this charger and date
    const bookings = await Booking.find({
      stationID,
      chargerID,
      bookingDate: date,
      bookingStatus: {
        $in: ['Pending', 'Confirmed']
      }
    });

    // Convert HH:MM to minutes
    const convertToMinutes = (time) => {
      const [hours, minutes] =
        time.split(':').map(Number);

      return hours * 60 + minutes;
    };

    // Convert minutes to HH:MM
    const convertToTime = (minutes) => {
      const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');

      const mins = (minutes % 60)
        .toString()
        .padStart(2, '0');

      return `${hours}:${mins}`;
    };

    const openingMinutes =
      convertToMinutes(
        station.openingTime
      );

    const closingMinutes =
      convertToMinutes(
        station.closingTime
      );

    // Charger-specific duration
    const chargingDuration =
      Number(charger.chargingDuration);

    if (
      !chargingDuration ||
      chargingDuration <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charger charging duration'
      });
    }

    const slots = [];

    // Generate slots based on charger duration
    for (
      let start = openingMinutes;
      start + chargingDuration <= closingMinutes;
      start += chargingDuration
    ) {
      const end =
        start + chargingDuration;

      const startTime =
        convertToTime(start);

      const endTime =
        convertToTime(end);

      // Check whether this slot overlaps
      // with an existing booking
      const isBooked = bookings.some(
        (booking) => {
          const bookingStart =
            convertToMinutes(
              booking.startTime
            );

          const bookingEnd =
            convertToMinutes(
              booking.endTime
            );

          return (
            bookingStart < end &&
            bookingEnd > start
          );
        }
      );

      slots.push({
        startTime,
        endTime,
        available: !isBooked
      });
    }

    res.status(200).json({
      success: true,
      date,
      stationHours: {
        openingTime:
          station.openingTime,
        closingTime:
          station.closingTime
      },
      chargerDuration:
        chargingDuration,
      data: slots
    });

  } catch (error) {
    console.error(
      'Error generating available slots:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
