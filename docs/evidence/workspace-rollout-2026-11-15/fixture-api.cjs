const http = require('http');
const fs = require('fs');
const auditFile = require('path').join(__dirname, 'audit.jsonl');
const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const other = 'bbbbbbbbbbbbbbbbbbbbbbbb';
let car = {_id:id,title:'QA BMW 320i M Sport — extended listing title',brand:'BMW',model:'320i M Sport',bodyStyle:'Sedan',year:2023,mileage:24000,price:38900,fuelType:'Petrol',transmission:'Automatic',location:'Hamburg',condition:'Non-Smoker',owner:'Dealer',description:'Synthetic QA record. Used only for local layout and interaction verification.',mainImage:'/placeholder-car.jpg',images:['/placeholder-car.jpg','/brand/categories/sedan.webp'],isPublished:false,updatedAt:'2026-11-15T15:00:00Z'};
let enquiryStatus='new', favorite=true;
let profileStatus='approved';
const long='Synthetic verification business with an extended company name';
const profile={_id:other,id:other,companyName:long,phone:'+49 000 000000',address:'Synthetic address for layout verification only',status:'approved',updatedAt:'2026-11-15T15:00:00Z',user:{name:'QA Dealer',email:'qa-dealer@example.invalid'}};
function cookie(req,key){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(key+'='))?.slice(key.length+1)||'';}
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost:5067'),p=u.pathname;
 res.setHeader('Access-Control-Allow-Origin','http://localhost:3017');res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 let text='';for await(const chunk of req)text+=chunk;
 let body={};try{body=JSON.parse(text||'{}');}catch{}
 const role=cookie(req,'qa_role')||'dealer',state=cookie(req,'qa_state')||'ready';
 const user={id:other,_id:other,name:'QA '+role,email:'qa-'+role+'@example.invalid',role};
 const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
 if(p==='/audit'){fs.appendFileSync(auditFile,text+'\n');return send({ok:true});}
 if(p==='/api/auth/me'){
  if(role==='guest')return send({message:'Sign in required'},401);
  if(state==='session-error')return send({message:'Fixture session unavailable'},503);
  if(req.method==='PATCH')user.name=body.name;
  return send({user});
 }
 if(p==='/api/auth/logout'){res.setHeader('Set-Cookie','qa_role=guest; Path=/; SameSite=Lax');return send({success:true});}
 if(p==='/api/auth/security')return state==='security-error'?send({message:'Fixture security failure'},503):send({emailVerified:state!=='unverified',emailDeliveryAvailable:false});
 if(p==='/api/auth/verification-email')return send({message:'Fixture only. No email sent.'});
 if(p.startsWith('/api/') && role==='guest')return send({message:'Sign in required'},401);
 if(p.startsWith('/api/admin/')&&role!=='admin')return send({message:'Administrator access required'},403);
 if(p.startsWith('/api/dealer')&&role!=='dealer')return send({message:'Dealer access required'},403);
 if(p==='/api/bookings/me'&&role!=='buyer')return send({message:'Buyer access required'},403);
 if(state==='loading')await new Promise(resolve=>setTimeout(resolve,5000));
 if(state==='error')return send({message:'Synthetic API unavailable. Try again.'},503);
 if(state==='missing' && /\/aaaaaaaaaaaaaaaaaaaaaaaa/.test(p))return send({message:'This record is no longer available.'},404);
 if(state==='conflict'&&req.method!=='GET')return send({message:'Record changed. Reload before trying again.'},409);
 if(p==='/api/dealers/me')return state==='onboarding'?send({message:'No profile'},404):send({data:{...profile,status:['pending','rejected','suspended'].includes(state)?state:profileStatus,rejectionReason:'Synthetic review feedback. Please confirm business details.'}});
 if(p==='/api/dealers/profile'){profileStatus='pending';return send({data:{...profile,status:'pending'}},201);}
 if(p==='/api/dealers/me/stats')return send({data:{totalCars:state==='empty'?0:2,publishedCars:state==='empty'?0:1,draftCars:state==='empty'?0:1,latestCars:state==='empty'?[]:[car]}});
 const selectedCar={...car,isPublished:state==='published'||car.isPublished,images:state==='no-photos'?[]:car.images,mainImage:state==='no-photos'?'':car.mainImage};
 if(p==='/api/dealer/cars/my')return send({success:true,data:state==='empty'?[]:[selectedCar,{...car,_id:other,title:'QA second vehicle',isPublished:true}]});
 if(p.endsWith('/readiness'))return send({data:{ready:!['held','no-photos'].includes(state),issues:['held','no-photos'].includes(state)?['Add verified photographs before publishing.']:[]}});
 if(p==='/api/dealer/cars'&&req.method==='POST'){car={...car,...body};return send({data:car},201);}
 if(p.startsWith('/api/dealer/cars/'+id)){
  if(req.method==='PUT' && p.endsWith('/publish'))car.isPublished=true;
  else if(req.method==='PUT' && p.endsWith('/unpublish'))car.isPublished=false;
  else if(req.method==='PUT' && p.endsWith('/images/order'))car.images=body.images;
  else if(req.method==='PUT' && p.endsWith('/main-image'))car.mainImage=body.url;
  else if(req.method==='PUT')car={...car,...body};
  if(req.method==='DELETE'&&p.endsWith('/images'))car.images=car.images.filter(x=>x!==body.url);
  return send({success:true,data:req.method==='GET'?selectedCar:car});
 }
 const enquiry={id,carId:state==='unavailable'?null:id,available:state!=='unavailable',vehicleTitle:car.title,dealerName:long,message:'Synthetic enquiry with a long message to verify wrapping. '+ 'Please confirm the vehicle history and viewing arrangements. '.repeat(4),status:enquiryStatus,createdAt:'2026-11-15T15:00:00Z',updatedAt:'2026-11-15T15:00:00Z',buyerName:'Synthetic buyer with an extended display name',buyerEmail:'synthetic-extended-email-for-layout@example.invalid'};
 if(p==='/api/enquiries/summary')return send({newCount:enquiryStatus==='new'?1:0});
 if(p==='/api/enquiries')return send({data:state==='empty'?[]:[enquiry],total:state==='empty'?0:11,page:Number(u.searchParams.get('page')||1),pages:state==='empty'?0:2});
 if(p.startsWith('/api/enquiries/')){enquiryStatus=body.status||enquiryStatus;return send({success:true});}
 if(p==='/api/favorites/me')return send({success:true,data:state==='empty'||!favorite?[]:[selectedCar]});
 if(p.startsWith('/api/favorites/')){favorite=req.method!=='DELETE';return send({success:true,isFavorite:favorite});}
 if(p==='/api/admin/stats')return send({data:{dealers:{pendingProfiles:state==='empty'?0:1},cars:{held:state==='empty'?0:1,published:1,total:2}}});
 if(p==='/api/admin/dealers')return send({success:true,data:state==='empty'?[]:[{...profile,status:'pending'}],pagination:{page:Number(u.searchParams.get('page')||1),totalPages:2,totalDealers:11}});
 if(p.startsWith('/api/admin/dealers/')){
  if(req.method==='PUT'){profileStatus=p.includes('approve')?'approved':p.includes('reject')?'rejected':p.includes('suspend')?'suspended':'pending';return send({success:true});}
  return send({success:true,data:{...profile,status:['approved','rejected','suspended'].includes(state)?state:'pending',reviewHistory:[{_id:'qa-history',action:'submitted',note:'Synthetic review history',at:'2026-11-15T15:00:00Z',by:{name:'QA Administrator'}}]}});
 }
 if(p==='/api/admin/cars')return send({success:true,data:state==='empty'?[]:[{...selectedCar,publicationHold:'Synthetic identity review hold',dealer:{name:'QA Dealer'}}],pagination:{totalCars:11,totalPages:2}});
 if(p.startsWith('/api/admin/cars/'))return send({success:true,data:{...selectedCar,publicationHold:state==='published'?'':'Synthetic identity review hold'},seller:{companyName:long,status:state==='suspended'?'suspended':'approved'},issues:state==='held'?['The seller must confirm the vehicle identity.']:[]});
 if(p==='/api/bookings/me'||p==='/api/admin/bookings')return send({success:true,data:state==='empty'?[]:['pending','approved','cancelled','completed'].filter(s=>!u.searchParams.get('status')||s===u.searchParams.get('status')).map((status,i)=>({_id:id+i,status,service:state==='unavailable'?null:{title:'Synthetic service booking with an extended title',durationMinutes:60},scheduledAt:'2026-12-01T14:00:00Z',note:'Synthetic booking note for layout verification.',cancelReason:status==='cancelled'?'Synthetic cancellation reason':'',user:{name:'QA Buyer',email:'qa-buyer@example.invalid'}})),pagination:{page:Number(u.searchParams.get('page')||1),totalPages:2,totalBookings:14}});
 if(p==='/api/cars/meta/brands')return send({data:['BMW']});
 if(p==='/api/cars')return send({success:true,data:[selectedCar],pagination:{totalCars:1,totalPages:1,page:1}});
 if(p.startsWith('/api/cars/'))return send({success:true,data:{...selectedCar,dealer:{_id:other,name:'QA Dealer',email:'qa@example.invalid'}}});
 return send({message:'Unhandled fixture endpoint '+p},404);
}).listen(5067,'127.0.0.1',()=>console.log('Synthetic QA API on 5067'));
