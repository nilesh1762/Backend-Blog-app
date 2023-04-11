const User = require('../../Model/User/User');
const expressAsyncHandler = require('express-async-handler');
const fs = require('fs');
const generateToken = require('../../Config/Token/Generatetoken');
const ValidateMongoDbId = require('../../Utils/ValidateMongoDbId');
const sgMails = require('@sendgrid/mail')
const AppError = require('../../Utils/AppEroor');
const sendEmail  = require('./../../Utils/email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cloudnaryUploadImage = require('../../Utils/Cloudniary');
const nodemailer = require("nodemailer");
const { validateUsername } = require('../../Utils/validateUsername');


sgMails.setApiKey(process.env.SENDGRID_API_KEY)

const filterObj = (obj, ...allowedFields) => {
   const newObj = {};
   Object.keys(obj).forEach(el => {
     if (allowedFields.includes(el)) newObj[el] = obj[el];
   });
   return newObj;
 };

 const signToken = (id) => {

   return jwt.sign({ id }, process.env.JWT_SECRET, {
       expiresIn: process.env.JWT_EXPIRES_IN
   });
}

const createSendtoken = (user, statuscode, res) => {
   
   const token = signToken(user._id);
    
   const cookieOptions = {
       expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
       ),
       httpOnly: true
     };

     if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

     res.cookie('jwt', token, cookieOptions);
     
     // Remove password from output
     user.password = undefined;

    res.status(statuscode).json({
        status: 'Success',
        token,
        data: {
            user
        }
    })
}

const UserRegisterCtlr = expressAsyncHandler(async (req, res) => {
 
    //Register User
    //Check If User Exits
   //  const UserExits = await User.findOne({email: req?.body?.email });
   //  const UserName = await User.findOne({username: req?.body?.username});

   //  if(UserExits) throw new Error("User Email Already Exists, try With Another Email.")
   //  if( UserName) throw new Error("User Name Already Exists. Please Choose Another User Name.")
 
   // const newUser = await User.create(req.body);
   try{
      const {
         firstName,
         lastName,
         email,
         password,
         passwordConfirm,
         username,
         birthYear,
         birthMonth,
         birthDay,
         gender,
       } = req.body;
   
       const UserExits = await User.findOne({email: req?.body?.email });
       
       if(UserExits) throw new Error("User Email Already Exists, try With Another Email.");

       let tempUsername = firstName + lastName;
       let newUsername = await validateUsername(tempUsername);

       const user = await new User({
         firstName,
         lastName,
         email,
         password,
         passwordConfirm,
         username: newUsername,
         birthYear,
         birthMonth,
         birthDay,
         gender,
       }).save();

       createSendtoken(user, 201, res)
   } catch (error) {
      res.status(500).json({ message: error.message });
    }
  
   

})

const UserLoginCtlr = expressAsyncHandler(async (req, res, next) => { 
   const {email, password } = req.body;
   // Check User Exits
   //const user =  await User.findOne({ email }).select('+password')
//    const userFound = await User.findOne({email}).select('+password');
//   //console.log("User found: ", userFound)
//    if(userFound &&(await userFound.comparePassword(password))){
//       res.json({
//          _id: userFound._id,
//          firstName: userFound.firstName,
//          lastName: userFound.lastName,
//          email: userFound.email,
//          profilePhoto: userFound.profilePhoto,
//          isAdmin: userFound.isAdmin,
//          token: generateToken(userFound._id),
//       })
//    }else{
//       res.status(401);
//        throw new Error("User Credential Wrong.")
//    }

//check if email and password exist or not
if(!email || !password){
   return next(new AppError('Please provide email and password!', 400));

}

  //check if user exit and password correct
  const user =  await User.findOne({ email }).select('+password')
    

  if(!user || (!await user.correctPassword(password, user.password))){
      return next(new AppError('Incorrect email or password.', 401))
  }
 //If every thing ok then send token to client

 createSendtoken(user, 200, res)

})

const fetchUserCtlr = expressAsyncHandler(async (req, res) => {
   // console.log("Beraer===", req.headers);
     try{
          const users = await User.find({}).populate('post');
          
          res.json(users)
     }catch(error){
      res.json(errror)

     } 
});

const DeleteUserCtlr = expressAsyncHandler(async (req, res) => {
   const { id } = req.params;

     //Check If User Id is valid

     ValidateMongoDbId(id)
   try{
      const deleteuser = await User.findByIdAndDelete(id);
      res.json(deleteuser);
   }catch(error){
          
      res.json(error)
   }

    res.json("Delete User Success")
});

const fetchUserDetailCtlr = expressAsyncHandler(async (req, res) => {
 
   const { id } = req.params;

   //Check If User Id is valid

   ValidateMongoDbId(id)
 try{
    const user  = await User.findById(id);
    res.json(user);
 }catch(error){
        
    res.json(error)
 }
});

// User Profile details

