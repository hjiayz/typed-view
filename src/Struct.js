import React, { PureComponent } from "react";
import RemoteObject from "./RemoteObject";
import { boldViewStyle } from "./styles";
import err from "./MessageText";
import { verify as verifyTool } from "./Verify";

export default (model, verify) => {
  let modelObject = Object.assign(
    {},
    ...model.map(v => ({ [v.field]: v.type }))
  );
  let defaultStructVerify = async data => {
    let result = {};
    for (let field in data) {
      console.log("struct verify", modelObject[field].define);
      result[field] = await modelObject[field].define.verify(data[field]);
    }
    return result;
  };
  verify = verify || defaultStructVerify;
  let define = {
    model: "struct",
    props: model,
    verify: verify,
    default: (() =>
      Object.assign(
        {},
        ...model.map(v => ({
          [v.field]: (v.type.define || {}).default
        }))
      ))()
  };
  return class Struct extends PureComponent {
    constructor(props) {
      super(props);
      this.verifys = Object.assign(
        {},
        ...model.map(v => {
          return {
            [v.field]: {
              result: err.verifying,
              count: -1
            }
          };
        })
      );
      this.state = {};
    }
    static define = define;
    verify = async () => {
      for (let item of Object.values(this.verifys)) {
        if (item.result !== true) return false;
      }
      return true;
    };
    onChange = field => value => {
      if (!this.props.onChange) return;
      let newvalue = Object.assign({}, this.props.value, {
        [field]: value
      });
      this.props.onChange(newvalue);
    };
    componentDidMount() {}
    render() {
      let value = this.props.value || {};
      let verifyValue = this.props.verifyValue || this.state.verifyValue;
      console.log("struct verifyValue", verifyValue);
      return (
        <div
          className="field"
          style={{
            ...boldViewStyle,
            borderWidth: Number(!this.props.noBorder)
          }}
        >
          {model.map((field, i) => {
            let name = field.field;
            let Model = field.type;
            let label = field.label || field.field;
            if (typeof label === "function") {
              label = label(value);
            }
            return (
              <Model
                key={i}
                onChange={this.props.onChange ? this.onChange(name) : null}
                value={value[name]}
                label={label}
                page={this.props.page}
                verifyValue={!!verifyValue ? verifyValue.data[name] : null}
              />
            );
          })}
        </div>
      );
    }
  };
};
