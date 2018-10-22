import React, { PureComponent } from "react";
import { VText } from "./Text";
import err from "./MessageText";
let verify_http_url = async value => {
  try {
    if (
      !/^http(s|):$/.test(
        new URL(
          value,
          window.location.href.replace(window.location.pathname, "")
        ).protocol
      )
    )
      throw new Error();
  } catch (_) {
    return err.invalid_URL;
  }
  return true;
};
let HttpUrl = VText(verify_http_url, "url");
export { HttpUrl };
