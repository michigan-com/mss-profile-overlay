'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';

class PPOverlay extends React.Component {
  state = {
    file: null
  };

  constructor(props) { super(props); };

  render() {

    let preview;
    if (this.state.file) {
      preview = <div><img src={this.state.file.preview} /></div>;
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

  onDrop = (files) => {
    console.log('Received files: ', files);
    if (files.length > 0) this.setState({ file: files[0] });
  };
}

ReactDOM.render(
  <PPOverlay />,
  document.getElementById('pp-overlay')
);
