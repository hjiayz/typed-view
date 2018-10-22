import React, { Component } from "react";
import { Link } from "react-router-dom";
import err from "./MessageText";
const ErrorPage = ({ message, reload, router }) => {
  let { view_link, query_link, create_link, home_link } = router;
  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: "100%",
        height: "100%"
      }}
    >
      <div className="box" style={{ boxShadow: "0 0 14px #888" }}>
        <div>
          <span className="icon has-text-danger">
            <i className="fas fa-ban" />
          </span>
          <span>{message}</span>
        </div>
        <footer
          style={{
            display: "flex",
            justifyContent: "space-around"
          }}
        >
          <Link className="button is-white" to={home_link()}>
            <span className="icon has-text-link is-small">
              <i className="fas fa-home" />
            </span>
            <span>{err.home}</span>
          </Link>
          <a className="button is-white" onClick={reload}>
            <span className="icon has-text-success is-small">
              <i className="fas fa-sync" />
            </span>
            <span>{err.refresh}</span>
          </a>
        </footer>
      </div>
    </div>
  );
};
export { ErrorPage as default };
