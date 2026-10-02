const User = require('../models/User');
const ChargingStation = require('../models/ChargingStation');
const Charger = require('../models/Charger');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalAdmins,
      totalStations,
      totalChargers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      totalPayments,
      completedPayments,
      feedbackCount
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: 'StationOwner'
      }),

      User.countDocuments({
        role: 'Admin'
      }),

      ChargingStation.countDocuments(),

      Charger.countDocuments(),

      Booking.countDocuments(),

      Booking.countDocuments({
        bookingStatus: 'Pending'
      }),

      Booking.countDocuments({
        bookingStatus: 'Confirmed'
      }),

      Booking.countDocuments({
        bookingStatus: 'In Progress'
      }),

      Booking.countDocuments({
        bookingStatus: 'Completed'
      }),

      Booking.countDocuments({
        bookingStatus: 'Cancelled'
      }),

      Payment.countDocuments(),

      Payment.countDocuments({
        paymentStatus: 'Completed'
      }),

      Feedback.countDocuments()
    ]);


    // Calculate total revenue
    const payments = await Payment.find({
      paymentStatus: 'Completed'
    }).select('amount totalAmount');

    const totalRevenue = payments.reduce((sum, payment) => {
      return sum + Number(
        payment.totalAmount || payment.amount || 0
      );
    }, 0);


    // Average station rating
    const ratingResult = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: '$rating'
          }
        }
      }
    ]);

    const averageRating =
      ratingResult.length > 0
        ? Number(ratingResult[0].averageRating.toFixed(2))
        : 0;


    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          owners: totalOwners,
          admins: totalAdmins,
          evUsers:
            totalUsers -
            totalOwners -
            totalAdmins
        },

        stations: totalStations,

        chargers: totalChargers,

        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          inProgress: inProgressBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        },

        payments: {
          total: totalPayments,
          completed: completedPayments,
          revenue: Number(totalRevenue.toFixed(2))
        },

        feedback: {
          total: feedbackCount,
          averageRating
        }
      }
    });

  } catch (error) {
    console.error(
      'Admin dashboard error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to load admin statistics',
      error: error.message
    });
  }
};


// =====================================================
// GET ALL USERS
// =====================================================

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {

    console.error(
      'Admin users error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to load users',
      error: error.message
    });
  }
};


// =====================================================
// GET ALL STATIONS
// =====================================================

exports.getAllStations = async (req, res) => {
  try {

    const stations = await ChargingStation.find()
      .populate(
        'ownerID',
        'name email phone businessName'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: stations
    });

  } catch (error) {

    console.error(
      'Admin stations error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to load stations',
      error: error.message
    });
  }
};


// =====================================================
// GET ALL BOOKINGS
// =====================================================

exports.getAllBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()
      .populate(
        'userID',
        'name email phone'
      )
      .populate(
        'stationID',
        'stationName address'
      )
      .populate(
        'chargerID',
        'vehicleType chargingSpeed pricePerKwh quantity'
      )
      .populate(
        'paymentID',
        'amount totalAmount paymentStatus transactionID'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {

    console.error(
      'Admin bookings error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to load bookings',
      error: error.message
    });
  }
};


// =====================================================
// DELETE STATION
// ADMIN ONLY
// =====================================================

exports.deleteStation = async (req, res) => {
  try {

    const station =
      await ChargingStation.findById(
        req.params.id
      );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }


    // Delete chargers belonging to station
    await Charger.deleteMany({
      stationID: station._id
    });


    // Delete station
    await station.deleteOne();


    res.status(200).json({
      success: true,
      message: 'Station permanently removed by admin'
    });

  } catch (error) {

    console.error(
      'Admin delete station error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to delete station',
      error: error.message
    });
  }
};


// =====================================================
// SYSTEM-WIDE REPORT
// =====================================================

