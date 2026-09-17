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
module.exports = mongoose.model('Car', carSchema);
