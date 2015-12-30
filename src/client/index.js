'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';

var fbAppId = '1120226921328810';
//var fbAppId = '1120235647994604';
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

/*function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}*/

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
        this.setState({ file: me.data.url });
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

        let imgData = canvas.toDataURL();
        imgData = dataURItoBlob(imgData);

        var formData = new FormData();
        formData.append('source', imgData);
        formData.append('message', 'Spartan');

        console.log(imgData);
        FB.api(`/${albumId}/photos`, 'POST', formData, resp => { console.log(resp); });
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

