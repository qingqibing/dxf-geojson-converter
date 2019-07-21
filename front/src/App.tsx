import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Map from "./Map";
import FileUploader from "./FileUploader";
class App extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { dxfId } = this.state;
    return (
      <div className="App">
        {dxfId ? (
          <Map dxfId={dxfId} />
        ) : (
          <FileUploader setDxfId={dxfId => this.setState({ dxfId })} />
        )}
      </div>
    );
  }
}

export default App;
