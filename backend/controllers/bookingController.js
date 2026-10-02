const Booking = require('../models/Booking');
const Charger = require('../models/Charger');
const Payment = require('../models/Payment');
const Station = require('../models/ChargingStation');


// ============================================================
// CREATE BOOKING
// ============================================================

exports.createBooking = async (req, res) => {
  try {
    const {
      stationID,
      chargerID,
      bookingDate,
      startTime,
      endTime
    } = req.body;

    // --------------------------------------------------------
    // Validate required fields
    // --------------------------------------------------------

    if (
      !stationID ||
      !chargerID ||
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all booking details'
      });
    }

    // --------------------------------------------------------
    // Check whether selected date is in the past
    // --------------------------------------------------------

    const now = new Date();

    const today =
      `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book a slot from a past date.'
      });
    }

    // --------------------------------------------------------
    // Check whether selected time has already passed
    // --------------------------------------------------------

    if (bookingDate === today) {
      const [hours, minutes] =
        startTime.split(':').map(Number);

      const selectedMinutes =
        hours * 60 + minutes;

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      if (selectedMinutes <= currentMinutes) {
        return res.status(400).json({
          success: false,
          message:
            'This time slot has already passed. Please select another slot.'
        });
      }
    }

    // --------------------------------------------------------
    // Find station
    // --------------------------------------------------------

    const station = await Station.findById(
      stationID
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    // --------------------------------------------------------
    // Find charger
    // --------------------------------------------------------

    const charger = await Charger.findById(
      chargerID
    );

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    // --------------------------------------------------------
    // Check charger belongs to station
    // --------------------------------------------------------

    if (
      charger.stationID.toString() !==
      stationID.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Charger does not belong to this station'
      });
    }

    // --------------------------------------------------------
    // Check charger status
    // --------------------------------------------------------

    if (charger.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message:
          'Charger is currently unavailable'
      });
    }

    // --------------------------------------------------------
    // Check overlapping bookings
    // --------------------------------------------------------

    // --------------------------------------------------------
// Check overlapping bookings
// --------------------------------------------------------

// --------------------------------------------------------
// Check charger capacity
// --------------------------------------------------------

// Find all chargers of the same vehicle type
// at this station
const sameTypeChargers =
  await Charger.find({
    stationID,
    vehicleType: charger.vehicleType,
    status: {
      $ne: 'Maintenance'
    }
  });

// Total physical chargers
const totalChargers =
  sameTypeChargers.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

// IDs of all charger records
const sameTypeChargerIDs =
  sameTypeChargers.map(
    item => item._id
  );

// Find all active bookings for these chargers
const activeBookings =
  await Booking.find({
    stationID,
    chargerID: {
      $in: sameTypeChargerIDs
    },
    bookingDate,
    bookingStatus: {
      $in: [
        'Pending',
        'Confirmed',
        'In Progress'
      ]
    }
  });

// --------------------------------------------------------
// Find overlapping bookings
// --------------------------------------------------------

const overlappingBookings =
  activeBookings.filter((booking) => {

    const existingStart =
      booking.startTime;

    const existingEnd =
      booking.endTime;

    return (
      existingStart < endTime &&
      existingEnd > startTime
    );
  });

// --------------------------------------------------------
// Check capacity
// --------------------------------------------------------

if (
  overlappingBookings.length >=
  totalChargers
) {
  return res.status(400).json({
    success: false,
    message:
      'All chargers are already booked for this time slot'
  });
}

// --------------------------------------------------------
// Charger quantity
// --------------------------------------------------------

const chargerQuantity =
  Number(charger.quantity || 1);

// --------------------------------------------------------
// Check capacity
// --------------------------------------------------------

if (
  overlappingBookings.length >=
  chargerQuantity
) {
  return res.status(400).json({
    success: false,
    message:
      'All chargers are already booked for this time slot'
  });
}

    // --------------------------------------------------------
    // Generate 4 digit verification PIN
    // --------------------------------------------------------

    const verificationPIN =
      Math.floor(
        1000 + Math.random() * 9000
      ).toString();

    // --------------------------------------------------------
    // Create booking
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Default payment amount
    // --------------------------------------------------------

    const baseAmount = 150;

    // Default tax rate
    const taxRate = 18;

    const taxAmount =
      (baseAmount * taxRate) / 100;

    const totalAmount =
      baseAmount + taxAmount;

    // --------------------------------------------------------
    // Create payment
    // --------------------------------------------------------

    const payment = new Payment({
      bookingID: booking._id,
      amount: baseAmount,
      taxRate: taxRate,
      taxAmount: Number(
        taxAmount.toFixed(2)
      ),
      totalAmount: Number(
        totalAmount.toFixed(2)
      ),
      paymentStatus: 'Pending',
      transactionID:
        `TXN_${Date.now()}`,
      billGenerated: false
    });

    await payment.save();

    // --------------------------------------------------------
    // Store payment ID inside booking
    // --------------------------------------------------------

    booking.paymentID = payment._id;

    await booking.save();

    // --------------------------------------------------------
    // Get complete booking information
    // --------------------------------------------------------

    const completeBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          'stationID',
          'stationName address openingTime closingTime'
        )
        .populate(
          'chargerID',
          'vehicleType chargingSpeed pricePerKwh chargingDuration status'
        )
        .populate(
          'paymentID',
          'amount taxRate taxAmount totalAmount paymentStatus transactionID billGenerated'
        );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(201).json({
      success: true,
      message:
        'Booking created successfully. Proceed to payment.',
      data: {
        booking: completeBooking,
        payment
      }
    });

  } catch (error) {
    console.error(
      'Error creating booking:',
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
// GET USER BOOKINGS
// ============================================================

exports.getUserBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
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
        .populate(
          'paymentID',
          'amount taxRate taxAmount totalAmount paymentStatus transactionID billGenerated billGeneratedAt'
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
      'Error fetching user bookings:',
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
// GET OWNER BOOKINGS
// ============================================================

exports.getOwnerBookings = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // Find owner's stations
    // --------------------------------------------------------

    const ownerStations =
      await Station.find({
        ownerID: req.user.id
      }).select('_id');

    const stationIds =
      ownerStations.map(
        station => station._id
      );

    // --------------------------------------------------------
    // Find bookings
    // --------------------------------------------------------

    const bookings =
      await Booking.find({
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
        .populate(
          'paymentID',
          'amount taxRate taxAmount totalAmount paymentStatus transactionID billGenerated billGeneratedAt'
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

// ============================================================
// GET AVAILABLE SLOTS
// ============================================================

// ============================================================
// GET AVAILABLE SLOTS
// ============================================================

exports.getAvailableSlots = async (req, res) => {
  try {
    const {
      stationID,
      chargerID,
      date
    } = req.params;

    // --------------------------------------------------------
    // Find station
    // --------------------------------------------------------

    const station = await Station.findById(stationID);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    // --------------------------------------------------------
    // Find selected charger
    // --------------------------------------------------------

    const selectedCharger =
      await Charger.findById(chargerID);

    if (!selectedCharger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    // --------------------------------------------------------
    // Check charger belongs to station
    // --------------------------------------------------------

    if (
      selectedCharger.stationID.toString() !==
      stationID.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Charger does not belong to this station'
      });
    }

    // --------------------------------------------------------
    // Find all chargers of same vehicle type
    // --------------------------------------------------------

    const chargers = await Charger.find({
      stationID,
      vehicleType: selectedCharger.vehicleType,
      status: {
        $ne: 'Maintenance'
      }
    });

    if (chargers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No chargers found'
      });
    }

    // --------------------------------------------------------
    // IMPORTANT:
    // quantity = number of physical chargers
    //
    // Example:
    // Charger document 1 -> quantity = 3
    //
    // Therefore:
    // totalChargers = 3
    // NOT chargers.length = 1
    // --------------------------------------------------------

    const totalChargers =
      chargers.reduce(
        (total, charger) =>
          total + Number(charger.quantity || 0),
        0
      );

    const chargerIDs =
      chargers.map(
        charger => charger._id
      );

    // --------------------------------------------------------
    // Find all active bookings
    // --------------------------------------------------------

    const bookings =
      await Booking.find({
        stationID,
        chargerID: {
          $in: chargerIDs
        },
        bookingDate: date,
        bookingStatus: {
          $in: [
            'Pending',
            'Confirmed',
            'In Progress'
          ]
        }
      });

    // --------------------------------------------------------
    // Convert HH:MM to minutes
    // --------------------------------------------------------

    const convertToMinutes = (time) => {
      const [hours, minutes] =
        time.split(':').map(Number);

      return hours * 60 + minutes;
    };

    // --------------------------------------------------------
    // Convert minutes to HH:MM
    // --------------------------------------------------------

    const convertToTime = (minutes) => {
      const hours =
        Math.floor(minutes / 60)
          .toString()
          .padStart(2, '0');

      const mins =
        (minutes % 60)
          .toString()
          .padStart(2, '0');

      return `${hours}:${mins}`;
    };

    // --------------------------------------------------------
    // Station opening / closing time
    // --------------------------------------------------------

    const openingMinutes =
      convertToMinutes(
        station.openingTime
      );

    const closingMinutes =
      convertToMinutes(
        station.closingTime
      );

    // --------------------------------------------------------
    // Charging duration
    // --------------------------------------------------------

    const chargingDuration =
      Number(
        selectedCharger.chargingDuration
      );

    if (
      !chargingDuration ||
      chargingDuration <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid charger charging duration'
      });
    }

    const slots = [];

    // ========================================================
    // GENERATE SLOTS
    // ========================================================

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

      // ------------------------------------------------------
      // Count bookings overlapping this slot
      // ------------------------------------------------------

      let bookedCount = 0;

      bookings.forEach((booking) => {

        const bookingStart =
          convertToMinutes(
            booking.startTime
          );

        const bookingEnd =
          convertToMinutes(
            booking.endTime
          );

        const overlaps =
          bookingStart < end &&
          bookingEnd > start;

        if (overlaps) {
          // Each booking occupies ONE charger
          bookedCount++;
        }
      });

      // ------------------------------------------------------
      // Calculate remaining chargers
      // ------------------------------------------------------

      const availableChargers =
        totalChargers - bookedCount;

      // ------------------------------------------------------
      // Slot available if at least one charger is free
      // ------------------------------------------------------

      const available =
        availableChargers > 0;

      slots.push({
        startTime,
        endTime,

        available,

        totalChargers,

        bookedChargers:
          bookedCount,

        availableChargers:
          availableChargers
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    res.status(200).json({
      success: true,

      date,

      stationHours: {
        openingTime:
          station.openingTime,

        closingTime:
          station.closingTime
      },

      vehicleType:
        selectedCharger.vehicleType,

      totalChargers,

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

// ============================================================
// COMPLETE CHARGING
// ============================================================

exports.completeCharging = async (
  req,
  res
) => {
  try {
    const { bookingID } =
      req.params;

    // --------------------------------------------------------
    // Find booking
    // --------------------------------------------------------

    const booking =
      await Booking.findById(
        bookingID
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // --------------------------------------------------------
    // Find station
    // --------------------------------------------------------

    const station =
      await Station.findById(
        booking.stationID
      );

    if (!station) {
      return res.status(404).json({
        success: false,
        message:
          'Charging station not found'
      });
    }

    // --------------------------------------------------------
    // Check owner
    // --------------------------------------------------------

    if (
      station.ownerID.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to complete this booking'
      });
    }

    // --------------------------------------------------------
    // Check booking status
    // --------------------------------------------------------

    if (
      booking.bookingStatus !==
        'Confirmed' &&
      booking.bookingStatus !==
        'In Progress'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Only confirmed or in-progress bookings can be completed'
      });
    }

    // --------------------------------------------------------
    // Find payment
    // --------------------------------------------------------

    const payment =
      await Payment.findOne({
        bookingID:
          booking._id
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          'Payment record not found for this booking'
      });
    }

    // --------------------------------------------------------
    // Check payment status
    // --------------------------------------------------------

    if (
      payment.paymentStatus !==
      'Completed'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Payment must be completed before charging can be completed'
      });
    }

    // --------------------------------------------------------
    // Calculate tax
    // --------------------------------------------------------

    const baseAmount =
      Number(
        payment.amount || 0
      );

    const taxRate = 18;

    const taxAmount =
      (baseAmount *
        taxRate) /
      100;

    const totalAmount =
      baseAmount +
      taxAmount;

    // --------------------------------------------------------
    // Update payment / bill
    // --------------------------------------------------------

    payment.taxRate =
      taxRate;

    payment.taxAmount =
      Number(
        taxAmount.toFixed(2)
      );

    payment.totalAmount =
      Number(
        totalAmount.toFixed(2)
      );

    payment.billGenerated =
      true;

    payment.billGeneratedAt =
      new Date();

    await payment.save();

    // --------------------------------------------------------
    // Complete booking
    // --------------------------------------------------------

    booking.bookingStatus =
      'Completed';

    booking.completedAt =
      new Date();

    await booking.save();

    // --------------------------------------------------------
    // Make charger available again
    // --------------------------------------------------------

    const charger =
      await Charger.findById(
        booking.chargerID
      );

    if (charger) {
      charger.status =
        'Available';

      await charger.save();
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(200).json({
      success: true,

      message:
        'Charging completed and bill generated successfully',

      data: {
        bookingID:
          booking._id,

        bookingStatus:
          booking.bookingStatus,

        chargerStatus:
          charger
            ? charger.status
            : 'Available',

        baseAmount,

        taxRate,

        taxAmount:
          payment.taxAmount,

        totalAmount:
          payment.totalAmount,

        billGenerated:
          payment.billGenerated
      }
    });

  } catch (error) {
    console.error(
      'Complete charging error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to complete charging',
      error: error.message
    });
  }
};