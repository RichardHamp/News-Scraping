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

var exphbs=require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on port " + port);
});
