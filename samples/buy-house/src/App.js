import React, { Component } from "react";
import "bulma/css/bulma.css";
import "@fortawesome/fontawesome-free/css/all.css";
import define from "./Define";
import { Types, GeneralTypes, Tools, Datas, MessageText } from "typed-view";
let {
  Text,
  Phone,
  Email,
  I32,
  U32,
  I8,
  U8,
  I16,
  U16,
  Double,
  Boolean,
  Infomation
} = Types;

let {
  List,
  Struct,
  Input,
  Number,
  ReadOnly,
  Option,
  Password,
  Image,
  ConfirmPassword,
  Enum,
  RemoteType
} = GeneralTypes;
let { ConfirmPasswordData, RemoteObject } = Datas;
let { Querier, Router, UrlCreater, UrlBuilder } = Tools;

let base_url = process.env.PUBLIC_URL;
let { view_link, query_link, create_link, home_link } = UrlBuilder(
  base_url,
  UrlCreater
);

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Router
        baseUrl={base_url}
        homePage={view_link("0", "person")}
        noMatch={create_link("newgame")}
        config={define}
      />
    );
  }
}

export default App;
