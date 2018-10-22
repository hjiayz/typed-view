import React, { PureComponent } from "react";
import Icon from "./Icon";
export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  alert(message, onOk) {
    this.setState({ message, onOk });
  }
  render() {
    return (
      <div className={"modal" + (!!this.state.message ? " is-active" : "")}>
        <div className="modal-background" />
        <div
          className="modal-content"
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div
            className="box"
            style={{
              display: "flex",
              minWidth: "60%",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center"
              }}
            >
              <span className={"icon has-text-info"}>
                <i className="fas fa-info-circle" />
              </span>
              <span>{this.state.message}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around"
              }}
            >
              <a
                style={{
                  flex: 1,
                  minWidth: 0
                }}
                className="button is-white"
                onClick={_ => {
                  this.setState({ message: null, onOk: null });
                  this.state.onOk();
                }}
              >
                <span className={"icon has-text-danger"}>
                  <i className="fas fa-check fa-2x" />
                </span>
              </a>
              <a
                style={{
                  minWidth: 0,
                  flex: 1
                }}
                className="button is-white"
                onClick={_ => this.setState({ message: null, onOk: null })}
              >
                <span className={"icon"}>
                  <i className="fas fa-times fa-2x" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
