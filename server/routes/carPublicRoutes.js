const express = require('express');
const router = express.Router();

const {
  getCarsPublic,
  getCarByIdPublic,
  getCarBrandsPublic,
} = require('../controllers/carController');

router.get('/', getCarsPublic);
router.get('/meta/brands', getCarBrandsPublic);
router.get('/meta/models', require('../controllers/carController').getCarModelsPublic);
router.get('/:id', getCarByIdPublic);

module.exports = router;