exports.getSystemReport = async (req, res) => {
  try {

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);


    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);


    const revenueResult = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: {
              $ifNull: [
                '$totalAmount',
                '$amount'
              ]
            }
          }
        }
      }
    ]);


    // Last 7 days booking report
    const sevenDaysAgo =
      new Date();

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6
    );

    sevenDaysAgo.setHours(
      0,
      0,
      0,
      0
    );


    const bookingTrend =
      await Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: sevenDaysAgo
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]);


    const revenueTrend =
      await Payment.aggregate([
        {
          $match: {
            paymentStatus: 'Completed',
            createdAt: {
              $gte: sevenDaysAgo
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            revenue: {
              $sum: {
                $ifNull: [
                  '$totalAmount',
                  '$amount'
                ]
              }
            }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]);


    res.status(200).json({
      success: true,

      data: {
        usersByRole,

        bookingsByStatus,

        totalRevenue:
          revenueResult.length > 0
            ? Number(
                revenueResult[0].revenue.toFixed(2)
              )
            : 0,

        bookingTrend,

        revenueTrend
      }
    });

  } catch (error) {

    console.error(
      'System report error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to generate system report',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.params.id === req.user.id && role && role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own Admin role'
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Admin update user error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
exports.updateStation = async (req, res) => {
  try {
    const {
      stationName,
      address,
      latitude,
      longitude,
      openingTime,
      closingTime
    } = req.body;

    const station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    if (stationName !== undefined) {
      station.stationName = stationName.trim();
    }

    if (address !== undefined) {
      station.address = address.trim();
    }

    if (latitude !== undefined) {
      station.latitude = Number(latitude);
    }

    if (longitude !== undefined) {
      station.longitude = Number(longitude);
    }

    if (openingTime !== undefined) {
      station.openingTime = openingTime;
    }

    if (closingTime !== undefined) {
      station.closingTime = closingTime;
    }

    await station.save();

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station
    });
  } catch (error) {
    console.error('Admin update station error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
exports.updateCharger = async (req, res) => {
  try {
    const {
      vehicleType,
      chargingSpeed,
      pricePerKwh,
      quantity,
      chargingDuration,
      status
    } = req.body;

    const charger = await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    if (vehicleType !== undefined) {
      charger.vehicleType = vehicleType;
    }

    if (chargingSpeed !== undefined) {
      charger.chargingSpeed = chargingSpeed;
    }

    if (pricePerKwh !== undefined) {
      charger.pricePerKwh = Number(pricePerKwh);
    }

    if (quantity !== undefined) {
      charger.quantity = Number(quantity);
    }

    if (chargingDuration !== undefined) {
      charger.chargingDuration = Number(chargingDuration);
    }

    if (status !== undefined) {
      charger.status = status;
    }

    await charger.save();

    res.status(200).json({
      success: true,
      message: 'Charger updated successfully',
      data: charger
    });
  } catch (error) {
    console.error('Admin update charger error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      vehicleType,
      businessName,
      businessAddress
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      user.email = email.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (vehicleType !== undefined) {
      user.vehicleType = vehicleType;
    }

    if (businessName !== undefined) {
      user.businessName = businessName;
    }

    if (businessAddress !== undefined) {
      user.businessAddress = businessAddress;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Admin update user error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.updateStation = async (req, res) => {
  try {
    const {
      stationName,
      address,
      latitude,
      longitude,
      openingTime,
      closingTime
    } = req.body;

    const station =
      await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    if (stationName !== undefined) {
      station.stationName = stationName.trim();
    }

    if (address !== undefined) {
      station.address = address.trim();
    }

    if (latitude !== undefined) {
      station.latitude = Number(latitude);
    }

    if (longitude !== undefined) {
      station.longitude = Number(longitude);
    }

    if (openingTime !== undefined) {
      station.openingTime = openingTime;
    }

    if (closingTime !== undefined) {
      station.closingTime = closingTime;
    }

    await station.save();

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station
    });

  } catch (error) {
    console.error('Admin update station error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.getAllChargers = async (req, res) => {
  try {
    const chargers = await Charger.find()
      .populate(
        'stationID',
        'stationName address ownerID'
      );

    res.status(200).json({
      success: true,
      count: chargers.length,
      data: chargers
    });

  } catch (error) {
    console.error('Admin get chargers error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.updateCharger = async (req, res) => {
  try {
    const {
      vehicleType,
      chargingSpeed,
      pricePerKwh,
      quantity,
      chargingDuration,
      status
    } = req.body;

    const charger =
      await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    if (vehicleType !== undefined) {
      charger.vehicleType = vehicleType;
    }

    if (chargingSpeed !== undefined) {
      charger.chargingSpeed = chargingSpeed;
    }

    if (pricePerKwh !== undefined) {
      charger.pricePerKwh = Number(pricePerKwh);
    }

    if (quantity !== undefined) {
      charger.quantity = Number(quantity);
    }

    if (chargingDuration !== undefined) {
      charger.chargingDuration =
        Number(chargingDuration);
    }

    if (status !== undefined) {
      charger.status = status;
    }

    await charger.save();

    res.status(200).json({
      success: true,
      message: 'Charger updated successfully',
      data: charger
    });

  } catch (error) {
    console.error('Admin update charger error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.deleteCharger = async (req, res) => {
  try {
    const charger =
      await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({
        success: false,
        message: 'Charger not found'
      });
    }

    await charger.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Charger deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete charger error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};