import React, { PureComponent } from "react";
import classNames from "classnames";
import Icon from "./Icon";
import err from "./MessageText";
import { labelStyle } from "./styles";
import { viewStyle } from "./styles";
class TText extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.count = 0;
  }
  fromValue = value => {
    if (!!this.props.fromValue) return this.props.fromValue(value);
    if (typeof value === "string") return value;
    return "";
  };
  toChange = value => {
    if (!!this.props.toChange) return this.props.toChange(value);
    return value;
  };
  componentDidMount() {
    if (!!this.props.autoComplete) {
      this.autoComplete(this.props.value)
        .then(_ => null)
        .catch(_ => null);
    }
  }
  componentDidUpdate() {}
  autoComplete = async value => {
    let list = await this.props.autoComplete(value);
    return await new Promise((res, err) =>
      this.setState({ autoCompleteList: list }, res)
    );
  };
  onChange = e => {
    console.log("text props", this.props);
    this.count++;
    if (typeof this.props.onChange === "function") {
      let changevalue = this.toChange(e.target.value);
      console.log("text onchange value", changevalue);
      this.props.onChange(changevalue);
    }
    if (!!this.props.autoComplete) {
      this.autoComplete(e.target.value)
        .then(_ => null)
        .catch(_ => null);
    }
  };
  render() {
    let {
      type,
      onChange,
      lefticon,
      righticon,
      color,
      help,
      helpcolor,
      label,
      value,
      verify,
      fromValue,
      toChange,
      noBorder,
      autoComplete,
      verifyValue,
      page,
      ...props
    } = this.props;
    let readOnly = !onChange;
    let cclass = classNames({
      control: true,
      "has-icons-left": !!lefticon,
      "has-icons-right": !!righticon
    });
    let iclass = classNames({
      input: true,
      [`is-${this.props.color}`]: !!color,
      "is-static": readOnly
    });
    if (!help) {
      let myverify = (verifyValue || {}).data;
      if (myverify !== true) {
        help = myverify;
        helpcolor = "danger";
      }
    }
    return (
      <div
        className="field"
        style={
          this.props.style || { ...viewStyle, borderWidth: Number(!noBorder) }
        }
      >
        {label ? (
          <label className="label" style={labelStyle}>
            {label}
          </label>
        ) : null}
        <div className={cclass}>
          <input
            readOnly={readOnly}
            className={iclass}
            type={type || "text"}
            onChange={this.onChange}
            value={this.fromValue(value)}
            onFocus={e => {
              if (!readOnly && !!autoComplete) {
                this.setState({ autoComplete: true });
              }
            }}
            onBlur={e => {
              if (!readOnly && !!autoComplete) {
                this.setState({ autoComplete: false });
              }
            }}
            {...props}
          />
          {!!lefticon ? <Icon icon={lefticon} csize="small" left /> : null}
          {!!righticon ? <Icon icon={righticon} csize="small" right /> : null}
          <div
            className="box"
            onMouseDown={e => e.preventDefault()}
            style={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              position: "absolute",
              top: "100%",
              width: "100%",
              zIndex: 12,
              overflow: "hidden",
              display: this.state.autoComplete ? null : "none"
            }}
          >
            <div className="tags">
              {(this.state.autoCompleteList || []).map((v, i) => {
                return (
                  <span
                    key={i}
                    className={"tag"}
                    onClick={_ => {
                      this.onChange({ target: { value: v } });
                    }}
                  >
                    {v}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        {help ? (
          <p
            className={classNames({
              help: true,
              [`is-${helpcolor}`]: !!helpcolor
            })}
          >
            {help}
          </p>
        ) : null}
      </div>
    );
  }
}

let VText = (verify, type, fromValue, toChange, throttle, autoComplete) => {
  return class extends PureComponent {
    static define = {
      model: "input",
      verify: verify,
      type: type,
      fromValue: fromValue,
      toChange: toChange,
      default: toChange ? toChange("") : "",
      autoComplete: autoComplete
    };
    render() {
      return (
        <TText
          verify={verify}
          type={type}
          fromValue={fromValue}
          toChange={toChange}
          throttle={throttle || 2000}
          autoComplete={autoComplete}
          {...this.props}
        />
      );
    }
  };
};

let Phone = (verify, fromValue, toChange, throttle) =>
  VText(verify, "phone", fromValue, toChange, throttle);

let Email = (verify, fromValue, toChange, throttle) =>
  VText(verify, "email", fromValue, toChange, throttle);

let SimpleText = VText(
  async value => typeof value === "string",
  "text",
  value => {
    if (typeof value === "string") return value;
    return "";
  },
  value => {
    return String(value);
  },
  2000
);
export { VText, Phone, Email };
export { SimpleText as default };
