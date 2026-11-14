const User = require('../models/User');
exports.update = async (req,res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if(name.length<2 || name.length>50) return res.status(400).json({message:'Your name must contain between 2 and 50 characters.'});
  if(Object.keys(req.body).some(key=>key!=='name')) return res.status(400).json({message:'Only your display name can be changed here.'});
  try {
    const user=await User.findByIdAndUpdate(req.user.id,{$set:{name}},{new:true,runValidators:true}).select('_id name email role');
    if(!user)return res.status(401).json({message:'Please sign in again.'});
    res.set('Cache-Control','no-store');
    return res.json({user:{id:String(user._id),name:user.name,email:user.email,role:user.role}});
  } catch { return res.status(500).json({message:'Your name could not be saved. Please try again.'}); }
};
