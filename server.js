const path = require("path");
require('dotenv').config({ path: ".env" });
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;

require("greenlock-express")
    .init({
        packageRoot: __dirname,
        configDir: "./greenlock.d",
        maintainerEmail: "ike@holzmann.io",
        cluster: false
    }).serve(app); // listen on 80 & 443

// connect to db
mongoose.connect(process.env.MONGODB_URI||"mongodb://localhost:27017/auction", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("database connected")
});

// using webpack-dev-server and middleware in development environment
if (process.env.NODE_ENV !== "production") {
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  const webpack = require("webpack");
  const config = require("./webpack.config");
  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "public")));

const User = require('./models/User');
const Item = require('./models/Item');
const Bid = require('./models/Bid');

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/dist/index.html")
});

app.get("/stats", (req, res) => {
  Item.find({}, (err, items) => res.json(items));
});


const createBid = (itemID, bidder, amount) => {
  const newBid = new Bid({
    bidder: ObjectId(bidder._id),
    amount
  });
  newBid.save().then(bid => {
    Item.findOne({ _id: ObjectId(itemID) }, (err, item) => {
      item.bids.push(ObjectId(bid._id));
      item.save().then(() => {
        Item.find({}, (err, items) => io.emit("update", items))
          .populate({ 
            path: 'bids',
            populate: {
              path: 'bidder',
              model: 'User'
            }
          });
      });
    }).catch(err=>{ if(err) return console.log(err) });
  });
}

io.on("connection", function(client) {

  Item.find({}, (err, items) => client.emit("update", items))
    .populate({ 
      path: 'bids',
      populate: {
        path: 'bidder',
        model: 'User'
      } 
   });


  client.on("bid", function({ user, itemID, amount }) {

    if ((user.email === null) || (user.email == "")) {
      return client.emit("err", { msg: "Error! Please refresh and try again." })
    }


    User.findOne({ email: user.email }, (err, existingUser) => {
      if (!existingUser) {
        const newUser = new User(user);
        newUser.save().then((bidder) => {
          createBid(itemID, bidder, amount);
        }).catch(err=>{ if(err) return console.log(err) });
      } else {
        createBid(itemID, existingUser, amount);
      }
    });

  });


});

server.listen(PORT, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  }
});
