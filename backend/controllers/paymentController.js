const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Station = require('../models/ChargingStation');


// ============================================================
// PROCESS PAYMENT
// ============================================================

exports.processPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(
      req.params.paymentId
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Check payment belongs to logged-in user
    const booking = await Booking.findById(
      payment.bookingID
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (
      booking.userID.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to process this payment'
      });
    }

    if (
      payment.paymentStatus === 'Completed'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Payment has already been processed'
      });
    }

    // Calculate tax
    const baseAmount =
      Number(payment.amount || 0);

    const taxRate = 18;

    const taxAmount =
      (baseAmount * taxRate) / 100;

    const totalAmount =
      baseAmount + taxAmount;

    payment.taxRate = taxRate;

    payment.taxAmount =
      Number(taxAmount.toFixed(2));

    payment.totalAmount =
      Number(totalAmount.toFixed(2));

    payment.paymentStatus =
      'Completed';

    await payment.save();

    // Confirm booking
    booking.bookingStatus =
      'Confirmed';

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        'Payment successful, your slot is confirmed!',
      data: {
        payment,
        booking
      }
    });

  } catch (error) {
    console.error(
      'Payment error:',
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
// GET BILL
// ============================================================

exports.getBill = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      bookingID: req.params.bookingID
    }).populate({
      path: 'bookingID',
      populate: [
        {
          path: 'stationID',
          select:
            'stationName address'
        },
        {
          path: 'chargerID',
          select:
            'vehicleType chargingSpeed pricePerKwh chargingDuration'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Make sure bill belongs to current user
    if (
      payment.bookingID.userID &&
      payment.bookingID.userID.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to view this bill'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error(
      'Get bill error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to get bill',
      error: error.message
    });
  }
};


// ============================================================
// OWNER EARNINGS
// ============================================================

exports.getOwnerEarnings = async (req, res) => {
  try {
    // Find all stations owned by this owner
    const stations = await Station.find({
      ownerID: req.user.id
    }).select('_id');

    const stationIDs = stations.map(
      station => station._id
    );

    // Find bookings for owner's stations
    const bookings = await Booking.find({
      stationID: { $in: stationIDs }
    }).select('_id bookingStatus');

    const bookingIDs = bookings.map(
      booking => booking._id
    );

    // Find completed payments
    const payments = await Payment.find({
      bookingID: { $in: bookingIDs },
      paymentStatus: 'Completed'
    }).sort({
      createdAt: -1
    });

    // Calculate earnings
    const totalEarnings = payments.reduce(
      (sum, payment) => {
        return (
          sum +
          Number(
            payment.totalAmount ||
            payment.amount ||
            0
          )
        );
      },
      0
    );

    const completedBookings = bookings.filter(
      booking =>
        booking.bookingStatus === 'Completed'
    );

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: Number(
          totalEarnings.toFixed(2)
        ),

        totalPaidBookings: payments.length,

        totalCompletedBookings:
          completedBookings.length,

        payments
      }
    });

  } catch (error) {
    console.error(
      'Owner earnings error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to calculate owner earnings',
      error: error.message
    });
  }
};