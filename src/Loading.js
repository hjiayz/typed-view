import React, { Component } from "react";
export default () => (
  <div
    style={{
      pointerEvents: "none",
      userSelect: "none",
      //position: "absolute",
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <span
      className="loader"
      style={{
        height: "3em",
        width: "3em",
        margin: "auto"
      }}
    />
  </div>
);
