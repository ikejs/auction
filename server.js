const socketio = require("socket.io");
const greenlock = require("greenlock-express");
const path = require("path");
const http = require('http');
require('dotenv').config({ path: ".env" });
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const PORT = 4000;

function onReady(server) {
  const io = socketio(server);

  // connect to db
  mongoose.connect(process.env.MONGODB_URI||"mongodb://localhost:27017/auction", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    console.log("database connected")
  });

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


  const sendConfirmationEmail = ({ bidder, bid, item, items }) => {  
    const msg = {
      to: bidder.email,
      from: 'auction@ike.dev',
      subject: 'Bid Confirmation - Radio Plus Auctions',
      templateId: 'd-782e9a81690d44b699a15c06d8ab542d',
      dynamicTemplateData: {
        bid,
        item,
        items: items.map((item) => ({
          ...item,
          highestBid: item.bids[item.bids.length - 1].amount
        }))
      }
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      })
      .catch((error) => {
        console.error(error)
    })
  }

  const sendOutbidEmail = ({ lastBidder, item, items }) => {
    const msg = {
      to: lastBidder.email,
      from: 'auction@ike.dev',
      subject: 'OUTBID - Radio Plus Auctions',
      templateId: 'd-d8db5855a62c4cefb5584edc78609177',
      dynamicTemplateData: {
        item: {
          ...item,
          highestBid: item.bids[item.bids.length - 1].amount
        },
        items: items.map((item) => ({
          ...item,
          highestBid: item.bids[item.bids.length - 1].amount
        }))
      }
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      })
      .catch((error) => {
        console.error(error)
    })
  }


  const createBid = (itemID, bidder, amount) => {
    const newBid = new Bid({
      bidder: ObjectId(bidder._id),
      amount
    });
    newBid.save().then(bid => {
      Item.findOne({ _id: ObjectId(itemID) }, (err, item) => {
        item.bids.push(ObjectId(bid._id));
        item.save().then(() => {
          Item.find({}, (err, items) => {
            io.emit("update", items)
            sendConfirmationEmail({ 
              bidder,
              bid,
              item,
              items
            })

            const lastBidID = item.bids.reverse()[1] || item.bids.reverse()[0]

            if (lastBidID) { // if someone has been outbid...
              
              Bid.findOne({_id: ObjectId(lastBidID)}, (err, lastBid) => {
                if (err) { return console.log(err) }
                const lastBidder = lastBid.bidder
                if (bidder._id.toString() != lastBidder?._id.toString()) {
                  sendOutbidEmail({
                    lastBidder,
                    item,
                    items
                  })
                }
              }).populate('bidder');
            }
          }).populate({ 
              path: 'bids',
              populate: {
                path: 'bidder',
                model: 'User'
              }
            }).lean()
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
  
      // if ((user.email === null) || (user.email == "")) {
      //   return client.emit("err", { msg: "Error! Please refresh and try again." })
      // }
  
  
      // User.findOne({ email: user.email }, (err, existingUser) => {
      //   if (!existingUser) {
      //     const newUser = new User(user);
      //     newUser.save().then((bidder) => {
      //       createBid(itemID, bidder, amount);
      //     }).catch(err=>{ if(err) return console.log(err) });
      //   } else {
      //     createBid(itemID, existingUser, amount);
      //   }
      // });

      console.log('bidding is closed')
    });
  });

}


if (process.env.NODE_ENV === 'production') {
  const greenlockServer = greenlock.init({
    packageRoot: __dirname,
    configDir: "./greenlock.d",
    maintainerEmail: "ike@holzmann.io",
    cluster: false
  })

  greenlockServer.ready((glx) => {
    const httpsServer = glx.httpsServer();
    onReady(httpsServer);
  }).serve(app);
} else {
  const server = http.createServer(app);
  onReady(server)
  server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}