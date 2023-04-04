const mongoose = require("mongoose");

const CommentpostSchema = new mongoose.Schema(
  {

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "Post is required."],
    },

    user: {
        type: Object,
        required: [true, "User is required."],
    },

    description: {
        type: String,
        required: [true, "Comment discription is required."],
    },
  },
  { timestamps: true},
    
);


//compile
const Comment = mongoose.model("Comment", CommentpostSchema);

module.exports = Comment;