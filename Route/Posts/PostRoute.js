const express = require('express');
const {createPostCtlr, fetchPostCtlr, fetchSinglePostCtlr, updatePostCtlr, deletePostCtlr, toggleLikeAddToPostCtlr, toggleDislikeAddToPostCtlr} = require('../../Controller/Post/postController');
const authMiddleware = require('../../Middleware/Auth/AuthMiddleware');
const { PhotoUpload, postImgResize } = require('../../Middleware/Upload/PhotoUpload');
const postRoutes = express.Router();

postRoutes.post('/', authMiddleware, PhotoUpload.single("image"), postImgResize, createPostCtlr)

postRoutes.get('/',  fetchPostCtlr)

postRoutes.put('/likes', authMiddleware, toggleLikeAddToPostCtlr);

postRoutes.put('/dislikes', authMiddleware, toggleDislikeAddToPostCtlr);

postRoutes.get('/:id', fetchSinglePostCtlr)

postRoutes.put('/:id', authMiddleware, updatePostCtlr);

postRoutes.delete('/:id', authMiddleware, deletePostCtlr);

module.exports = postRoutes;