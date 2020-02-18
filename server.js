//required variables/constants
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const logger = require("morgan");
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const routes = require("./controller/controller.js");
const port = process.env.PORT || 3000;

// app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

//make public a static dir
app.use(express.static(process.cwd() + "/public"));

//Initialize Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//connecting to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/scraper_news";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to Mongoose!");
});

//Routing
app.use("/", routes);

//Listening
app.listen(port, function () {
  console.log("Listening on PORT " + port);
});