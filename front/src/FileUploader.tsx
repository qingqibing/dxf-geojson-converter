import React from "react";
import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

const API_URL = "http://localhost:8081/dxf";
class FileUploader extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      // Set initial files, type 'local' means this is a file
      // that has already been uploaded to the server (see docs)
      files: []
    };
  }

  handleChange(file: any) {
    const { setDxfId } = this.props;
    var data = new FormData();
    data.append("dxf", file[0]);

    fetch(API_URL, {
      method: "POST",
      body: data
    })
      .then(response => response.json())
      .then((d: any) => setDxfId(d.id))
      .catch(d => console.log("Error", d));
  }

  render() {
    return (
      <div className="App">
        <form>
          <input
            className="uploadInput"
            type="file"
            onChange={e => this.handleChange(e.target.files)}
          />
        </form>
      </div>
    );
  }
}

export default FileUploader;
