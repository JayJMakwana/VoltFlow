const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');

exports.createFeedback = async (req, res) => {
  try {

    const {
      bookingID,
      rating,
      review
    } = req.body;

    // Check booking
    const booking = await Booking.findOne({
      _id: bookingID,
      userID: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Feedback only after completion
    if (booking.bookingStatus !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be given after charging is completed'
      });
    }

    // Prevent duplicate feedback
    const existingFeedback = await Feedback.findOne({
      bookingID: bookingID
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this booking'
      });
    }

    // Create feedback
    const feedback = new Feedback({
      userID: req.user.id,
      bookingID: booking._id,
      stationID: booking.stationID,
      rating,
      review
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });

  } catch (error) {

    console.error('Feedback error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.getStationFeedback = async (req, res) => {
  try {

    const feedback = await Feedback.find({
      stationID: req.params.stationId
    })
      .populate('userID', 'name')
      .populate('bookingID', 'bookingDate startTime endTime');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};