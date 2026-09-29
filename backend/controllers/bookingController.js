const Booking = require('../models/Booking');
const Charger = require('../models/Charger');
const Payment = require('../models/Payment');
const Station = require('../models/ChargingStation'); // FIX 1: Missing import added

// @desc    Create a new booking (EVUser only)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { stationID, chargerID, bookingDate, startTime, endTime } = req.body;

    // 1. Validate the charger exists and is available
    const charger = await Charger.findById(chargerID);
    if (!charger) {
      return res.status(404).json({ success: false, message: 'Charger not found' });
    }
    if (charger.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Charger is currently unavailable' });
    }

    // 2. Generate a random 4-digit verification PIN for station arrival
    const verificationPIN = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Create the booking record
    const booking = new Booking({
      userID: req.user._id, // FIX 2: Use _id for reliable MongoDB targeting
      stationID,
      chargerID,
      bookingDate,
      startTime,
      endTime,
      bookingStatus: 'Pending',
      verificationPIN
    });

    await booking.save();

    // 4. Create an initial Pending Payment record mapped to this booking
    const payment = new Payment({
      bookingID: booking._id,
      amount: 150, 
      paymentStatus: 'Pending',
      transactionID: `TXN_${Date.now()}` 
    });

    await payment.save();

    // FIX 3: Link the payment back to the booking so .populate() works!
    booking.paymentID = payment._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Proceed to payment.',
      data: { booking, payment }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerStations = await Station.find({ ownerID: req.user._id }).select('_id');
    const stationIds = ownerStations.map(station => station._id);
    
    const bookings = await Booking.find({ stationID: { $in: stationIds } })
      .populate('userID', 'name email phone')        // Pull driver info
      .populate('stationID', 'stationName address')  // Pull station name & address
      .populate('chargerID', 'chargerType power')    // Pull charger type
      .populate('paymentID')                         // Pull payment status
      .sort({ bookingDate: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userID: req.user._id })
      .populate('stationID', 'stationName address') // Pull station name & address
      .populate('chargerID', 'chargerType power')     // Pull charger details
      .populate('paymentID')
      .sort({ bookingDate: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};