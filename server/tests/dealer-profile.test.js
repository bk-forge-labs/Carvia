const test = require('node:test');
const assert = require('node:assert/strict');
const Profile = require('../models/DealerProfile');
const {getMyProfile} = require('../controllers/dealerController');
test('dealer profile exposes company name and status-specific feedback without moderator identity', async () => {
  const original = Profile.findOne;
  try {
    for (const status of ['pending', 'approved', 'rejected', 'suspended']) {
      Profile.findOne = filter => {
        assert.deepEqual(filter, {user: 'owner'});
        return {select(fields) {
          assert(fields.split(' ').includes('companyName'));
          return {populate: async () => ({_id: 'profile', companyName: 'Dealer name', status, rejectionReason: 'Review reason', moderation: {at: new Date(), by: 'private-admin', lastAction: 'reject'}, reviewHistory: ['private']})};
        }};
      };
      const res = {status(code) {this.code = code; return this;}, json(body) {this.body = body; return this;}};
      await getMyProfile({user: {id: 'owner'}}, res);
      assert.equal(res.code, 200);
      assert.equal(res.body.data.companyName, 'Dealer name');
      assert.equal(res.body.data.canPostCars, status === 'approved');
      assert.equal(res.body.data.rejectionReason, status === 'rejected' ? 'Review reason' : '');
      assert.equal(res.body.data.lastModeration.by, undefined);
      assert.equal(res.body.data.reviewHistory, undefined);
    }
  } finally {Profile.findOne = original;}
});
