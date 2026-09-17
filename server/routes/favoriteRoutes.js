const express = require('express');

const {
  toggleFavorites,
  setFavorite,
  getMyFavorites,
} = require('../controllers/favoriteController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyFavorites);
router.post('/:carId', protect, toggleFavorites);
router.put('/:carId', protect, setFavorite);
router.delete('/:carId', protect, setFavorite);

module.exports = router;
