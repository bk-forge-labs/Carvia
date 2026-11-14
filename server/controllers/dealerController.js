const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const {serializeDealerProfile} = require('../utils/dealerProfileResponse');
const Car = require('../models/Car');
const DealerProfile = require('../models/DealerProfile');

exports.createDealerProfile = async (req, res) => {
  try {
    const existingProfile = await DealerProfile.findOne({ user: req.user.id });

    if (existingProfile) {
      return res.status(400).json({ message: 'Dealer Profile already exists' });
    }

    const profile = await DealerProfile.create({
      user: req.user.id,
      companyName: req.body.companyName,
      phone: req.body.phone,
      address: req.body.address,
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await DealerProfile.findOne({ user: req.user.id })
      .select(
        'companyName phone address status rejectionReason moderation createdAt updatedAt user'
      )
      .populate('user', 'name email role');

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Dealer profile not found' });
    }

    const safeData = serializeDealerProfile(profile);

    return res.status(200).json({
      success: true,
      data: safeData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const updates = {};
    for (const key of ['companyName', 'phone', 'address']) {
      if (req.body?.[key] === undefined) continue;
      if (typeof req.body[key] !== 'string' || req.body[key].trim().length > 300 || (key !== 'address' && !req.body[key].trim())) {
        throw new AppError('Enter valid business details (up to 300 characters per field).', 400);
      }
      updates[key] = req.body[key].trim();
    }
    if (!Object.keys(updates).length) throw new AppError('No valid fields to update', 400);
    const profile = await mongoose.connection.transaction(async session => {
      const current = await DealerProfile.findOne({ user: req.user.id }).session(session);
      if (!current) throw new AppError('Dealer profile not found', 404);
      const changed = Object.keys(updates).some(key => updates[key] !== (current[key] || ''));
      if (!changed) return current;
      const requiresReview = current.status === 'approved';
      const at = new Date();
      const write = { $set: updates, $inc: { publicationVersion: 1 } };
      if (requiresReview) {
        write.$set = { ...updates, status: 'pending', rejectionReason: '' };
        write.$push = { reviewHistory: { action: 'identity_changed', from: 'approved', to: 'pending', by: req.user.id, at, note: 'Dealer changed business details. A new review is required.' } };
      }
      const updated = await DealerProfile.findOneAndUpdate(
        { _id: current._id, updatedAt: current.updatedAt, status: current.status }, write,
        { new: true, runValidators: true, session }
      );
      if (!updated) throw new AppError('Your profile changed. Refresh and try again.', 409);
      if (requiresReview) await Car.updateMany({ dealer: req.user.id, isPublished: true }, {
        $set: { isPublished: false }, $inc: { __v: 1 },
        $push: { reviewHistory: { action: 'dealer_identity_changed', by: req.user.id, at, note: 'Listing unpublished pending review of updated dealer details.' } }
      }, { session });
      return updated;
    });
    await profile.populate('user', 'name email role');
    return res.json({ success: true, data: serializeDealerProfile(profile) });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Could not update your business details. Please try again.' });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const profile = await DealerProfile.findOne({ user: req.user.id })
      .select('status')
      .maxTimeMS(5000);

    const dealerStatus = profile?.status || 'pending';
    const [totalCars, publishedCars, draftCars, latestCars] = await Promise.all([
      Car.countDocuments({ dealer: req.user.id }),
      Car.countDocuments({ dealer: req.user.id, isPublished: true }),
      Car.countDocuments({ dealer: req.user.id, isPublished: { $ne: true } }),
      Car.find({ dealer: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title brand price year mileage createdAt'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        dealerStatus,
        canPostCars: dealerStatus === 'approved',
        totalCars,
        publishedCars,
        draftCars,
        latestCars,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.getMyCarsPaginated = async (req, res) => {
  const parseNum = v => {
    if (v === undefined) return null;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || '10', 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    const filter = { dealer: req.user.id };
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }
    const minPrice = parseNum(req.query.minPrice);
    const maxPrice = parseNum(req.query.maxPrice);
    /*   const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null; */

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    /*  const minYear = req.query.minYear ? Number(req.query.minYear) : null;
    const maxYear = req.query.maxYear ? Number(req.query.maxYear) : null; */
    const minYear = parseNum(req.query.minYear);
    const maxYear = parseNum(req.query.maxYear);

    if (minYear !== null || maxYear !== null) {
      filter.year = {};
    }
    if (minYear !== null) filter.year.$gte = minYear;
    if (maxYear !== null) filter.year.$lte = maxYear;

    const [totalCars, cars] = await Promise.all([
      Car.countDocuments(filter),
      Car.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);
    return res.status(200).json({
      success: true,
      filterUsed: filter,
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
      message: error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};
