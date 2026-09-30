const Booking = require('../models/Booking');
const Charger = require('../models/Charger');
const Payment = require('../models/Payment');
const Station = require('../models/ChargingStation');

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

    // 2. CHECK FOR TIME SLOT CONFLICTS (Quantity & Multi-slot Capacity Check)
    const conflictingBookingsCount = await Booking.countDocuments({
      chargerID,
      bookingDate,
      bookingStatus: { $ne: 'Cancelled' }, // Ignore cancelled slots
      $or: [
        { startTime: { $lt: endTime }, endTime: {$gt: startTime } }
      ]
    });

    // Compare active bookings against the physical quantity installed
    const capacity = charger.quantity || 1;
    if (conflictingBookingsCount >= capacity) {
      return res.status(400).json({ 
        success: false, 
        message: `This charger is fully booked (${conflictingBookingsCount}/${capacity} slots in use) for the selected time slot.` 
      });
    }

    // 3. Generate a random 4-digit verification PIN
    const verificationPIN = Math.floor(1000 + Math.random() * 9000).toString();

    // 4. Create the booking record
    const booking = new Booking({
      userID: req.user._id,
      stationID,
      chargerID,
      bookingDate,
      startTime,
      endTime,
      bookingStatus: 'Pending',
      verificationPIN
    });

    await booking.save();

    // 5. Create initial Pending Payment
    const payment = new Payment({
      bookingID: booking._id,
      amount: 150, 
      paymentStatus: 'Pending',
      transactionID: `TXN_${Date.now()}` 
    });

    await payment.save();

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
      .populate('chargerID', 'vehicleType chargingSpeed pricePerKwh quantity')    // Pull charger details
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
      .populate('chargerID', 'vehicleType chargingSpeed pricePerKwh quantity')     // Pull charger details
      .populate('paymentID')
      .sort({ bookingDate: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};