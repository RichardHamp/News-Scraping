var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();
var logger = require("morgan")

app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended:false
    })
);

app.use(express.static(process.cwd() + "/public"));

var exphbs=require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/scraped_news");
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function(){
    console.log("Connected to Mongoose!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on port " + port);
});
