import React, { PureComponent } from "react";
//import classNames from "classnames";
import { HttpUrl } from "./Url";
import Icon from "./Icon";
import { labelStyle } from "./styles";
import { viewStyle } from "./styles";
import err from "./MessageText";

const FullImage = ({ value, onClose }) => (
  <div
    onClick={onClose}
    style={{
      width: "100%",
      height: "100%",
      pointerEvents: "auto",
      userSelect: "auto",
      backgroundColor: "#333",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <img
      style={{
        width: "auto",
        height: "auto",
        maxWidth: "100vw",
        maxHeight: "100vh"
      }}
      src={value}
    />
  </div>
);

export default (onUpload, getThumbnail) =>
  class ImageView extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {};
    }
    static define = {
      model: "image",
      onUpload: onUpload,
      getThumbnailUrl: getThumbnail,
      verify: HttpUrl.define.verify
    };
    setProgressValue = (progress_value, progress_size, cb) => {
      if (typeof progress_value === "number") {
        progress_value = progress_value.toString();
      }
      if (typeof progress_value === "number") {
        progress_size = progress_size.toString();
      }
      this.setState(
        { progress_size: progress_size, progress: progress_value },
        cb
      );
    };
    uploadFile = e => {
      this.setProgressValue(undefined, 100);
      onUpload(e.target.files[0], this.setProgressValue)
        .then(v => {
          this.props.onChange(v);
          this.setProgressValue(null, null);
        })
        .catch(err => {
          let page = this.props.page;
          page.props.sendMessage(page.props.errorMessage[err] || err, "info");
          this.setProgressValue(null, null);
        });
    };
    render() {
      let label = this.props.label;
      let onChange = this.props.onChange;
      return (
        <div
          className="field"
          style={{
            ...viewStyle,
            borderWidth: Number(!this.props.noBorder),
            display: "flex",
            flexDirection: "column",
            gridRow: "span 3",
            height: "20em"
          }}
        >
          <div
            className="control"
            style={{
              pointerEvents: onChange ? null : "none",
              flex: "0 0 auto",
              zIndex: 2
            }}
          >
            {label ? (
              <label className="label" style={{ ...labelStyle }}>
                {label}
              </label>
            ) : null}
            {this.state.progress_size ? (
              <progress
                className="progress is-primary"
                value={this.state.progress}
                max={this.state.progress_size}
              />
            ) : onChange ? (
              <React.Fragment>
                <div className="control" style={{ display: "flex" }}>
                  <HttpUrl
                    placeholder={err.image_placeholder}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    verifyValue={this.props.verifyValue}
                    noBorder={true}
                    style={{ flex: "1 1 0" }}
                    lefticon="link"
                  />
                  {onUpload ? (
                    <span className="file">
                      <label className="file-label">
                        <input
                          className="file-input"
                          type="file"
                          onChange={this.uploadFile}
                        />
                        <span className="file-cta">
                          <span className="file-icon">
                            <i className="fas fa-upload" />
                          </span>
                          <span className="file-label">{err.upload}</span>
                        </span>
                      </label>
                    </span>
                  ) : null}
                </div>
              </React.Fragment>
            ) : null}
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 0
            }}
          >
            <img
              allowFullScreen={true}
              style={{
                display: "block",
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%"
              }}
              src={
                getThumbnail ? getThumbnail(this.props.value) : this.props.value
              }
              onClick={e => {
                let run = (methodname, element, isValue) => {
                  let action = ["", "webkit", "moz", "ms"]
                    .map(v => {
                      let method = methodname;
                      if (v.length > 0) {
                        method = method.replace(/^[a-z]/, v => v.toUpperCase());
                      }
                      let name = v + method;
                      if (v === "moz") {
                        name = name.replace("Fullscreen", "FullScreen");
                        name = name.replace("Exit", "Cancel");
                      }
                      return element[name];
                    })
                    .find(v => v !== undefined);
                  if (isValue) {
                    return action;
                  } else {
                    if (action) action.call(element);
                  }
                };
                if (run("fullscreenElement", document, true)) {
                  run("exitFullscreen", document);
                } else {
                  let el = e.target;
                  run("requestFullscreen", el);
                }
              }}
            />
          </div>
        </div>
      );
    }
  };
