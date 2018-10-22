import React, { PureComponent } from "react";
import Text, { VText } from "./Text";
import err from "./MessageText";
import { viewStyle } from "./styles";
import DataObject from "./DataObject";

let Pwd = fverify => {
  return VText(fverify, "password");
};

class ConfirmPasswordData extends DataObject {
  constructor(password, confirm) {
    super();
    this.password = password || "";
    this.confirm = confirm || "";
  }
  valueOf() {
    return this.password;
  }
  toJson() {
    return this.password;
  }
  verify() {
    return this.password === this.confirm;
  }
  clone() {
    return new ConfirmPassword(this.password, this.confirm);
  }
}
const defaultValue = new ConfirmPasswordData("", "");
let ConfirmPassword = fverify => {
  let FstPassword = Pwd(fverify);
  let define = {
    model: "ConfirmPassword",
    verify: async value => {
      if (!(value instanceof ConfirmPasswordData)) return err.type_mismatch;
      if (!value.verify()) return err.confirm_inconsistent;
      return fverify(value.password);
    },
    fromValue: value => {
      console.log("password from value", value);
      if (value instanceof ConfirmPasswordData) return value;
      return new ConfirmPasswordData("", "");
    },
    toChange: value => {
      return value;
    },
    default: new ConfirmPasswordData("", "")
  };
  return class ConfirmPasswordView extends PureComponent {
    constructor(props) {
      super(props);
    }
    static define = define;
    onChange = value => {
      if (!this.props.onChange) return;
      this.props.onChange(value);
    };
    onChangeFirst = value => {
      this.onChange(new ConfirmPasswordData(value, this.props.value.confirm));
    };
    onChangeVerify = value => {
      this.onChange(new ConfirmPasswordData(this.props.value.password, value));
    };
    render() {
      let [help, helpcolor] = this.props.value.verify()
        ? [null, null]
        : [err.confirm_inconsistent, "danger"];
      let value = define.fromValue(this.props.value);
      console.log("render c password", value);
      return (
        <React.Fragment>
          <FstPassword
            label={this.props.label}
            value={value.password}
            onChange={this.onChangeFirst}
            //style={viewStyle}
          />
          <Text
            label={err.confirm + this.props.label}
            type="password"
            value={value.confirm}
            help={help}
            helpcolor={helpcolor}
            onChange={this.onChangeVerify}
            //style={viewStyle}
          />
        </React.Fragment>
      );
    }
  };
};

export { Pwd as default, ConfirmPassword, ConfirmPasswordData };
