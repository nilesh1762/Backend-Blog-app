const express = require('express')

const {UserRegisterCtlr, UserLoginCtlr, fetchUserCtlr, DeleteUserCtlr, fetchUserDetailCtlr,  userProfile, updateUser, updatedPassword, 
      forgetPassword,resetPassword, followingUserCtlr, UnfollowingUserCtlr, blockUserCtlr, unBlockUserCtlr, 
      geerateVarificationtokenctlr, generateVerificationMailctlr, accountVerificationctlr, userProfilectlr} = require('../../Controller/Users/UserController');

const authMiddleware = require('../../Middleware/Auth/AuthMiddleware');

const { PhotoUpload , profilePhotosize} = require('../../Middleware/Upload/PhotoUpload');

const userRoutes = express.Router();

userRoutes.post('/register', UserRegisterCtlr);

userRoutes.post('/login', UserLoginCtlr);

userRoutes.put('/profilephoto-upload', authMiddleware, PhotoUpload.single('image'),profilePhotosize, userProfilectlr);

userRoutes.get('/', authMiddleware , fetchUserCtlr);

userRoutes.delete('/:id', DeleteUserCtlr);

userRoutes.get('/:id', fetchUserDetailCtlr);

userRoutes.get('/profile/:id',authMiddleware, userProfile);

userRoutes.put('/followuser', authMiddleware, followingUserCtlr);

userRoutes.post('/generate-verify-token-mail',  authMiddleware, generateVerificationMailctlr);

userRoutes.put('/verify-account',  authMiddleware, accountVerificationctlr);

userRoutes.put('/unfollowuser', authMiddleware, UnfollowingUserCtlr);

userRoutes.put('/block-user/:id', authMiddleware, blockUserCtlr);

userRoutes.put('/unblock-user/:id', authMiddleware, unBlockUserCtlr);

userRoutes.post('/send-mail', geerateVarificationtokenctlr);

userRoutes.put('/:id', authMiddleware, updateUser);

userRoutes.patch('/updatePassword/:id',authMiddleware, updatedPassword);

userRoutes.post('/forgetpassword', forgetPassword);

userRoutes.patch('/resetpassword/:token', resetPassword);



module.exports = userRoutes;