const userProfile = expressAsyncHandler(async (req, res) => {
   //console.log("Beraer===s", req.headers);
   const { id} = req.params;
  
    ValidateMongoDbId(id)

    const loginuserId = req?.user?._id?.toString();
  
    try{
        const myProfile = await User.findById(id).populate("post").populate("viewedBy");
        const alreadyView = myProfile?.viewedBy?.find(user => {
        // console.log("loginuserId===", user);
          return user?._id?.toString() === loginuserId;

        });
       
        if(alreadyView){
         res.json(myProfile)
        }else{
        const profile = await User.findByIdAndUpdate(myProfile?._id?.toString(), {
         $push: {viewedBy: loginuserId}
        });
       
        res.json(profile)
        }
     
    }catch (error){
        res.json(error)
        
    }
});

const updateUser = expressAsyncHandler(async (req, res, next) => {
   // 1) Create error if user POSTs password data
   if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password update. Please visit updatemypassword.', 400));
  }

   // 2) Filtered out unwanted fields names that are not allowed to be updated 
   const filteredBody = filterObj(req.body, 'firstName','lastName', 'email');

       const { _id } = req.user;
       ValidateMongoDbId(_id);

       //Block User
       if (req.user?.isBlocked) {
         throw new Error(`Access Denied ${req.user?.firstName} is blocked`);
       }

       const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
         new: true,
         runValidators: true
       });
     
        res.status(200).json({
         status: 'Success',
         data: {
             user: updatedUser
           }
     })
});

//Update password

const updatedPassword = expressAsyncHandler(async(req, res, next) => {
  const { _id } = req.user;
  const { password } = req.body;

  ValidateMongoDbId(_id);

  const user = await User.findById(_id).select('+password');;
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
   return next(new AppError('Your current password is wrong', 401));
}
  if(password){
   user.password = password;
   user.passwordConfirm = req.body.passwordConfirm
   const updateUser = await user.save();
   res.json(updateUser);
  }

  res.json(user)

});

//Forget Password
const forgetPassword = expressAsyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req?.body?.email});

    if(!user){
      return next(new AppError('There is no user with this email id.', 404))
  }

   //Generate the random reset token
   const resetToken  = user.createPasswordResetToken()
   await user.save({validateBeforeSave: false});

    // send email to user for password change
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: 
      ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

     
      try{
         // await sendEmail({
         //     email: user.email,
         //     subject: 'Your password reset token (valid for 10 min.)',
         //     message
         // });
    
         // res.status(200).json({
         //     status: "Success",
         //     message: "Token sent to email."
         // })
         const msg = {
            to: 'nileshsingh1762@gmail.com', // Change to your recipient
            from: 'kumarnile@gmail.com', // Change to your verified sender
            subject: 'Sending with My BlogApp is Fun',
            html: message,
            
          }
             
          await sgMails.send(msg);

          res.status(200).json({
             status: "Success",
             message: "Token sent to email."
         })

       }catch(err){
           user.passwordResetToken = undefined;
           user.passwordResetExpire = undefined;
           await user.save({validateBeforeSave: false});
 
           return next(new AppError('There was an error sending the mail. Try again!', 500))
       }
  
});

const resetPassword = expressAsyncHandler(async(req, res, next) => {
// 1) Get user based on the token

const hashedToken = crypto
.createHash('sha256')
.update(req.params.token)
.digest('hex');

const user = await User.findOne({
passwordResetToken: hashedToken,
passwordResetExpire: { $gt: Date.now() }
});

// 2) If token has not expired, and there is user, set the new password
if (!user) {
return next(new AppError('Token is invalid or has expired', 400));
}

user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();

// 3) Update changedPasswordAt property for the user
// 4) Log the user in, send JWT
const token = signToken(user._id);
// console.log("reset", token);

 res.status(200).json({
   status: 'success',
   token
 })

});

// Following User
const followingUserCtlr = expressAsyncHandler(async(req, res) => {
//1. Find the user you want to follow and update in follower's field.


  const { followId } = req.body
  const loginUserId = req.user.id

  // Find the target User and check if the login id exits.

  const targetUser = await User.findById(followId)

  const alreadyFollowingUser = targetUser.followers.find(user => user.toString() === loginUserId.toString());

  if(alreadyFollowingUser){
   throw new Error('You already follow this user.', 500)
  }

   await User.findByIdAndUpdate(followId, {
      $push: { followers: loginUserId},
      isFollowing: true,
   },
   {new: true}
   )
 
   //2. Update the login user following fields.

   await User.findByIdAndUpdate(loginUserId, {
      $push: { following: followId},
   },
   { new: true}
   )

   res.json('You have successfully follow this user.')

 
});

// Unfolow UserRegisterCtlr

