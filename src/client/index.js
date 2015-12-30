'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';

var fbAppId = '1120226921328810';
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

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

function xhr(url, method='GET', data={}, contentLength=0) {
  return new Promise(function(resolve, reject) {
    console.log(`Grabbing: ${url}`);
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (ajax.readyState != XMLHttpRequest.DONE) return;
      if (ajax.status != 200) {
        reject(ajax);
        return;
      }
      resolve(ajax);
    };

    ajax.open(method, url, true);

    ajax.send(data);
  });
}

class PPOverlay extends React.Component {
  state = {
    file: null,
    accessToken: null,
    userID: null
  };

  constructor(props) { super(props); };

  render() {
    let preview;
    if (this.state.file) {
      preview = (
        <div>
          <div>
            <a id="download" target="_blank" href="#">Download image</a>
            <button id="fb" onClick={this.fbUploadPic}>Upload Facebook Pic</button>
          </div>
          <canvas id="preview"></canvas>
        </div>
      );
    }

    return (
      <div>
        <button id="fb" onClick={this.fbGetPP}>Get Facebook Profile Pic</button>
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

      if (this.state.file) {
        this.loadImage(this.state.file);
      }
    });
  };

  fbGetPP = () => {
    var options = {
      scope: 'publish_actions'
    };

    FB.login(resp => {
      console.log(resp);

      FB.api('/me/picture?width=576&height=576', me => {
        console.log(me);
        this.setState({
          file: me.data.url,
          accessToken: resp.authResponse.accessToken,
          userID: resp.authResponse.userID
        });
      });
    }, options);
  };

  fbUploadPic = () => {
    FB.api('/me/albums', albums => {
      console.log(albums);

      let albumId;
      for (let i = 0; i < albums.data.length; i++) {
        let album = albums.data[i];
        if (album.name != 'Profile Pictures') continue;

        albumId = album.id;
        break;
      }

      if (albumId) {
        let canvas = document.getElementById('preview');

        let imgData = canvas.toDataURL('image/jpeg');
        imgData = dataURItoBlob(imgData);

        var formData = new FormData();
        formData.append('source', imgData);
        formData.append('message', 'Spartan Overlay');

        let fbUrl = `https://graph.facebook.com/${this.state.userID}/photos?access_token=${this.state.accessToken}`;

        xhr(fbUrl, 'POST', formData, imgData.length)
          .then(resp => { console.log(JSON.parse(resp.response)); })
          .catch(e => { console.log(JSON.parse(e.response)); });
      }
    });
  };

  onDrop = (files) => {
    console.log('Received files: ', files);
    if (files.length > 0) this.setState({ file: files[0].preview });
  };

  loadImage(imgSrc) {
    let dl = document.getElementById('download');
    let canvas = document.getElementById('preview');
    let ctx = canvas.getContext('2d');

    let spartanImg = new Image();
    spartanImg.setAttribute('crossOrigin', 'anonymous');
    let profileImg = new Image();
    profileImg.setAttribute('crossOrigin', 'anonymous');

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

