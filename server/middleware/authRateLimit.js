const {rateLimit} = require('express-rate-limit');
// One API instance behind the single Caddy gateway in deploy/compose.yaml.
function authRateLimit(limit, windowMs = 15 * 60 * 1000) {
 return rateLimit({limit, windowMs, standardHeaders:'draft-8', legacyHeaders:false,
  message:{success:false,message:'Too many attempts. Please wait before trying again.'}});
}
module.exports={authRateLimit};