const UnfollowingUserCtlr = expressAsyncHandler(async(req, res) => {

   const { unfollowId } = req.body
   const loginUserId = req.user.id

   await User.findByIdAndUpdate(unfollowId,{
      $pull:  { followers: loginUserId},
      isFollowing: false,
   }, { new: true});
 
   await User.findByIdAndUpdate(loginUserId, {
      $pull:  { following: unfollowId},
   }, { new: true});


   res.json('You have successfully unfollow this user.')
});

// Block UserRegisterCtlr

const blockUserCtlr = expressAsyncHandler(async(req, res) => {
   const { id } = req.params;
   ValidateMongoDbId(id);

    const user = await User.findByIdAndUpdate(id, {
      isBlocked: true
    }, {new: true});

    res.json(user);
})

// UnBlock UserRegisterCtlr

const unBlockUserCtlr = expressAsyncHandler(async(req, res) => {
   const { id } = req.params;
   ValidateMongoDbId(id);

    const user = await User.findByIdAndUpdate(id, {
      isBlocked: false
    }, {new: true});

    res.json(user);
});

const geerateVarificationtokenctlr = expressAsyncHandler(async(req, res, next) => {
   const user = await User.findOne({email: req?.body?.email});
//   console.log("mail", user);
   if(!user){
     return next(new AppError('There is no user with this email id.', 404))
 }

 // send email to user 
 

 const message = `Email Sent The User Email.`;

   try{
      await sendEmail({
          email: user.email,
          subject: 'Check Out For This Mail.',
          message
      });
 
      res.status(200).json({
          status: "Success",
          message: "Email Sent."
      })
    }catch(err){
      
      return next(new AppError('There was an error sending the mail. Try again!', 500))
    }
});

// Generate Email Address=== Send Mail

const generateVerificationMailctlr = expressAsyncHandler(async(req, res, next) => {
   const loginuser = req.user.id;
   const user = await User.findById(loginuser);
  
  try{
    const verificationToken = await user?.createAccountverifyToken();
    await user.save()
   
    const resetURL = `If you are requested to verify your account verify in next 10 minutes. Click on the link <a href="http://localhost:3000/verify-account/${verificationToken}">
    Verify Account </a>`;

   // const msg = {
   //    to: user?.email, // Change to your recipient
   //    from: 'kumarnile@gmail.com', // Change to your verified sender
   //    subject: 'Sending with My BlogApp is Fun',
   //    html: resetURL,
      
   //  }
  
   //  await sgMails.send(msg);
   //  res.json(resetURL)

   const transporter = nodemailer.createTransport({

      service: "gmail",
      auth: {
         user: process.env.EMAIL,
         pass: process.env.PASSWORD
      }
   });

   const mailoption = {
      from: process.env.EMAIL,
      to: user?.email,
      subject: 'Sending with My BlogApp',
      html: resetURL,
   }

   transporter.sendMail(mailoption, (error, info) => {
  
      if(error){
         console.log("Mail-Err===", error)
      }else{
         // console.log("Email-Sent===", resetURL, info);
         res.json(resetURL)
      }
      

   })

  }catch(err){
       res.json(err)
      // return next(new AppError('Mail Not Send!', 500))
    }
});

//Account Varification message

const accountVerificationctlr = expressAsyncHandler(async(req, res, next) => {

   const {token } = req.body
   
   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   const userFound = await User.findOne({
      accountVerificationtoken: hashedToken,
      accountVerificationtokenExpire: {$gt: new Date()}
   })
   console.log("token===", token, userFound)
   if(!userFound) throw new Error("User token expire. Please try again.");

    userFound.isAccountVerified = true;
    userFound.accountVerificationtoken = undefined;
    userFound.accountVerificationtokenExpire= undefined;

    await userFound.save();
   res.json(userFound)
   // console.log("userFound", userFound)

});

// User Profile Controler


const userProfilectlr = expressAsyncHandler(async(req, res, next) => {
  
   // Get local Path of Image
   const localPath = `Public/Images/Profile/${req.file.filename}`;

   //Upload Cloudnariy

   const imgUpload = await cloudnaryUploadImage(localPath);
  
    // Find the Login User

    const { _id } = req.user

    // User Block
    if (req.user?.isBlocked) {
      throw new Error(`Access Denied ${req.user?.firstName} is blocked`);
    }

    const userFound = await User.findByIdAndUpdate(_id, {
      profileImage: imgUpload?.url
    },
     {new: true}
     
     );
   
     fs.unlinkSync(localPath);
     res.json(imgUpload)
   //   console.log("userFound", req.user)
});

module.exports = {
   
   UserRegisterCtlr, UserLoginCtlr, fetchUserCtlr, 
   DeleteUserCtlr, fetchUserDetailCtlr, userProfile, 
   updateUser,updatedPassword,forgetPassword,
   resetPassword, followingUserCtlr, UnfollowingUserCtlr, blockUserCtlr,
   unBlockUserCtlr, geerateVarificationtokenctlr, generateVerificationMailctlr,accountVerificationctlr,userProfilectlr

}