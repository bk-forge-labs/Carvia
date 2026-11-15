const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    importBatch: {type:String,index:true},
    imageCredit: {source:String,author:String,license:String,licenseUrl:String},
    isDemo: { type: Boolean, default: false },
    // No default: legacy listings remain unavailable until explicitly selected.
    testDriveAvailable: { type: Boolean },
    soldAt: {type:Date,default:null},
    conditionReport: {type:String,maxlength:3000},
    disclosedCharges: {type:String,maxlength:2000},
    photoCategories: [{url:String,category:{type:String,enum:['exterior','interior','condition','unclassified']}}],
    requestRevision: {type:Number,default:0,select:false},
    exteriorColor: {type:String, enum:['', ...require('../utils/vehicleSearch').colors]},
    seats: {type:Number,min:1,max:9,validate: {validator:v=>v==null||Number.isInteger(v)}},
    doors: {type:Number,min:1,max:6,validate: {validator:v=>v==null||Number.isInteger(v)}},
    fuelType: String, transmission: String, location: String,
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    owner: {
      type: String,
      enum: ['Private', 'Dealer'],
      default: 'Dealer',
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    bodyStyle: { type: String, enum: ['', ...['SUV', 'Sedan', 'Coupe', 'Convertible', 'Hatchback', 'Estate', 'Van']], default: '' },
    condition: {
      type: String,
      enum: ['Smoker', 'Non-Smoker'],
      default: 'Smoker',
      required: true,
    },
    description: {
      type: String,
    },
    dealer: {
      type: mongoose.Schema.Types.ObjectId, // This will put the id of the dealer
      ref: 'User', // Important for populate()
      required: true,
    },
    publicationReview: { fingerprint: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date, note: String },
    reviewHistory: [{ action: String, note: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date, fingerprint: String }],
    publicationHold: { type: String, default: '' },
    isPublished: {
      type: Boolean,
      default: false,
    },
    images: {
      type: ['String'],
      default: [],
    },
    mainImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Guard both document saves and query updates so edits cannot bypass publication checks.
const { assertPublishable, invalidateChangedReview } = require('../utils/publicationQuality');
carSchema.pre('validate', function () { invalidateChangedReview(this); assertPublishable(this); });
carSchema.pre('findOneAndUpdate', async function () {
  const current = await this.model.findOne(this.getQuery()).session(this.getOptions().session || null).lean();
  if (!current) return;
  // The exact version validated below must be the version written.
  this._publicationVersionChecked = true;
  this.setQuery({ $and: [this.getQuery(), current.__v == null
    ? { __v: { $exists: false } } : { __v: current.__v }] });
  const update = this.getUpdate();
  update.$inc = { ...(update.$inc || {}), __v: 1 };
  this.setUpdate(update);
  const candidate = { ...current, ...(update.$set || update) };
  for (const field of Object.keys(update.$unset || {})) delete candidate[field];
  invalidateChangedReview(candidate);
  if (candidate.publicationHold !== current.publicationHold && candidate.publicationHold) {
    update.$set = { ...(update.$set || {}), publicationHold:candidate.publicationHold, isPublished:false };
    this.setUpdate(update);
  }
  assertPublishable(candidate);
});
carSchema.post('findOneAndUpdate', function (result) {
  if (this._publicationVersionChecked && !result) {
    throw new (require('../utils/AppError'))('This vehicle changed while you were editing. Refresh and try again.', 409);
  }
});
carSchema.index({ isPublished: 1, createdAt: -1 });
carSchema.index({ dealer: 1, createdAt: -1 });
module.exports = mongoose.model('Car', carSchema);
