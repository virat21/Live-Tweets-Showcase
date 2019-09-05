import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import Tweet from "../Tweet/Tweet";
export default class LiveTweets extends Component {
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({
      behavior: "auto"
    });
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }
  render() {
    return (
      <div className="tweetsScroll">
        <ReactCSSTransitionGroup
          transitionName="livetweet"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {this.props.data.map((tweet, index) => {
            return (
              <Tweet
                key={tweet.id_str}
                tweet={tweet}
              />
            );
          })}
          <div
            ref={el => {
              this.messagesEnd = el;
            }}
          />
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
