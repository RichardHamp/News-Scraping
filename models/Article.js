//required variables/constants
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//creating article schema
const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  comment: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});
//creating Article model with ArticleSchema
const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;