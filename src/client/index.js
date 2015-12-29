'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';

//var fbAppId = '1120226921328810';
var fbAppId = '1120235647994604';
// facebook init
window.fbAsyncInit = function() {
  FB.init({
    appId      : fbAppId,
    xfbml      : true,
    version    : 'v2.5'
  });
};

loadFacebookAPI(document, 'script', 'facebook-jssdk');

// load facebook api
function loadFacebookAPI(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;

  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";

  fjs.parentNode.insertBefore(js, fjs);
}

class PPOverlay extends React.Component {
  state = {
    file: null
  };

  constructor(props) { super(props); };

  render() {
    let preview;
    if (this.state.file) {
      preview = (
        <div>
          <div>
            <a id="download" target="_blank" href="#">Download image</a>
            <button id="fb" onClick={this.fbLogin}>Upload to Facebook</button>
          </div>
          <canvas id="preview"></canvas>
        </div>
      );
    }

    return (
      <div>
        <Dropzone onDrop={this.onDrop} multiple={false}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>

        {preview}
      </div>
    );
  };

  componentDidUpdate = () => {
    // wait for render to actually draw elements to DOM
    // http://stackoverflow.com/a/28748160/1713216
    window.requestAnimationFrame(() => {
      let node = ReactDOM.findDOMNode(this);
      if (!node) return;

      this.loadImage(this.state.file.preview);
    });
  };

  fbLogin = () => {
    var options = {
      scope: 'publish_actions'
    };

    FB.login(resp => {
      console.log(resp);
    }, options);
  };

  onDrop = (files) => {
    console.log('Received files: ', files);
    if (files.length > 0) this.setState({ file: files[0] });
  };

  loadImage(imgSrc) {
    let dl = document.getElementById('download');
    let canvas = document.getElementById('preview');
    let ctx = canvas.getContext('2d');

    let spartanImg = new Image();
    let profileImg = new Image();

    profileImg.onload = function() {
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(profileImg, 0, 0);

      ctx.globalAlpha = 0.7;
      spartanImg.onload = () => { ctx.drawImage(spartanImg, 0, 0, this.width, this.height); };
      spartanImg.src = '/images/michigan-state-spartans-logo.png';
    };
    profileImg.src = imgSrc;

    dl.addEventListener('click', function() {
      this.href = canvas.toDataURL('image/jpeg');
    }, false);
  }
}

ReactDOM.render(
  <PPOverlay />,
  document.getElementById('pp-overlay')
);

