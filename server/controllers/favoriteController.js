const mongoose = require('mongoose');

const User = require('../models/User');
const Car = require('../models/Car');

exports.toggleFavorites = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }

    const car = await Car.findOne({ _id: carId, isPublished: true });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    const alreadyFavorite = user.favorites.some(
      favId => favId.toString() === carId
    );

    if (alreadyFavorite) {
      user.favorites = user.favorites.filter(
        favId => favId.toString() !== carId
      );
    } else {
      user.favorites.push(car._id);
    }
    await user.save();

    return res.status(200).json({
      success: true,
      isFavorite: !alreadyFavorite,
      favoritesCount: user.favorites.length,
      message: alreadyFavorite
        ? 'Car removed from favorites'
        : 'Car added to favorites',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'favorites', match: { isPublished: true }, select: '-publicationHold -publicationReview -reviewHistory -__v' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Explicit, atomic intent makes retries and stale browser tabs safe.
exports.setFavorite = async (req, res) => {
  const { carId } = req.params;
  if (!/^[a-f0-9]{24}$/i.test(carId)) return res.status(400).json({success:false,message:'Invalid car id'});
  const saved = req.method === 'PUT';
  try {
    if (saved && !await Car.exists({_id:carId,isPublished:true})) return res.status(404).json({success:false,message:'Car not found'});
    const user = await User.findByIdAndUpdate(req.user.id, saved ? {$addToSet:{favorites:carId}} : {$pull:{favorites:carId}}, {new:true});
    if (!user) return res.status(404).json({success:false,message:'User not found'});
    return res.json({success:true,isFavorite:saved,favoritesCount:user.favorites.length,message:saved?'Vehicle saved':'Vehicle removed'});
  } catch { return res.status(500).json({success:false,message:'Unable to update saved vehicles'}); }
};
