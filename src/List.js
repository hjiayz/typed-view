import React, { PureComponent } from "react";
import { boldViewStyle } from "./styles";
import err from "./MessageText";
export default (Model, minLength, maxLength, onMove) => {
  return class List extends PureComponent {
    constructor(props) {
      super(props);
      this.state = { value: this.props.value || [] };
      this.verifys = [];
      this.count = 0;
    }
    static define = {
      model: "list",
      onMove: onMove,
      elementModel: Model,
      minLength: minLength,
      maxLength: maxLength,
      default: []
    };
    onChange = id => value => {
      let newvalue = Array.from(this.props.value);
      newvalue[id] = value;
      this.count++;
      this.props.onChange(newvalue);
    };
    inc = _ => {
      if (this.maxLength > this.props.value.length) {
        this.props.onChange(
          this.props.value.concat((Model.define || {}).default)
        );
      }
    };
    dec = id => () => {
      if (this.minLength < this.props.value.length) {
        this.props.onChange(this.props.value.filter((v, i) => i !== id));
      }
    };
    render() {
      //fromvalue tochange
      let value = this.state.value;
      return (
        <div
          className="field"
          style={{ ...boldViewStyle, borderWidth: Number(this.props.noBorder) }}
        >
          {value.map((val, i) => {
            return (
              <Model
                key={i}
                onChange={this.props.onChange ? this.onChange(i) : null}
                value={value[i]}
                page={this.props.page}
                onDelete={this.dec(i)}
              />
            );
          })}
          <div className="button" onClick={this.inc}>
            {err.add}
          </div>
        </div>
      );
    }
  };
};
