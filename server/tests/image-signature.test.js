const test=require('node:test');const assert=require('node:assert/strict');
const {matchesImageSignature:valid}=require('../utils/imageSignature');
test('photo signatures reject mislabeled markup and accept the supported headers',()=>{
 for(const mime of ['image/jpeg','image/png','image/webp']) assert.equal(valid(Buffer.from('<html>bad</html>'),mime),false);
 assert.equal(valid(Buffer.from([255,216,255]),'image/jpeg'),true);
 assert.equal(valid(Buffer.from([137,80,78,71,13,10,26,10]),'image/png'),true);
 assert.equal(valid(Buffer.from('RIFF1234WEBP'),'image/webp'),true);
 assert.equal(valid(Buffer.from('RIFF1234WAVE'),'image/webp'),false);
 assert.equal(valid(Buffer.alloc(0),'image/jpeg'),false);
});
