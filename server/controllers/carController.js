const { publicInventory } = require('../utils/publicInventory');
const { removeUnusedUploads } = require('../utils/removeUnusedUploads');
const mongoose = require('mongoose');
const Car = require('../models/Car');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createCarSchema } = require('../validations/car.validations');
const { updateCarSchema } = require('../validations/car.validations');

const normalizeUploadUrl = input => {
  if (typeof input !== 'string') return '';
  const v = input.trim();

  // For user sending full URL , extract the pathname
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const u = new URL(v);
      return u.pathname;
    } catch {
      return v;
    }
  }
  return v;
};

const parseNum = v => {
  if (v === undefined || v === null) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
};

const DealerProfile = require('../models/DealerProfile');
const { pickAllAllowedFields } = require('../utils/pickAllowedFields');
const { escape } = require('querystring');

exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('dealer', 'name email role');
    res.json({
      success: true,
      data: cars,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({ success: false, message: error.message });
  }
};
exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      'dealer',
      'name email role'
    );
    res.json({
      success: true,
      data: car,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.getCarsPublic = async (req, res) => {
  try {
    const pageValue = Number(req.query.page || 1);
    const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Math.min(
      Math.max(Number.isSafeInteger(Number(req.query.limit)) ? Number(req.query.limit) : 12, 1),
      50
    );
    const skip = (page - 1) * limit;
    const filter = {...publicInventory(), ...require('../utils/vehicleSearch').vehicleSearch(req.query)};

    // Read sort params + build sort object :
    const sortKey =
      typeof req.query.sort === 'string' ? req.query.sort.trim() : 'newest';
    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      year_desc: { year: -1 },
    };
    const sort = sortMap[sortKey] || sortMap.newest;
    const [totalCars, cars] = await Promise.all([
      Car.countDocuments(filter),
      Car.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(
          'title price mainImage images brand model bodyStyle year mileage fuelType transmission location exteriorColor seats doors owner condition createdAt dealer isDemo testDriveAvailable'
        ).populate('dealer', 'name'),
    ]);
    const profiles = await DealerProfile.find({user: {$in: cars.map(car => car.dealer?._id).filter(Boolean)}}).select('user companyName').lean();
    const names = new Map(profiles.map(profile => [String(profile.user), profile.companyName]));
    const publicCars = cars.map(car => ({...car.toObject(), sellerName: names.get(String(car.dealer?._id)) || 'Dealership'}));
    const totalPages = totalCars === 0 ? 0 : Math.ceil(totalCars / limit);

    return res.status(200).json({
      success: true,
      sortUsed: sortKey,
      pagination: {
        page,
        limit,
        totalCars,
        totalPages,
      },
      data: publicCars,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.getCarBrandsPublic = async (req, res) => {
  try {
    const brands = await Car.distinct('brand', publicInventory());

    // Normalize + sort (stable UX)
    const cleaned = brands
      .filter(b => typeof b === 'string' && b.trim() !== '')
      .map(b => b.trim())
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      count: cleaned.length,
      data: cleaned,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.getCarByIdPublic = async (req, res) => {
  try {
    const carId = req.params.id.trim();
    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }
    const car = await Car.findOne({ _id: carId, ...publicInventory() }).select('-publicationHold -publicationReview -reviewHistory -__v').populate(
      'dealer',
      'name email role'
    );
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    const dealerProfile =
      car.dealer && car.dealer._id
        ? await DealerProfile.findOne({ user: car.dealer._id }).select(
            'companyName phone address'
          )
        : null;

    const similarFilter = {
      _id: { $ne: car._id },
      ...publicInventory(),
    };

    if (car.brand) {
      similarFilter.brand = car.brand;
    }

    const similarCars = await Car.find(similarFilter)
      .sort({ createdAt: -1 })
      .limit(4)
      .select(
        'title price mainImage images brand model bodyStyle year mileage fuelType transmission location exteriorColor seats doors owner condition createdAt dealer isDemo testDriveAvailable'
      );
    return res.status(200).json({
      success: true,
      data: {...car.toObject(),testDriveEligible:require('../services/testDriveEligibility').testDriveEligibility(car,await DealerProfile.findOne({user:car.dealer?._id,status:'approved'}).select('status')).eligible},
      dealerProfile,
      similarCars,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};
exports.createCar = async (req, res) => {
  try {
    const dealerProfile = await DealerProfile.findOne({ user: req.user.id });

    if (!dealerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Dealer not found',
      });
    }

    if (dealerProfile.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Dealer is not approved (status: ${dealerProfile.status})`,
      });
    }

    const parsed = createCarSchema.safeParse(req.body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => ({
        filed: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({
        success: false,
        message: issues.map(e => `${e.filed}: ${e.message}`).join(', '),
        errors: issues,
      });
    }

    const car = await Car.create({
      ...parsed.data,
      dealer: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: car,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const carId = req.params.id.trim();
    const parsed = updateCarSchema.safeParse(req.body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }));

      return res.status(400).json({
        success: false,
        message: issues.map(e => `${e.field}: ${e.message}`).join('; '),
        errors: issues,
      });
    }

    const updates = parsed.data;

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: ' NO valid fields provided for update' });
    }

    const updateCar = await Car.findOneAndUpdate(
      { _id: carId, dealer: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updateCar) {
      return res.status(404).json({
        success: false,
        message: "Car not found (or you don't won it)",
      });
    }

    return res.status(200).json({
      success: true,
      data: updateCar,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    await req.car.deleteOne();

    res.json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ dealer: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({ message: error.message });
  }
};

exports.publishMyCar = async (req,res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Invalid car id'});
    const car = await mongoose.connection.transaction(async session => {
      const seller = await DealerProfile.findOneAndUpdate({user:req.user.id,status:'approved'},{$inc:{publicationVersion:1}},{new:true,session});
      if (!seller) throw new AppError('Only approved dealers can publish vehicles.',403);
      const candidate = await Car.findOne({_id:req.params.id,dealer:req.user.id}).session(session);
      if (!candidate) throw new AppError('Vehicle not found.',404);
      if (typeof candidate.testDriveAvailable !== 'boolean') throw new AppError('Choose whether this vehicle is available for test drives before publishing.',400);
      const updated = await Car.findOneAndUpdate({_id:req.params.id,dealer:req.user.id},{$set:{isPublished:true}},{new:true,runValidators:true,session});
      if (!updated) throw new AppError('Car not found (or you do not own it).',404);
      if (!updated.isPublished) throw new AppError('This vehicle requires another review before publication.',409);
      return updated;
    });
    return res.json({success:true,data:car,message:'Car published'});
  } catch(error) { return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({success:false,message:error.message}); }
};

exports.unpublishMyCar = async (req, res) => {
  try {
    const carId = req.params.id.trim();
    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }
    const update = await Car.findOneAndUpdate(
      { _id: carId, dealer: req.user.id },
      { $set: { isPublished: false } },
      { new: true, runValidators: true }
    );
    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Cat not found (or you don't own it)",
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Car unpublished',
      data: update,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.updateMyCar = async (req, res) => {
  try {
    const carId = req.params.id.trim();

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }

    const allowedFields = [
      'title',
      'price',
      'brand',
      'model',
      'bodyStyle',
      'testDriveAvailable', 'conditionReport', 'disclosedCharges',
      'year',
      'mileage',
      'owner',
      'condition',
      'description',
      'fuelType', 'transmission', 'location', 'exteriorColor', 'seats', 'doors',
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    const parsed = updateCarSchema.safeParse(updates);
    if (!parsed.success) {
      return res.status(400).json({success:false,message:parsed.error.issues.map(issue => issue.message).join(' ')});
    }

    const updated = await Car.findOneAndUpdate(
      { _id: carId, dealer: req.user.id },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Car not found (or you don't own it)",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.deleteMyCar = async (req, res) => {
  try {
    const carId = req.params.id.trim();

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }
    const deleted = await Car.findOneAndDelete({
      _id: carId,
      dealer: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Car is not found (or you don't own it)",
      });
    }

    await removeUnusedUploads(deleted.images);
    return res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.uploadMyCarImages = async (req, res) => {
  try {
    const carId = req.params.id.trim();

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: ' No images to upload',
      });
    }

    const urls = req.files.map(f => `/uploads/${f.filename}`);

    const car = await Car.findOne({ _id: carId, dealer: req.user.id });

    if (!car) {
      await Promise.all((req.files || []).map(file => fs.promises.unlink(file.path).catch(() => {})));
      return res.status(404).json({
        success: false,
        message: 'Car not found (or you don\t own it)',
      });
    }

    const MAX_IMAGES = 8;

    if (car.images.length + urls.length > MAX_IMAGES) {
      await Promise.all((req.files || []).map(file => fs.promises.unlink(file.path).catch(() => {})));
      return res.status(400).json({
        success: false,
        message: `This listing supports up to ${MAX_IMAGES} photos. Remove a photo or choose fewer files.`,
      });
    }
    car.images.push(...urls);

    if (!car.mainImage && urls.length > 0) {
      car.mainImage = urls[0];
    }
    await car.save();

    return res.status(200).json({
      success: true,
      message: 'Images uploaded',
      data: car,
    });
  } catch (error) {
    await Promise.all((req.files || []).map(file => fs.promises.unlink(file.path).catch(() => {})));
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.deleteMyCarImage = async (req, res) => {
  try {
    const carId = req.params.id.trim();
    const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';

    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }

    if (!url || !url.startsWith('/uploads')) {
      return res.status(400).json({
        success: false,
        message: 'Valid image url is required (must starts with /uploads/...)',
      });
    }

    const car = await Car.findOne({ _id: carId, dealer: req.user.id });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found (or you don\t own it)',
      });
    }

    if (!car.images.includes(url)) return res.status(404).json({ success: false, message: 'Photo not found on this listing.' });
    car.images = car.images.filter(img => img !== url);

    if (car.mainImage === url) {
      car.mainImage = car.images.length > 0 ? car.images[0] : '';
    }

    await car.save();

    await removeUnusedUploads([url]);

    return res.status(200).json({
      success: true,
      message: 'Image removed',
      data: car,
    });
  } catch (error) {
    return res.status(error.name === 'VersionError' ? 409 : error.statusCode || 500).json({
      success: false,
      message: error.name === 'VersionError' ? 'This vehicle changed. Refresh and try again.' : error.statusCode ? error.message : 'Could not complete the request. Please try again.',
    });
  }
};

exports.setCarMainImage = asyncHandler(async (req, res) => {
  const carId = req.params.id.trim();
  const url = normalizeUploadUrl(req.body.url);

  if (!mongoose.isValidObjectId(carId)) {
    throw new AppError('Invalid car id', 404);
  }

  if (!url || !url.startsWith('/uploads/')) {
    throw new AppError(
      'Valid image url is required (must starts with /uploads/...',
      400
    );
  }

  const car = await Car.findOne({ _id: carId, dealer: req.user.id });

  if (!car) {
    throw new AppError("Car not found (or you don't own it)", 404);
  }

  if (!car.images.includes(url)) {
    throw new AppError('Image url must exist in car.images', 400);
  }

  car.mainImage = url;
  await car.save();

  return res.status(200).json({
    success: true,
    message: 'Main image updated',
    data: car,
  });
});

exports.reorderMyCarImages = async (req, res) => {
  try {
    const car = await Car.findOne({_id:req.params.id, dealer:req.user.id});
    if (!car) return res.status(404).json({success:false,message:'Vehicle not found.'});
    const images = req.body.images;
    if (!Array.isArray(images) || images.length !== car.images.length || new Set(images).size !== images.length || images.some(url => typeof url !== 'string' || !car.images.includes(url))) {
      return res.status(400).json({success:false,message:'Photo order must contain each current photo exactly once. Refresh the page and try again.'});
    }
    car.images = images;
    await car.save();
    return res.json({success:true,data:car});
  } catch(error) {
    return res.status(error.name === 'VersionError' ? 409 : 400).json({success:false,message:'Unable to save photo order. Refresh the page and try again.'});
  }
};

exports.getMyCarReadiness = async (req, res) => {
  try {
    const car = await Car.findOne({_id:req.params.id,dealer:req.user.id});
    if (!car) return res.status(404).json({success:false,message:'Vehicle not found.'});
    const seller = await DealerProfile.findOne({user:req.user.id});
    const issues = require('../utils/publicationQuality').publicationIssues(car);
    if (typeof car.testDriveAvailable !== 'boolean') issues.unshift('Choose whether this vehicle is available for test drives before publishing.');
    if (!seller || seller.status !== 'approved') issues.unshift('Your dealership must be approved before publishing.');
    return res.json({success:true,data:{ready:issues.length===0,issues}});
  } catch(error) {
    return res.status(500).json({success:false,message:'Unable to check publication readiness. Please try again.'});
  }
};

exports.getCarModelsPublic = async (req,res) => { try {const {text,exact}=require('../utils/vehicleSearch');const brand=text(req.query,'brand');if(!brand)return res.json({data:[]});const models=await Car.distinct('model',{...publicInventory(),brand:exact(brand)});res.json({data:models.filter(v=>typeof v==='string'&&v.trim()).sort()});}catch(e){res.status(e.statusCode||500).json({message:e.statusCode?e.message:'Could not load models.'});}};
