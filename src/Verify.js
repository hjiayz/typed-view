import err from "./MessageText";
import DataObject from "./DataObject";
let init = (value, count, verifyValue) => {
  console.log(value, count, verifyValue);
  let data = (verifyValue || { data: {} }).data || {};
  let newcount = count;
  if (typeof value === "object" && !(value instanceof DataObject)) {
    for (let field in value) {
      data[field] = init(value[field], count, data[field]);
    }
    for (let field in data) {
      newcount = Math.min(data[field].count, newcount);
    }
  } else {
    data = err.verifying;
  }
  return {
    data: data,
    count: newcount
  };
};
let verify = verify => {
  let verify_count = 0;
  return (comp, value) => {
    verify_count++;
    let count = verify_count;
    comp.setState(({ verifyValue }) => {
      return {
        verifyValue: init(value, count, verifyValue)
      };
    });
    verify(value)
      .then(res => {
        comp.setState(({ verifyValue }) => {
          let setVerify = (result, value) => {
            let new_data = { ...value.data };
            let new_count = count;
            for (let field in result) {
              let resvalue = result[field];
              let vdata = new_data[field].data;
              let vcount = new_data[field].count;
              if (vcount <= count) {
                if (typeof resvalue == "object") {
                  new_data[field] = setVerify(resvalue, vdata);
                } else {
                  new_data[field] = {
                    data: resvalue,
                    count: count
                  };
                }
              }
              new_count = Math.min(new_data[field].count, new_count);
            }
            return { data: new_data, count: new_count };
          };
          if (verifyValue.count > count) return {};
          let result = {
            verifyValue: setVerify(res, verifyValue)
          };
          console.log("struct onchange verify", result);
          return result;
        });
      })
      .catch(e => {
        return console.log("verify function throw:", e);
      });
  };
};
let isTrue = verify => {
  if (!!verify) {
    let data = verify.data;
    if (data === true) return true;
    if (typeof data === "string") return false;
    if (typeof data === "object") {
      for (let i in data) {
        if (!isTrue(data[i])) return false;
      }
    }
  }
  return true;
};
export { verify, isTrue, init };
