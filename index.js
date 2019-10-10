const CONFIG = require("./appConfig.json");
let isReTweetAllowed = CONFIG.allowReTweets;
let resetPassword = CONFIG.resetPassword;
let fs = require("fs");
var express = require("express");
var cors = require("cors");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var Twitter = require("twitter");
app.use(cors());
app.use(
  express.static("./twitterstatsapp/build")
);

let hashtag = CONFIG.hashTags;
let stragePath = "./storage/storage.json";
let usersPath = "./storage/users.json";
let storageData = JSON.parse(
  fs.readFileSync(stragePath).toString()
);

let usersData = JSON.parse(
  fs.readFileSync(usersPath).toString()
);

var client = new Twitter(
  require("./twitterConfig.json")
);

console.log(
  storageData.length,
  "preloaded tweets"
);
console.log(
  Object.keys(usersData).length,
  "preloaded users"
);
let storageQ = [];

app.get("/tweets", (req, res) => {
  res.send({
    tweets: storageData.slice(
      Math.max(storageData.length - 10, 0)
    ),
    users: usersData,
    totalTweets: storageData.length
  });
});

app.get("/reset/" + resetPassword, (req, res) => {
  storageData = [];
  usersData = {};
  fs.writeFile(stragePath, JSON.stringify([]));
  res.send({
    status: true,
    msg: "all data has been reset"
  });
});

app.get("/allowRetweet/:params", (req, res) => {
  isReTweetAllowed =
    req.params.params == "yes" ? true : false;
  res.send({
    status: true,
    msg: "Retweet set to " + isReTweetAllowed
  });
});

app.get("/retweetStatus", (req, res) => {
  res.send({
    status: true,
    msg: "Retweet = " + isReTweetAllowed
  });
});

app.get("/reloadAll", (req, res) => {
  io.to("commands").emit("reload", {
    status: true
  });
  res.send({
    status: true,
    msg: "Reloading All Browsers"
  });
});

io.on("connection", function(socket) {
  console.log("a user connected");
  socket.join("tweets");
  socket.join("commands");
});

http.listen(CONFIG.PORT, function() {
  console.log("listening on *:" + CONFIG.PORT);
});

client.stream(
  "statuses/filter",
  { track: hashtag },
  function(stream) {
    stream.on("data", function(event) {
      //console.log(event);
      if (
        event.text[0] === "R" &&
        event.text[1] === "T" &&
        event.text[2] === " "
      ) {
        if (!isReTweetAllowed) return;
      }
      if (event.user.id_str in usersData) {
        usersData[event.user.id_str]
          .totalTweets++;
      } else {
        event.user.totalTweets = 1;
        usersData[event.user.id_str] = event.user;
      }
      io.to("tweets").emit("tweet", event);
      storageQ.push(event);
    });

    stream.on("error", function(error) {
      console.log(error);
      throw error;
    });
  }
);

let StorageLoop = () => {
  setTimeout(() => {
    if (storageQ.length) {
      console.log(
        storageQ.length,
        "new tweets to be store"
      );

      storageData = [...storageData, ...storageQ];
      storageQ = [];
      fs.writeFile(
        stragePath,
        JSON.stringify(storageData),
        (e, d) => {
          if (!e) {
            console.log(
              storageData.length,
              "Total Stored Tweets"
            );
          }
          StorageLoop();
        }
      );
    } else {
      StorageLoop();
    }
  }, 5000);
};

StorageLoop();
// Storage Queue

let StoreUserDetails = () => {
  setTimeout(() => {
    fs.writeFile(
      usersPath,
      JSON.stringify(usersData),
      (e, d) => {
        if (!e) {
          console.log("Users Details Stored");
        }
        StoreUserDetails();
      }
    );
  }, 5000);
};
StoreUserDetails();
//Storing Users
