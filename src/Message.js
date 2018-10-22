import React, { PureComponent } from "react";

export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
    this.tag = 0;
    this.nums = 0;
    this.stop = 0;
  }
  sendMessage(message, type) {
    this.tag++;
    if (typeof message !== "string" || message === "") return;
    this.nums++;
    if (this.nums === 1) this.removeMessage();
    this.setState(p => ({
      messages: p.messages.concat({
        message: message,
        type: type,
        tag: this.tag
      })
    }));
  }
  removeMessage() {
    setTimeout(() => {
      if (this.stop > 0) {
        this.stop--;
        return;
      }
      this.setState(
        p => ({ messages: p.messages.filter((v, i) => i !== 0) }),
        _ => {
          this.nums--;
          if (this.nums > 0) {
            this.removeMessage();
          }
        }
      );
    }, this.props.timeout);
  }
  removeAll() {
    this.setState(
      p => ({
        messages: []
      }),
      _ => {
        this.nums = 0;
      }
    );
  }
  render() {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 0,
          height: "50%",
          width: "100%",
          pointerEvents: "none",
          userSelect: "none",
          overflow: "hidden",
          zIndex: 150
        }}
      >
        {this.state.messages.concat({ tag: this.tag + 1 }).map((v, i) => {
          if (!v.message) {
            return (
              <div
                key={v.tag}
                style={{
                  position: "absolute",
                  width: "100%",
                  top: "100em",
                  textAlign: "center",
                  opacity: 0,
                  transition: "all 0.4s"
                }}
              >
                {}
              </div>
            );
          }
          return (
            <div
              style={{
                position: "absolute",
                width: "100%",
                top: `${i * 3}em`,
                textAlign: "center",
                transition: "all 0.6s",
                transform: "rotate(7200deg)"
              }}
              key={v.tag}
            >
              <div
                className="button"
                style={{
                  display: "flow",
                  boxShadow: "0px 5px 15px #888",
                  pointerEvents: "auto",
                  borderColor: "#dbdbdb"
                }}
                onClick={e => {
                  e.preventDefault();
                  this.stop++;
                  this.setState(
                    p => ({
                      messages: p.messages.filter((v, id) => id !== i)
                    }),
                    _ => this.removeMessage()
                  );
                }}
              >
                <span className={"icon has-text-" + v.type}>
                  <i className="fas fa-info-circle" />
                </span>
                <span>{v.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
