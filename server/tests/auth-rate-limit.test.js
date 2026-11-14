const test=require('node:test');const assert=require('node:assert/strict');const express=require('express');
const {authRateLimit}=require('../middleware/authRateLimit');
test('authentication limits repeated requests and supplies retry information',async()=>{
 const app=express();app.post('/login',authRateLimit(2),(_req,res)=>res.status(401).json({message:'Invalid credentials'}));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{const url=`http://127.0.0.1:${server.address().port}/login`;
 assert.equal((await fetch(url,{method:'POST'})).status,401);assert.equal((await fetch(url,{method:'POST'})).status,401);
 const blocked=await fetch(url,{method:'POST'});assert.equal(blocked.status,429);assert(blocked.headers.get('retry-after'));assert.match((await blocked.json()).message,/Too many attempts/);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
