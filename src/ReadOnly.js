import React, { Component } from "react";
export default Comp => {
  return class ReadOnly extends Component {
    constructor(props) {
      super(props);
    }
    static define = Object.assign({ readOnly: true }, Comp.define);
    render() {
      let { onChange, ...props } = this.props;
      return <Comp {...props} />;
    }
  };
};
