const expressAsyncHandler = require('express-async-handler');

const Comment = require('../../Model/Comment/Comment');
const AppError = require('../../Utils/AppEroor');
const ValidateMongoDbId = require('../../Utils/ValidateMongoDbId');
//Create Comment

const createCommentCtlr = expressAsyncHandler(async(req, res) => {
 
  // Get the user
  const user = req.user;
  //Get the PostId
  const { postId, description } = req.body;
    console.log(`Comment: ${description}`);
  try{
      
    const comment = await Comment.create({

      post: postId,
      user,
      description
    })
    res.json(comment)
  }catch(error){
    res.json(error)
  }
 
});

//Fetch All Comments

const fetchAllCommentCtlr = expressAsyncHandler(async(req, res) => {

   try{
   
     const comment  = await Comment.find({}).sort("-created");
     res.json(comment)
   }catch(error){
    res.json(error)
   }

});

//Get Single Comment

const fetchSingleCommentCtlr = expressAsyncHandler(async(req, res) => {
    
  const { id } = req.params;
  ValidateMongoDbId(id)
  try{

    const comment = await Comment.findById(id);
    res.json(comment);

  }catch(error){
    res.json(error);
  }

});

//Update Comment

const updateCommentCtlr = expressAsyncHandler(async(req, res) => {
  
  const { id } = req.params;

  try{
    const update = await Comment.findByIdAndUpdate(id, 
      {
        post: req.body.postId,
        user: req.user,
        description: req.body.description

    },
    {
      
      new : true,
      runValidators: true
    },
    );
    
    res.json(update)
   
  }catch(error){

    res.json(error)
  }
 
});

const deleteCommentCtlr = expressAsyncHandler(async(req, res) => {

  const { id } = req.params;

  ValidateMongoDbId(id)
  try{
        
    const comment = await Comment.findByIdAndDelete(id)
    res.json(comment);
  }catch(error){

    res.json(error);
  }

});

module.exports = {createCommentCtlr, fetchAllCommentCtlr, fetchSingleCommentCtlr, updateCommentCtlr, deleteCommentCtlr};