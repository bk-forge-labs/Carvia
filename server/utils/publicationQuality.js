const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const AppError = require('./AppError');
const {uploadDir} = require('../config/storage');
const normalize = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
const imageExists = image => { try { const stat = fs.statSync(path.join(uploadDir, path.basename(image))); return stat.isFile() && stat.size > 0; } catch { return false; } };
function publicationIssues(car, photographExists = imageExists) {
  const issues = [];
  if (car.publicationHold) issues.push(`Listing needs review: ${car.publicationHold}`);
  const title = normalize(car.title);
  const brand = normalize(car.brand);
  const model = normalize(car.model);
  if (!brand || !model || !title.includes(brand) || !title.includes(model)) issues.push('Include the correct make and model in the listing title.');
  if (/\b(test|demo|placeholder|sample)\b/i.test(car.title || '')) issues.push('Test and sample listings must remain drafts.');
  if (!(Number.isFinite(car.price) && car.price > 0)) issues.push('Enter a valid asking price.');
  if (!(Number.isInteger(car.year) && car.year >= 1900 && car.year <= new Date().getFullYear() + 1)) issues.push('Enter a valid model year.');
  if (!(Number.isInteger(car.mileage) && car.mileage >= 0)) issues.push('Enter the vehicle mileage.');
  const images = Array.isArray(car.images) ? car.images : [];
  if (!images.length || !car.mainImage || !images.includes(car.mainImage)) issues.push('Choose a main photograph from the uploaded images.');
  for (const image of images) {
    if (typeof image !== 'string' || !/^\/uploads\/[^/\\]+$/.test(image)) { issues.push('Use photographs uploaded to this listing.'); break; }
    if (!photographExists(image)) { issues.push('Replace missing photographs before publishing.'); break; }
  }
  return issues;
}
function reviewFingerprint(car) {
  const fields = ['title','brand','model','year','mileage','price','bodyStyle','fuelType','transmission','location','owner','condition','description','dealer','mainImage','images'];
  for(const field of ['exteriorColor','seats','doors'])if(car[field]!=null&&car[field]!=='')fields.push(field);
  return createHash('sha256').update(JSON.stringify(fields.map(field => car[field] ?? (field === 'images' ? [] : '')))).digest('hex');
}
function invalidateChangedReview(car) {
  if (car.publicationReview?.fingerprint && car.publicationReview.fingerprint !== reviewFingerprint(car)) {
    car.publicationHold = 'Vehicle details changed after review. Verify the updated listing before release.';
    car.isPublished = false;
  }
  return car;
}
function assertPublishable(car) {
  if (!car.isPublished) return;
  const issues = publicationIssues(car);
  if (issues.length) throw new AppError(issues.join(' '), 400);
}
module.exports = { publicationIssues, assertPublishable, reviewFingerprint, invalidateChangedReview };
