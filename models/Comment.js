//required variables/constants
const mongoose = require("mongoose");
//create schema class
const Schema = mongoose.Schema;

//create comment schema
const CommentSchema = new Schema({
  name: {
    type: String
  },
  body: {
    type: String,
    required: true
  }
});

//create Comment model with CommentSchema
const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;