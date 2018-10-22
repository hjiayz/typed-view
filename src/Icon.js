import React, { Component } from "react";
import classNames from "classnames";

export default class extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let cclass = classNames({
      icon: true,
      [`is-${this.props.csize}`]: !!this.props.csize,
      "is-left": !!this.props.left,
      "is-right": !!this.props.right
    });
    let iclass = classNames({
      fas: true,
      "fa-pulse": !!this.props.animated,
      "fa-border": !!this.props.bordered,
      "fa-fw": !!this.props.fixed_width,
      [`fa-${this.props.isize}`]: !!this.props.isize,
      [`fa-${this.props.icon}`]: true,
      [`has-text-${this.props.color}`]: !!this.props.color,
      [`data-fa-transform="flip-${this.props.flip}"`]: !!this.props.flip,
      [`data-fa-transform="rotate-${this.props.rotate}"`]: !!this.props.rotate
    });
    return (
      <span
        className={cclass}
        style={{
          ...(!!this.props.onClick ? { pointerEvents: "auto" } : null),
          ...this.props.style
        }}
        onClick={this.props.onClick}
      >
        <i className={iclass} />
      </span>
    );
  }
}
