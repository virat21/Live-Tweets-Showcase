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

let hashtag =
  "#devfest19,#gdgrajkot,#devfestrajkot,#wtmrajkot";
let stragePath = "./storage/storage.json";
let storageData = JSON.parse(
  fs.readFileSync(stragePath).toString()
);

var client = new Twitter(
  require("./twitterConfig.json")
);

console.log(storageData.length, "preload tweets");
let storageQ = [];

app.get("/tweets", (req, res) => {
  res.send(storageData);
});

io.on("connection", function(socket) {
  console.log("a user connected");
  socket.join("tweets");
});

http.listen(3001, function() {
  console.log("listening on *:3001");
});

client.stream(
  "statuses/filter",
  { track: hashtag },
  function(stream) {
    stream.on("data", function(event) {
      //console.log(event);
      if (
        event.text[0] === "R" &&
        event.text[1] === "T"
      ) {
        // this prevent retweeted from counts
        return;
      }
      io.to("tweets").emit("tweet", event);
      storageQ.push(event);
    });

    stream.on("error", function(error) {
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
