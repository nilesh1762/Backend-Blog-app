const express = require('express');
const {createCommentCtlr, fetchAllCommentCtlr, fetchSingleCommentCtlr, updateCommentCtlr, deleteCommentCtlr} = require('../../Controller/Comment/CommentController');
const authMiddleware = require('../../Middleware/Auth/AuthMiddleware');
const CommentRoutes = express.Router();


CommentRoutes.post('/',authMiddleware, createCommentCtlr);

CommentRoutes.get('/',authMiddleware, fetchAllCommentCtlr);

CommentRoutes.get('/:id',authMiddleware, fetchSingleCommentCtlr);

CommentRoutes.put('/:id',authMiddleware, updateCommentCtlr);

CommentRoutes.delete('/:id',authMiddleware, deleteCommentCtlr);

module.exports = CommentRoutes;