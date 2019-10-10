import React, { Component } from "react";
import "./tweet.css";
export default class Tweet extends Component {
  renderVideo(media) {
    var maxWidth = 260;
    var maxHeight = 260;
    var ratio = 0;
    var width = media.aspect_ratio[0];
    var height = media.aspect_ratio[1];

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
    let video = media.variants[0];
    if (!video) return null;

    return (
      <video
        autoPlay
        muted
        loop
        width={width}
        height={height}
      >
        <source
          src={video.url}
          type="video/mp4"
        />
      </video>
    );
  }

  renderImage(media) {
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
        src={media.media_url}
        alt="some alt"
      />
    );
  }
  renderMedia(tweet) {
    if (tweet.extended_entities) {
      if (tweet.extended_entities.media) {
        if (
          tweet.extended_entities.media.length
        ) {
          let media =
            tweet.extended_entities.media[0];
          let hasVideo = "video_info" in media;
          return (
            <div className="media">
              {hasVideo
                ? this.renderVideo(
                    media.video_info
                  )
                : this.renderImage(media)}
            </div>
          );
        }
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
        {this.renderMedia(tweet)}
      </div>
    );
  }
}
