const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');
// Create UserSchema object

var validateEmail = function(email) {
   var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   return re.test(email)
};

const UserSchema = new mongoose.Schema({
 firstName: {
    required: [true, "First Name is Required"],
    type: String,
    trim: true,
    text: true
 },

 lastName: {
    required: [true, "Last Name is Required"],
    type: String,
    trim: true,
    text: true
 },
 username: {
   required: [true, "User Name is Required"],
   type: String,
   trim: true,
   text: true,
   unique: true
 },
 profileImage: {
    type: String,
    trim: true,
    default: "https://www.nps.gov/articles/000/images/Ranger_ValerieLamm.png"
 },
 cover: {
   type: String,
   trim: true
 },
 email:{
    required: [true, "Email is Required"],
    type: String,
    trim: true,
    validate: [validateEmail, 'Please fill a valid email address here.'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
 },
 gender: {
   required: [true, "Gender is Required"],
    type: String,
    trim: true
 },
 birthYear: {
   required: true,
   type: Number,
   trim: true
 },
 birthMonth: {
   required: true,
   type: Number,
   trim: true
 },
 birthDay: {
   required: true,
   type: Number,
   trim: true
 },
 friends: {
   type: Array,
   default: []
 },
 request: {
   type: Array,
   default: []
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
  search: [
   {
      user: {
         type: mongoose.Schema.ObjectId,
         ref: "User"
      }
   }
  ],
  details: {
   bio:{
      type: String,
   },
   otherName:{
      type: String,
   },
   job:{
      type: String,
   },
   workPlace:{
      type: String,
   },
   highschool:{
      type: String,
   },
   college:{
      type: String,
   },
   currentCity:{
      type: String,
   },
   homeTown:{
      type: String,
   },
   reationShip:{
      type: String,
      enum: ['Single', 'In a Relationship', "Married", "Divorced", "For Fun And Gun"]
   },
   savePost: [
      {
         post:{
            type:mongoose.Schema.ObjectId,
            ref: "Post"
         },
         saveAt: {
            type: Date,
            default: new Date()
         }
      }

   ],
   instagram:{
      type: String,
   },
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

UserSchema.virtual("accountType").get(function() {
   const totalFollowers = this.followers?.length;
   return totalFollowers >= 10 ? "Pro-Account" : "Starter-Account"
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