// const expressAsyncHandler = require('express-async-handler');
// const AppError = require('./../../Utils/AppEroor');
// const jwt = require('jsonwebtoken');


// const User = require('../../Model/User/User');

// const authMiddleware = expressAsyncHandler(async(req, res, next) => {
  
//     let token;
     
//    if (req?.headers?.authorization?.startsWith("Bearer")) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       if (token) {
//         const decoded = jwt.verify(token, process.env.JWT_KEY);
//         //find the user by id
//         const user = await User.findById(decoded?.id).select("-password");
//         //attach the user to the request object
//         req.user = user;
//         next();
//       } else {
//         throw new "There is no token attached to the header"();
//       }
//     } catch (error) {
//       throw new Error("Not authorized token expired, login again");
//     }
//   }

   
// })

// module.exports = authMiddleware;

const expressAsyncHandler = require("express-async-handler");

const jwt = require("jsonwebtoken");
const User = require('../../Model/User/User');
const AppError = require("../../Utils/AppEroor");
const { promisify } = require('util')

const authMiddleware = expressAsyncHandler(async (req, res, next) => {

  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
}

  if(!token){
    return next(
        new AppError('You are not logged in. Please login in to get access.', 401)
    )
}
    // Verification token is avilable or not

    const decode = await promisify(jwt.verify) (token, process.env.JWT_SECRET);
    
    //Check If User Exist or Not.
    const freshUser  = await User.findById(decode.id);
    // console.log("freshUser", freshUser, decode)
    if(!freshUser){
         return next(new AppError('The user belonging to this token not exit.', 401))
    }

    //Check if user change password after the token was issued.
    if(freshUser.changePasswordAfter(decode.iat)){
        return next(new AppError('User recently change the password! Please login again.', 401))
    }
    
    //Grant Access To Protect Route
    req.user = freshUser
    next();
  
});

module.exports = authMiddleware;
