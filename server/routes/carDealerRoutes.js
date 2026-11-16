const express = require('express');
const router = express.Router();
const dealerCarView = require('../utils/dealerCarView');

const {
  getMyCars,
  createCar,
  updateMyCar,
  deleteMyCar,
  publishMyCar,
  unpublishMyCar,
  uploadMyCarImages,
  deleteMyCarImage,
  setCarMainImage,
  reorderMyCarImages,
  getMyCarReadiness,
} = require('../controllers/carController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { checkCarOwnerShip } = require('../middleware/ownerShipMiddleware');
const { uploadCarImages } = require('../middleware/uploadMiddleware');

/*
=================================
DEALER ROUTES
Base: /api/dealer/cars
=================================
*/

// Apply auth with out repeating in every route!!
router.use(protect);
router.use(authorize('dealer'));

// GET /api/dealer/cars/my
router.get('/my', getMyCars);
router.get('/:id', checkCarOwnerShip, (req,res) => res.json({ success:true, data:dealerCarView(req.car) }));
router.put('/:id/photo-categories',checkCarOwnerShip,require('../utils/asyncHandler')(async(req,res)=>{
 const Car=require('../models/Car'),AppError=require('../utils/AppError'),{z}=require('zod');
 const parsed=z.object({categories:z.array(z.object({url:z.string(),category:z.enum(['exterior','interior','condition','unclassified'])}).strict()).max(100),expectedVersion:z.number().int().min(0)}).strict().safeParse(req.body);
 if(!parsed.success)throw new AppError('Choose valid photo labels and a current version.',400);
 const car=await Car.findOne({_id:req.params.id,dealer:req.user.id});
 if(!car)throw new AppError('Vehicle not found.',404);
 if(car.__v!==parsed.data.expectedVersion)throw new AppError('Photos changed. Reload before labelling.',409);
 if(new Set(parsed.data.categories.map(x=>x.url)).size!==parsed.data.categories.length||parsed.data.categories.some(x=>!car.images.includes(x.url)))throw new AppError('Label only photographs already supplied for this vehicle.',400);
 car.photoCategories=parsed.data.categories;await car.save();res.json({data:dealerCarView(car)});
}));
router.get('/:id/readiness', checkCarOwnerShip, getMyCarReadiness);

// POST /api/dealer/cars
router.post('/', createCar);

// PUT /api/dealer/cars/:id/publish
router.put('/:id/publish', checkCarOwnerShip, publishMyCar);
// PUT /api/dealer/cars/:id/unpublish

router.put('/:id/unpublish', checkCarOwnerShip, unpublishMyCar);
// PUT /api/dealer/cars/:id/main-image

router.put('/:id/main-image', checkCarOwnerShip, setCarMainImage);
// DELETE /api/dealer/cars/:id/images

router.delete('/:id/images', checkCarOwnerShip, deleteMyCarImage);
router.put('/:id/images/order', checkCarOwnerShip, reorderMyCarImages);

// PUT /api/dealer/cars/:id
router.put('/:id', checkCarOwnerShip, updateMyCar);

// DELETE /api/dealer/cars/:id
router.delete('/:id', checkCarOwnerShip, deleteMyCar);

// POST /api/dealer/cars/:id/images
router.post(
  '/:id/images',
  checkCarOwnerShip,
  uploadCarImages,
  uploadMyCarImages
);

module.exports = router;
