const DealerProfile = require('../models/DealerProfile');
const mongoose = require('mongoose');
const { isValidObjectId } = require('../utils/validateObjectId');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

const { createModerationService } = require('../services/moderationService');
const { publicationIssues } = require('../utils/publicationQuality');
const moderationService = createModerationService({DealerProfile,Car,transaction:callback => mongoose.connection.transaction(callback)});
const moderateDealer = action => async (req,res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Invalid dealer profile id'});
    const result = await moderationService.dealer(req.params.id,action,req.body,req.user.id);
    return res.json({success:true,data:result.dealer,unpublished:result.unpublished});
  } catch(error) { return res.status(error.statusCode || 500).json({success:false,message:error.message}); }
};
exports.approveDealer=moderateDealer('approve');
exports.rejectDealer=moderateDealer('reject');
exports.suspendDealer=moderateDealer('suspend');
exports.reactivateDealer=moderateDealer('reactivate');
exports.getCarReview = async (req,res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Invalid vehicle id'});
    const car = await Car.findById(req.params.id).populate('dealer','name email').populate('reviewHistory.by','name').lean();
    if (!car) return res.status(404).json({success:false,message:'Vehicle not found'});
    const seller = car.dealer?._id ? await DealerProfile.findOne({user:car.dealer._id}).select('companyName status').lean() : null;
    return res.json({success:true,data:car,seller,issues:publicationIssues({...car,publicationHold:''})});
  } catch(error) { return res.status(500).json({success:false,message:error.message}); }
};
exports.releaseCarHold = async (req,res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Invalid vehicle id'});
    const car = await moderationService.release(req.params.id,req.body,req.user.id);
    return res.json({success:true,data:car,message:'Hold released. The vehicle remains a draft.'});
  } catch(error) { return res.status(error.statusCode || 500).json({success:false,message:error.message}); }
};

exports.getDealerById = async (req, res) => {
  try {
    const dealerId = req.params.id;

    if (!isValidObjectId(dealerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dealer profile id',
      });
    }

    const dealer = await DealerProfile.findById(dealerId)
      .populate('user', 'name email role')
      .populate('moderation.by', 'name email').populate('reviewHistory.by','name');

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: dealer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDealerStats = async (req, res) => {
  try {
    const [pending, approved, rejected, suspended, total] = await Promise.all([
      DealerProfile.countDocuments({ status: 'pending' }),
      DealerProfile.countDocuments({ status: 'approved' }),
      DealerProfile.countDocuments({ status: 'rejected' }),
      DealerProfile.countDocuments({ status: 'suspended' }),
      DealerProfile.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      data: { total, pending, approved, rejected, suspended },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDealerAuditFeed = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const items = await DealerProfile.find({
      'moderation.at': { $exists: true },
    })
      .select('companyName status rejectionReason moderation updateAt')
      .populate('moderation.by', 'name email')
      .sort({ 'moderation.at': -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: limit.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalBuyers,
      totalDealers,
      pendingDealers,
      totalCars,
      publishedCars,
      totalBookings,
      pendingBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'dealer' }),
      DealerProfile.countDocuments({ status: 'pending' }),
      Car.countDocuments({}),
      Car.countDocuments({ isPublished: true }),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: 'pending' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          buyers: totalBuyers,
          dealers: totalDealers,
        },
        dealers: {
          pendingProfiles: pendingDealers,
        },
        cars: {
          total: totalCars,
          published: publishedCars,
          unpublished: totalCars - publishedCars,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCarsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || '10', 10), 1),
      50,
    );
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.held === 'true') filter.publicationHold = { $type:'string', $ne:'' };
    if (req.query.isPublished !== undefined) {
      filter.isPublished = req.query.isPublished === 'true';
    }

    const [totalCars, cars] = await Promise.all([
      Car.countDocuments(filter),
      Car.find(filter)
        .populate('dealer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalCars,
        totalPages: Math.ceil(totalCars / limit),
      },
      data: cars,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.unpublishCarAdmin = async (req, res) => {
  try {
    const carId = req.params.id.trim();

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Car not found',
      });
    }

    const updated = await Car.findOneAndUpdate(
      { _id: carId },
      { $set: { isPublished: false } },
      { new: true, runValidators: true },
    ).populate('dealer', 'name email');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Car unpublished by admin',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDealersAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || '10', 10), 1),
      50,
    );
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [totalDealers, dealers] = await Promise.all([
      DealerProfile.countDocuments(filter),
      DealerProfile.find(filter)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalDealers,
        totalPages: Math.ceil(totalDealers / limit),
      },
      data: dealers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveBookingAdmin = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking id',
      });
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status: 'approved' } },
      { new: true, runValidators: true },
    )
      .populate('user', 'name email role')
      .populate('service', 'title price durationMinutes');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: ' Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking approved',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cancelBookingAdmin = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    const reason =
      typeof req.body.reason === 'string' ? req.body.reason.trim() : '';

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking id',
      });
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status: 'cancelled',
          cancelReason: reason,
        },
      },
      { new: true, runValidators: true },
    )
      .populate('user', 'name email role')
      .populate('service', 'title price, durationMinutes');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 *Admin can get all bookings
 */

exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || '10', 10), 1),
      50,
    );
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate('user', 'name email role')
        .populate('service', 'title price durationMinutes ')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalBookings: total,
        totalPages: Math.ceil(total / limit),
      },
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
