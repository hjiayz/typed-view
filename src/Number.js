import React, { PureComponent } from "react";
import Text, { VText } from "./Text";
import err from "./MessageText";
let INumber = (min, max, isInteger) => {
  let defaultvalue = 0;
  if (min > defaultvalue) defaultvalue = min;
  if (max < defaultvalue) defaultvalue = max;
  let verify = value => {
    value = Number(value);
    if ((isInteger && !Number.isInteger(value)) || Number.isNaN(value))
      return err.out_of_range;
    if (typeof min === "number" && min > value) return err.out_of_range;
    if (typeof max === "number" && max < value) return err.out_of_range;
    return true;
  };
  return VText(
    async value => {
      return verify(value);
    },
    "number",
    value => {
      console.log("fromvalue number", value);
      if ((isInteger && !Number.isInteger(value)) || Number.isNaN(value))
        return defaultvalue.toString();
      if (typeof min === "number" && min > value) return min.toString();
      if (typeof max === "number" && max < value) return max.toString();
      return value.toString();
    },
    value => {
      console.log(value);
      let count = 0;
      value = Number(
        (value || "").replace(/[^0-9]/g, (str, offset) => {
          if (str === "-") {
            return offset === 0 ? str : "";
          }
          if (!isInteger && str === "." && count === 0) {
            count++;
            return str;
          }
          return "";
        })
      );
      if (value > max) value = max;
      if (value < min) value = min;
      console.log("tochange number", value);
      return value;
    }
  );
};
let imin = bit => -1 << (bit - 1);
let imax = bit => ((1 << (bit - 1)) >>> 0) - 1;
let umax = bit => (-1 << (32 - bit)) >>> (32 - bit);
let I32 = INumber(imin(32), imax(32), true);
let U32 = INumber(0, umax(32), true);
let I16 = INumber(imin(16), imax(16), true);
let U16 = INumber(0, umax(16), true);
let I8 = INumber(imin(8), imax(8), true);
let U8 = INumber(0, umax(8), true);
let Double = INumber(undefined, undefined, false);
export { INumber as default, I32, U32, I8, U8, I16, U16, Double };
