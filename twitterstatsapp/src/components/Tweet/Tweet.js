import React, { Component } from "react";
import "./tweet.css";
export default class Tweet extends Component {
  renderImgs(tweet) {
    if (tweet.extended_entities) {
      if (tweet.extended_entities.media) {
        return (
          <div className="media">
            {tweet.extended_entities.media.map(
              (media, index) => {
                var maxWidth = 260;
                var maxHeight = 260;
                var ratio = 0;
                var width = media.sizes.large.w;
                var height = media.sizes.large.h;

                if (width > maxWidth) {
                  ratio = maxWidth / width;
                  height = height * ratio;
                  width = width * ratio;
                }

                if (height > maxHeight) {
                  ratio = maxHeight / height;

                  width = width * ratio;
                  height = height * ratio;
                }

                return (
                  <img
                    width={width}
                    height={height}
                    key={index}
                    src={media.media_url}
                    alt={index}
                  />
                );
              }
            )}
          </div>
        );
      }
    }

    return null;
  }
  render() {
    let tweet = this.props.tweet;
    return (
      <div className="Tweet">
        <div className="user">
          <img
            alt={tweet.user.name}
            src={tweet.user.profile_image_url}
          />
          <div>
            <div className="userfullname">
              {tweet.user.name}
            </div>
            <div className="username">
              @{tweet.user.screen_name}
            </div>
          </div>
        </div>
        <div className="tweettext">
          {tweet.text}
        </div>
        {this.renderImgs(tweet)}
      </div>
    );
  }
}
