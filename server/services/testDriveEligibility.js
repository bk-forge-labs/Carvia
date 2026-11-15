/** Eligibility is re-evaluated at submission; a missing legacy value is never consent. */
function testDriveEligibility(car, dealer) {
  if (!car || !car.isPublished || car.isDemo || car.publicationHold || car.status === 'sold' || car.soldAt) return {eligible:false, reason:'This vehicle is not available for new test-drive requests.'};
  if (car.testDriveAvailable !== true) return {eligible:false, reason:'The dealer has not made this vehicle available for test drives.'};
  if (!dealer || dealer.status !== 'approved') return {eligible:false, reason:'This dealership is not currently accepting requests.'};
  return {eligible:true, reason:null};
}
module.exports = {testDriveEligibility};
