import React, { PureComponent } from "react";
import { viewStyle, labelStyle } from "./styles";

const Infomation = View => {
  let define = {
    model: "infomation",
    verify: async () => true,
    default: undefined
  };
  return class extends PureComponent {
    constructor(props) {
      super(props);
    }
    static define = define;
    render() {
      return (
        <div style={viewStyle}>
          <label style={labelStyle}>{this.props.label}</label>
          <div style={{ margin: "0.25em" }}>
            <View {...this.props} />
          </div>
        </div>
      );
    }
  };
};

export { Infomation };
