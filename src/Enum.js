import React, { PureComponent } from "react";
import { VText } from "./Text";
import err from "./MessageText";
let TEnum = (ident_list, fromValue, toChange) => {
  let elements = new Set(ident_list);
  return VText(
    async val => {
      console.log(val);
      return elements.has(val) ? true : err.type_mismatch;
    },
    "text",
    fromValue,
    toChange,
    null,
    () => {
      let result = ident_list.map(fromValue);
      console.log("autoComp", result);
      return result;
    }
  );
};
let TBoolean = TEnum(
  [true, false],
  value => {
    if (value === true) return err.yes;
    if (value === false) return err.no;
    return value;
  },
  value => {
    if (value === err.yes) return true;
    if (value === err.no) return false;
    return value;
  }
);
export default TEnum;
export { TBoolean };
