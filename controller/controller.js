//Required constants
const express = require("express");
const router = express.Router();
const path = require("path");
const Comment = require("../models/Comment.js");
const Article = require("../models/Article.js");
const request = require("request");
const cheerio = require("cheerio");

//index
router.get('/', function(req, res) {
  res.redirect('/articles');
});

//Article Routes
router.get("/scrape", function (req, res) {
  request("https://www.dailycamera.com/", function (error, response, html) {
    const $ = cheerio.load(html);
    var titlesArray = [];
    console.log("scraping");
    $("h6").each(function (i, element) {
      //save into array
      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      if (result.title !== "" && result.link !== "") {
        if (titlesArray.indexOf(result.title) == -1) {
          titlesArray.push(result.title);

          Article.count({ title: result.title }, function(err, test) {
            if (test === 0) {

      //creates new entry with Article model
      const entry = new Article(result);
      //saves entry to database
      entry.save(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });
      }
    });
        } else {
          console.log("Article already exists.");
        }
      } else {
        console.log("Not saved to DB, missing data");
      }

    });
    res.redirect("/");
  });
});

//Gets articles scraped to database
router.get('/articles', function(req, res) {
  //allows newer articles to be on top
  Article.find().sort({_id: -1})
      //send to handlebars
      .exec(function(err, doc) {
          if(err){
              console.log(err);
          } else{
              var artcl = {article: doc};
              res.render('index', artcl);
          }
  });
});

//removes all articles
router.get("/clearAll", function (req, res) {
  Article.remove({}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("removed all articles");
    }
  });
  res.redirect("/");
});

//Grab article by object id
router.get("/readArticle/:id", function (req, res) {
  const articleId = req.params.id;
  var hbsObj = {
    article: [],
    body: []
  };

  Article.findOne({ _id: articleId })
    .populate("comment")
    .exec(function (err, doc) {
      if (err) {
        console.log("Error: " + err);
      } else {
        hbsObj.article = doc;
        const link = doc.link;
        console.log("Link (controller 102): " + link);
        request(link, function (error, response, html) {
          const $ = cheerio.load(html);
          $(".article-body").each(function (i, element) {
            hbsObj.body = $(this).children(".body-copy").children("p").text();
            console.log("Body (controller 107): " + hbsObj.body)
            res.render("article", hbsObj);
            return false;
          });
        });
      }
    });
});

//Create a new comment
router.post("/comment/:id", function (req, res) {
  const user = req.body.name;
  const content = req.body.comment;
  const articleId = req.params.id;
  const commentObj = {
    name: user,
    body: content
  };
  const newComment = new Comment(commentObj);

  newComment.save(function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log(doc._id);
      console.log(articleId);
      Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: doc._id } },
        { new: true }
      ).exec(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/readArticle/" + articleId);
        }
      });
    }
  });
});

module.exports = router;