const { validateToken } = require('../services/authentication') 

const User = require('../models/user.models');

function checkForAuthenticationCookie(cookieName)
{
    return async(req,res,next)=>{
        const tokenValue = req.cookies[cookieName];
        if(!tokenValue)
        {
          req.user = null;
          return  next();
        }
        try {
            const userPayload = validateToken(tokenValue);
            /* req.user = userPayload; */
            const user = await User.findById(userPayload._id);
            if(!user){
              req.user = null;
              return next();
            }
            req.user = user;
        } catch (error) {
          console.error('Error validating token:', error.message);
          req.user = null;
        };
        
      return  next();
    };
}

module.exports = {
    checkForAuthenticationCookie
};