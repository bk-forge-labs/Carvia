// Deliberate allowlist: moderation notes, reviewer identities and future internal fields stay private.
const fields = '_id __v title price brand model year mileage owner condition description dealer bodyStyle fuelType transmission location exteriorColor seats doors images mainImage photoCategories testDriveAvailable soldAt conditionReport disclosedCharges isDemo isPublished publicationHold createdAt updatedAt imageCredit'.split(' ');
module.exports = function dealerCarView(car) {
  if (!car) return car;
  const source = typeof car.toObject === 'function' ? car.toObject() : car;
  return Object.fromEntries(fields.filter(field => source[field] !== undefined).map(field => [field, source[field]]));
};
