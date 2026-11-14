const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const context = {exports: {}, URL};
const source = fs.readFileSync(path.join(__dirname, '../src/lib/auth/returnTo.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText, context);
const {safeReturnTo, signInHref} = context.exports;
test('dealer listing destinations survive sign-in', () => {
  for (const destination of ['/dealer', '/dealer/cars', '/dealer/cars/new', '/dealer/cars?status=draft', '/dealer/cars/aaaaaaaaaaaaaaaaaaaaaaaa', '/dealer/cars/aaaaaaaaaaaaaaaaaaaaaaaa/edit', '/dealer/cars/aaaaaaaaaaaaaaaaaaaaaaaa/images', '/dealer/enquiries', '/dealer/onboarding', '/dealer/pending']) {
    assert.equal(safeReturnTo(destination), destination);
    assert.equal(new URL(signInHref(destination), 'https://carvia.invalid').searchParams.get('next'), destination);
  }
});
test('external and unrecognised destinations are rejected', () => {
  for (const destination of ['//evil.com', 'https://evil.com', '/dealer/cars/invalid/edit', '/dealer/cars/new/extra', '/dealer/../../admin', '/dealer%2fcars']) assert.equal(safeReturnTo(destination), null);
  assert.equal(safeReturnTo('/dealer' + String.fromCharCode(92) + 'evil'), null);
  assert.equal(safeReturnTo('/dealer' + String.fromCharCode(10)), null);
});
test('buyer destinations and enquiry anchor stay supported', () => {
  for (const destination of ['/buyer/favorites', '/buyer/enquiries', '/account', '/cars/aaaaaaaaaaaaaaaaaaaaaaaa#vehicle-enquiry']) assert.equal(safeReturnTo(destination), destination);
  assert.equal(safeReturnTo('/cars#unexpected'), '/cars');
});

test('known administrator destinations survive sign-in without allowing arbitrary admin paths', () => {
  for (const destination of ['/admin', '/admin/dealers', '/admin/dealers?status=pending', '/admin/dealers/aaaaaaaaaaaaaaaaaaaaaaaa', '/admin/cars', '/admin/cars/aaaaaaaaaaaaaaaaaaaaaaaa']) {
    assert.equal(safeReturnTo(destination), destination);
    assert.equal(new URL(signInHref(destination), 'https://carvia.invalid').searchParams.get('next'), destination);
  }
  for (const destination of ['/admin/users', '/admin/dealers/invalid', '/admin/cars/aaaaaaaaaaaaaaaaaaaaaaaa/delete', '/admin//dealers']) assert.equal(safeReturnTo(destination), null);
});
