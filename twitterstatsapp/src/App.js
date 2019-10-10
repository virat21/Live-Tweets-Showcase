import React from "react";

import "./App.css";
import io from "socket.io-client";
import LiveTweets from "./components/LiveTweets/LiveTweets";
import TopUsers from "./components/TopUsers/TopUsers";
import bg from "./bg.png";

let SERVER_URL = "http://localhost:3001";

export let socket = io(SERVER_URL);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: [],
      users: {},
      totalTweets: 0
    };

    this.loadTweets = [];

    this.listenTweets = this.listenTweets.bind(
      this
    );

    this.listenCommands = this.listenCommands.bind(
      this
    );

    this.bulkLoadTweets = this.bulkLoadTweets.bind(
      this
    );
  }

  bulkLoadTweets() {
    if (this.loadTweets.length) {
      console.log(
        "adding tweets",
        this.loadTweets.length
      );
      let _tweets = [...this.loadTweets];
      this.loadTweets = [];
      this.setState(
        s => {
          _tweets.map((d, i) => {
            if (d.user.id_str in s.users) {
              s.users[d.user.id_str]
                .totalTweets++;
            } else {
              d.user.totalTweets = 1;
              s.users[d.user.id_str] = d.user;
            }
          });

          _tweets.map(d => {
            s.tweets.push(d);
          });
          return {
            tweets: s.tweets,
            users: s.users
          };
        },
        () => {
          setTimeout(() => {
            this.bulkLoadTweets();
          }, 200);
        }
      );
    } else {
      //  console.log("no tweets");
      setTimeout(() => {
        this.bulkLoadTweets();
      }, 100);
    }
  }

  listenTweets() {
    socket.on("tweet", e => {
      this.loadTweets.push(e);
    });
  }

  listenCommands() {
    socket.on("reload", e => {
      document.location.reload();
    });
  }

  componentDidMount() {
    fetch(`${SERVER_URL}/tweets`)
      .then(res => {
        res.json().then(data => {
          console.log(data, "data from api");

          this.setState(data, () => {
            console.log("tweets loaded tweets");
            this.bulkLoadTweets();
          });
        });
      })
      .catch(res => {
        console.log(res);
      });
    this.listenTweets();
    this.listenCommands();
  }

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <div className="left">
          <div>
            <div className="mtu">
              Most Tweeted Users
            </div>
            <TopUsers data={this.state.users} />
          </div>
          <div className="bg">
            <img src={bg} alt="bg" />
          </div>
        </div>
        <div className="right">
          <div className="totalNumber">
            Total Tweets{" "}
            {this.state.tweets.length +
              this.state.totalTweets}
          </div>
          <LiveTweets data={this.state.tweets} />
        </div>
      </div>
    );
  }
}

export default App;
