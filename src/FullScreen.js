import React, { PureComponent } from "react";

export default class extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    if (!this.props.component) return null;
    return (
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          pointerEvents: "none",
          userSelect: "none",
          overflow: "hidden",
          zIndex: 99,
          transform: "translateZ(0)"
        }}
      >
        <this.props.component
          value={this.props.value}
          onClose={this.props.hidden}
        />
      </div>
    );
  }
}
