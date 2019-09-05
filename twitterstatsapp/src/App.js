import React from "react";

import "./App.css";
import io from "socket.io-client";
import LiveTweets from "./components/LiveTweets/LiveTweets";
import TopUsers from "./components/TopUsers/TopUsers";
import bg from "./bg.png";

let SERVER_URL = "example.com:3000";

export let socket = io(SERVER_URL);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: [],
      users: {}
    };

    this.loadTweets = [];

    this.listenTweets = this.listenTweets.bind(
      this
    );

    this.bulkLoadTweets = this.bulkLoadTweets.bind(
      this
    );
    this.oldTweets = 0;
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
              if (
                !(
                  d.text[0] === "R" &&
                  d.text[1] === "T"
                )
              ) {
                s.users[d.user.id_str]
                  .totalTweets++;
              }
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
      console.log("no tweets");
      setTimeout(() => {
        this.bulkLoadTweets();
      }, 100);
    }
  }

  listenTweets() {
    socket.on("tweet", e => {
      this.loadTweets.push(e);

      // this.setState(s => {
      //   // s.tweets = [e, ...s.tweets];
      //   s.tweets.push(e);
      //   //console.log(e);
      //   if (e.user.id_str in s.users) {
      //     s.users[e.user.id_str].totalTweets++;
      //   } else {
      //     e.user.totalTweets = 1;
      //     s.users[e.user.id_str] = e.user;
      //   }
      //   return {
      //     tweets: s.tweets,
      //     users: s.users
      //   };
      // });
    });
  }

  componentDidMount() {
    fetch(`${SERVER_URL}/tweets`)
      .then(res => {
        res.json().then(tweets => {
          console.log(tweets.length, "tweets");
          let users = {};
          tweets.map((d, i) => {
            if (d.user.id_str in users) {
              if (
                !(
                  d.text[0] === "R" &&
                  d.text[1] === "T"
                )
              )
                users[d.user.id_str]
                  .totalTweets++;
            } else {
              d.user.totalTweets = 1;
              users[d.user.id_str] = d.user;
            }
          });
          this.oldTweets = tweets.length;
          this.setState(
            { tweets: [], users },
            () => {
              console.log("load tweets");

              this.bulkLoadTweets();
            }
          );
        });
      })
      .catch(res => {
        console.log(res);
      });
    this.listenTweets();
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
              this.oldTweets}
          </div>
          <LiveTweets data={this.state.tweets} />
        </div>
      </div>
    );
  }
}

export default App;
