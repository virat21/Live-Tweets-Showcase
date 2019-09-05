import React, { Component } from "react";

export default class TopUsers extends Component {
  render() {
    return (
      <div className="TopUsers">
        {Object.keys(this.props.data)
          .map((userid, index) => {
            return this.props.data[userid];
          })
          .sort(function(a, b) {
            return b.totalTweets - a.totalTweets;
          })
          .slice(0, 5)
          .map((user, index) => (
            <div
              key={user.id_str}
              className="user"
            >
              <img
                src={user.profile_image_url}
                alt={user.name}
              />
              <div className="userfullname">
                {user.name}
              </div>
              <div className="username">
                @{user.screen_name}
              </div>
              <div className="usertotaltweet">
                {user.totalTweets}
              </div>
            </div>
          ))}
      </div>
    );
  }
}
