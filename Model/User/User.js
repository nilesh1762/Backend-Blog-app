const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');
// Create UserSchema object

const UserSchema = new mongoose.Schema({
 firstName: {
    required: [true, "First Name is Required"],
    type: String
 },

 lastName: {
    required: [true, "Last Name is Required"],
    type: String
 },
 profileImage: {
    type: String,
    default: "https://www.nps.gov/articles/000/images/Ranger_ValerieLamm.png"
 },
 email:{
    required: [true, "Email is Required"],
    type: String
 },
 bio:{
    type: String,
 },
 password:{
    required: [true, "Password is Required"],
    minlength: 5,
    select: false,
    type: String
 },
 passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
        validator: function(el){
        return el === this.password
      },
      message: "Password Not Match."
    },
    select: false,
  },
 postCount:{
    type: Number,
    default: 0
 },
 isBlocked:{
    type: Boolean,
    default: false
 },
 isAdmin:{
    type: Boolean,
    default: false,
 },
 role:{
    type: String,
    enum:['Admin', 'Guest', 'Blogger']
 },
 isFollowing:{
    type: Boolean,
    default: false
 },
 isUnFollowing:{
    type: Boolean,
    default: false
 },
  isAccountVerified:{
    type: Boolean,
    default: false
  },
  accountVerificationtoken: String,
  accountVerificationtokenExpire: Date,

  viewedBy:{
    type: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
  },

  followers:{
    type: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
  },

  following:{
    type: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
  },

  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  passwordChangedAt: Date,
  active:{
    type: Boolean,
    default: true
  }
}, {
    toJSON:{
        virtuals: true,
    },
    toObject:{
        virtuals: true
    },
    timestamps: true
});


//Hash Password
// UserSchema.pre('save', async function(next){
    
//    const salt = await bycrypt.genSalt(10)
//    this.password = await bycrypt.hash(this.password, salt) 
//      next();
// })

//Virtual method to populate created post

UserSchema.virtual('post', {
   ref: 'Post',
   foreignField: 'user',
    localField: '_id'
})

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

     this.password = await bycrypt.hash(this.password, 10);
     this.passwordConfirm = undefined;
     next();
})

// Match password

UserSchema.methods.comparePassword = async function (enterdPassword) {
   return await bycrypt.compare(enterdPassword, this.password);
 };

 //check or compare password in database 

 UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
  // console.log("userPassword", candidatePassword, userPassword);
   return await bycrypt.compare(candidatePassword, userPassword)
 }

 UserSchema.methods.createPasswordResetToken = function(){
   const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
   //console.log({resetToken}, this.passwordResetToken )
   this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
   return resetToken;
  }

  UserSchema.methods.changePasswordAfter =  function(JWTTimestamp){
   if(this.passwordChangedAt){
     const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

      console.log(changedTimestamp, JWTTimestamp)
     return JWTTimestamp < changedTimestamp
   }

   return false
}

// user acciunt verify token

UserSchema.methods.createAccountverifyToken = async function(){

   const verifyToken = crypto.randomBytes(32).toString('hex');
   this.accountVerificationtoken = crypto.createHash('sha256').update(verifyToken).digest('hex');
   this.accountVerificationtokenExpire = Date.now() + 30 * 60 * 1000; // 10 minutes

   return verifyToken;

}
// Complie Schema into model

const User = mongoose.model("User", UserSchema)

module.exports = User;