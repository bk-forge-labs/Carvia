const test = require('node:test');
const assert = require('node:assert/strict');
const {validate} = require('../middleware/validate');
const {createBookingSchema} = require('../validations/booking.validation');

test('booking validation accepts the supported request before the controller runs', () => {
  const request = {
    body: {serviceId: 'aaaaaaaaaaaaaaaaaaaaaaaa', scheduledAt: '2026-12-01T14:00:00Z', note: 'Inspection'},
    query: {},
    params: {},
  };
  let called = false;
  validate(createBookingSchema)(request, {}, error => {
    assert.equal(error, undefined);
    called = true;
  });
  assert.equal(called, true);
  assert.equal(request.body.note, 'Inspection');
});

test('booking validation rejects missing fields with a client error', () => {
  const response = {
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  validate(createBookingSchema)({body: {}, query: {}, params: {}}, response, () => {
    assert.fail('Invalid booking must not reach the controller');
  });
  assert.equal(response.code, 400);
  assert.equal(response.body.success, false);
  assert(response.body.errors.some(issue => issue.path === 'body.serviceId'));
  assert(response.body.errors.some(issue => issue.path === 'body.scheduledAt'));
});
