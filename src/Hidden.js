import React, { PureComponent } from "react";
export default Comp => {
  return class Option extends PureComponent {
    constructor(props) {
      super(props);
    }
    static define = Object.assign({ hidden: true }, Comp.define);
    render() {
      return null;
    }
  };
};
