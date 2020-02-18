//Required constants
const express = require("express");
const router = express.Router();
const path = require("path");
const Comment = require("../models/Comment.js");
const Article = require("../models/Article.js");
const request = require("request");
const cheerio = require("cheerio");

//html routes
router.get("/", function (req, res) {
  Article.find({})
    .populate("comments")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        console.log("all article with comments: " + doc);
        res.render("index", { articles: doc });
      }
    })
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

      // if (result.title !== "" && result.link !== "") {
      //   if (titlesArray.indexOf(result.title) == -1) {
      //     titlesArray.push(result.title);

      //     Article.count({ title: result.title }, function(err, test) {
      //       if (test === 0) {

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
      // }
    });
    //     } else {
    //       console.log("Article already exists.");
    //     }
    //   } else {
    //     console.log("Not saved to DB, missing data");
    //   }

    // });
    console.log("******************TITLES***********" + titlesArray)
    res.redirect("/");
  });
});

//Gets articles scraped to database
router.get("/articles", function (req, res) {
  // Article.find()
  Article.findOne({}).exec(function (err, doc) {
    if (err) {
      console.log(err)
    } else {
      res.json(doc);
    }
  })
  // .sort({ _id: -1 })
  // .exec(function(err, doc) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     var artcl = { article: doc };
  //     res.render("index", artcl);
  //   }
  // });
});

//shows JSON object for each article
router.get("/articles-json", function (req, res) {
  Article.find({}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
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
        request(link, function (error, response, html) {
          const $ = cheerio.load(html);

          $(".feature-wrapper").each(function (i, element) {
            hbsObj.body = $(this)
              .children(".body-copy")
              .children("p")
              .text();

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