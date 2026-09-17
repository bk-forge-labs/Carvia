const AppError = require('../utils/AppError');
const { publicationIssues, reviewFingerprint } = require('../utils/publicationQuality');
const transitions = { approve: { from:['pending'], to:'approved', label:'approved' }, reject:{from:['pending'],to:'rejected',label:'rejected'}, suspend:{from:['approved'],to:'suspended',label:'suspend'}, reactivate:{from:['rejected','suspended'],to:'pending',label:'reactivated'} };
function reviewInput(body) {
  if (!body || typeof body.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(body.expectedUpdatedAt))) throw new AppError('Refresh this record before reviewing it.',400);
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (note.length < 10 || note.length > 2000) throw new AppError('Add a review note between 10 and 2,000 characters.',400);
  return { updatedAt:new Date(body.expectedUpdatedAt), note };
}
function createModerationService({ DealerProfile, Car, transaction }) {
  return {
    async dealer(id, action, body, actor) {
      const rule = transitions[action];
      if (!rule) throw new AppError('Invalid review action.',400);
      const { updatedAt,note } = reviewInput(body);
      return transaction(async session => {
        const record = await DealerProfile.findOne({_id:id,updatedAt}).session(session);
        if (!record || !rule.from.includes(record.status)) throw new AppError('This dealer changed or the action no longer applies. Refresh and review again.',409);
        const at = new Date();
        const updated = await DealerProfile.findOneAndUpdate({_id:id,updatedAt,status:record.status},{$set:{status:rule.to,rejectionReason:action==='reject'?note:'',moderation:{lastAction:rule.label,by:actor,at}},$push:{reviewHistory:{action:rule.label,from:record.status,to:rule.to,note,by:actor,at}}},{new:true,runValidators:true,session});
        if (!updated) throw new AppError('This dealer changed. Refresh and review again.',409);
        let unpublished = 0;
        if (action === 'suspend') { const result = await Car.updateMany({dealer:record.user,isPublished:true},{$set:{isPublished:false},$inc:{__v:1},$push:{reviewHistory:{action:'dealer_suspended',note,by:actor,at}}},{session}); unpublished=result.modifiedCount; }
        return { dealer:updated, unpublished };
      });
    },
    async release(id, body, actor) {
      const {updatedAt,note} = reviewInput(body);
      if (!['identity','photographs','price','seller'].every(key => body.confirmations?.[key] === true)) throw new AppError('Confirm all four vehicle checks before releasing the hold.',400);
      return transaction(async session => {
        const car = await Car.findOne({_id:id,updatedAt}).session(session).lean();
        if (!car || !car.publicationHold || car.isPublished) throw new AppError('This listing changed or no longer has a hold. Refresh and review again.',409);
        // Touch the dealer inside the transaction to serialize release against suspension.
        const dealer = await DealerProfile.findOneAndUpdate({user:car.dealer,status:'approved'},{$inc:{publicationVersion:1}},{new:true,session});
        if (!dealer) throw new AppError('The seller must be an approved dealer before release.',422);
        const issues = publicationIssues({...car,publicationHold:''});
        if (issues.length) throw new AppError(issues.join(' '),422);
        const at = new Date();
        const fingerprint = reviewFingerprint(car);
        const updated = await Car.findOneAndUpdate({_id:id,updatedAt,isPublished:false,publicationHold:car.publicationHold},{$set:{publicationHold:'',isPublished:false,publicationReview:{fingerprint,by:actor,at,note}},$push:{reviewHistory:{action:'hold_released',note,by:actor,at,fingerprint}}},{new:true,runValidators:true,session});
        if (!updated) throw new AppError('This listing changed. Refresh and review again.',409);
        return updated;
      });
    }
  };
}
module.exports = { createModerationService, reviewInput, transitions };
