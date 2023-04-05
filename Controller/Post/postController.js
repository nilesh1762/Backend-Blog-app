const expressAsyncHandler = require('express-async-handler');
const Post = require("../../Model/Post/Post");
 const ValidateMongoDbId = require('../../Utils/ValidateMongoDbId');
 const Filter = require( "bad-words");
const User = require('../../Model/User/User');
const cloudnaryUploadImage = require('../../Utils/Cloudniary');
const fs = require('fs');
const { post } = require('../../Route/Posts/PostRoute');

const createPostCtlr = expressAsyncHandler(async(req, res) => {

      const { _id } = req.user;
    //   ValidateMongoDbId(req.body.user);

      let filter = new Filter();
       const profaneWords = filter.isProfane(req.body.title, req.body.description);

       // Block User If User Find With Profane Words.
      if(profaneWords){
        const user = await User.findByIdAndUpdate(_id, {
            isBlocked: true
           });
          throw new Error('You Have Been Blocked Due To Profane Words In Your Post.');
      }
        // Get local Path of Image
   const localPath = `Public/Images/post/${req.file.filename}`;

   //Upload Cloudnariy

   const imgUpload = await cloudnaryUploadImage(localPath);
    
//    res.json(imgUpload);
      
   try{
       
    const post = await Post.create({
        ...req.body,
        image: imgUpload?.url,
        user: _id
    });
    res.json(post);
   // fs.unlinkSync(localPath);

   }catch(err){

    res.json(err);
   }
});

const fetchPostCtlr = expressAsyncHandler(async(req, res) => {
 
     const hasCategory = req.query.category
  
    try{
       //Check If It Has Category
        
       if(hasCategory){
        const post = await Post.find({category: hasCategory}).populate('user').populate('comment');
      
        res.json(post);
       }else{
        const allpost = await Post.find({}).populate('user').populate('comment');
        res.json(allpost);
       }
      
    }catch(error){
      res.json(err);
    }
});

const fetchSinglePostCtlr = expressAsyncHandler(async(req, res) => {
    
  const { id } = req.params
  ValidateMongoDbId(id)
  
  try{
     
    const post = await Post.findById(id).populate("user").populate("disLikes").populate("likes").populate('comment');

    //Update Number Of Views
     await Post.findByIdAndUpdate(id, {
    
        $inc : {numViews  : 1}
     },
      {new : true} ,
     );

    res.json(post);

  }catch(error){
    res.json(error);
  }
});

const updatePostCtlr = expressAsyncHandler(async(req, res) => {
  const { id } = req.params
  ValidateMongoDbId(id)
 
  try{
     
    const post = await Post.findById(id).populate("user");

    //Update Number Of Views
     await Post.findByIdAndUpdate(id, {
    
      ...req.body,
      user: req.user._id,
     },
      {new : true} ,
     );

    res.json(post);

  }catch(error){
    res.json(error);
  }

});

const deletePostCtlr = expressAsyncHandler(async(req, res) => {
  const { id } = req.params
  ValidateMongoDbId(id);

  try{
   
     const post = await Post.findByIdAndDelete(id);
     
     res.json(post);
  }catch(error){
    res.json(error);
  }

});

const toggleLikeAddToPostCtlr = expressAsyncHandler(async(req, res) => {

// Find The Post To Be Liked
   const { postId } = req.body;
   const post = await Post.findById(postId);

   // Find The Login User 

   const loginUserID = req.user._id

   // Find Is This User Like This Post

   const isLiked =  post?.isLiked;

   // Check If tHis User Dislikes This Post

   const alreadyDisliked = post?.disLikes?.find(userId => userId.toString() === loginUserID.toString());
  
  // console.log( "IsLikeed: " + loginUserID, postId,post );

   if(alreadyDisliked){
     const post = await Post.findByIdAndUpdate(postId, {
      $pull: {disLikes: loginUserID},
      isDisLiked: false,
     },
      {new : true}
     );
     res.json(post);
   }

   //Toggle User
   // Remove this User Likes This Post

   if(isLiked){
    const post = await Post.findByIdAndUpdate(postId, {
     $pull: {likes: loginUserID},
     isLiked: false,
    },
     {new : true}
    );
    res.json(post);
  }
  
    else{
      // Add To Likes List
      const post = await Post.findByIdAndUpdate(postId, {
        $push: {likes: loginUserID},
        isLiked: true,
       },
        {new : true}
       );
       res.json(post);
    }
});


// Dislike Post Controller 

const toggleDislikeAddToPostCtlr = expressAsyncHandler(async(req, res) => {
  //1. Find the post to be disliked
  const { postId } = req.body;
  const post = await Post.findById(postId);

   // Find The Login User 

   const loginUserID = req?.user?._id;

   //Check if the User already dislike

   const isDislike =  post?.isDisLiked;

   // Check if the User  already like the post

   const alreadyliked = post?.likes?.find(usersId => usersId.toString() === loginUserID.toString());

   //Remove this user If allready like
   if(alreadyliked){

     const post = await Post.findOneAndUpdate(postId, {
      $pull: {likes: loginUserID},
      isLiked: false
     },
      {new : true}
     );

     res.json(post)
   }
  
   //Remove the user from dislike if allready disliked

   if(isDislike){
    const post = await Post.findByIdAndUpdate(postId, {
      $pull: {disLikes: loginUserID},
      isDisLiked: false
    },{ new: true}
    
    );

    res.json(post)
   }else{
    
     const post = await Post.findByIdAndUpdate(postId, {  

      $push: {disLikes: loginUserID},
      isDisLiked: true,

     },
     {new : true}
     );

     res.json(post)
   }
 

});

module.exports = {createPostCtlr, fetchPostCtlr, fetchSinglePostCtlr, updatePostCtlr, deletePostCtlr, toggleLikeAddToPostCtlr, toggleDislikeAddToPostCtlr};