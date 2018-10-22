import React, { PureComponent } from "react";
import { BrowserRouter, Route, Link, Redirect, Switch } from "react-router-dom";
import { RemoteView } from "./RemoteView";
import { View } from "./View";
import { QueryPanel } from "./Query";
import Message from "./Message";
import Popup from "./Popup";
import Menu from "./Menu";
import FullScreen from "./FullScreen";
import err from "./MessageText";
let defaultUrlCreater = {
  view_link: base_url => (id, name) => {
    return `${base_url}/view/${name}/${id}`;
  },
  query_link: base_url => name => {
    return `${base_url}/query/${name}`;
  },
  create_link: base_url => name => {
    return `${base_url}/new/${name}`;
  },
  home_link: base_url => () => {
    return base_url + "/";
  }
};
export { defaultUrlCreater as UrlCreater };
let UrlBuilder = (base_url, urlCreater) => ({
  view_link: urlCreater.view_link(base_url),
  query_link: urlCreater.query_link(base_url),
  create_link: urlCreater.create_link(base_url),
  home_link: urlCreater.home_link(base_url)
});

export { UrlBuilder };

let pre_new = err.new;
let Page = (props, routers) => {
  let { view_link, query_link, create_link, home_link } = props.router;
  let ViewPage = p => (
    <RemoteView
      history={p.history}
      remoteid={p.match.params.remoteid}
      title={props.viewTitle || props.name}
      structModel={props.viewStruct}
      actionList={props.actionList}
      onChange={props.onChange}
      onLoad={props.onLoad}
      onDelete={
        !!props.onDelete
          ? async _ => {
              try {
                await props.onDelete(p.match.params.remoteid);
                p.history.push(query_link(props.name), new Object());
              } catch (e) {
                props.sendMessage(props.errorMessage[e] || e, "info");
                throw e;
              }
            }
          : null
      }
      errorMessage={props.errorMessage}
      sendMessage={props.sendMessage}
      popup={props.popup}
      setMenu={props.setMenu}
      config={props.config}
      popupMenu={props.popupMenu}
      router={props.router}
    />
  );
  let QueryPage = p => (
    <QueryPanel
      history={p.history}
      queryCondList={props.queryCondList}
      onQuery={props.onQuery}
      errorMessage={props.errorMessage}
      toCreate={_ => p.history.push(create_link(props.name), new Object())}
      sendMessage={props.sendMessage}
      popup={props.popup}
      setMenu={props.setMenu}
      actions={props.batchActions}
      popupMenu={props.popupMenu}
      router={props.router}
      title={props.viewTitle || props.name}
    />
  );
  let CreatePage = p => {
    return (
      <View
        history={p.history}
        title={props.createTitle || pre_new + props.name}
        structModel={props.createStruct}
        onCreate={async v => {
          try {
            let res = (await props.onCreate(v)) || {};
            let path = res.url || home_link();
            let msg = res.message;
            console.log("new path", path);
            p.history.push(path, new Object());
            props.sendMessage(msg || err.add_ok, "info");
          } catch (e) {
            props.sendMessage(props.errorMessage[e] || e, "info");
            throw e;
          }
        }}
        errorMessage={props.errorMessage}
        sendMessage={props.sendMessage}
        popup={props.popup}
        setMenu={props.setMenu}
        config={props.config}
        popupMenu={props.popupMenu}
        router={props.router}
        {...p}
      />
    );
  };
  if (!!props.onLoad) {
    routers.push(
      <Route
        key={routers.length}
        exact
        strict
        path={view_link(":remoteid", props.name)}
        {...props}
        component={ViewPage}
      />
    );
  }
  if (!!props.onQuery) {
    routers.push(
      <Route
        key={routers.length}
        exact
        strict
        path={query_link(props.name)}
        {...props}
        component={QueryPage}
      />
    );
  }
  if (!!props.onCreate) {
    routers.push(
      <Route
        key={routers.length}
        exact
        strict
        path={create_link(props.name)}
        {...props}
        component={CreatePage}
      />
    );
  }

  return routers;
};
export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.message = React.createRef();
    this.popup = React.createRef();
    this.screen = React.createRef();
    let base_url = this.props.baseUrl;
    let urlCreater = this.props.urlCreater || defaultUrlCreater;
    let { view_link, query_link, create_link, home_link } = UrlBuilder(
      base_url,
      urlCreater
    );
    this.base_url = base_url;
    this.view_link = view_link;
    this.query_link = query_link;
    this.create_link = create_link;
    this.home_link = home_link;
    this.setConfig(this.props.config);
    this.state = { ...this.state, showmenu: false };
  }
  setConfig = config => {
    let { view_link, query_link, create_link, home_link, base_url } = this;
    let menu = config
      .map((v, i) => {
        let { name, viewTitle, menuTitle, onQuery, onCreate } = v;
        let href;
        if (onQuery) {
          href = query_link(name);
        } else if (onCreate) {
          href = create_link(name);
        } else {
          return null;
        }
        return {
          href: href,
          title: menuTitle || viewTitle || name,
          name: name
        };
      })
      .filter(v => !!v)
      .sort((a, b) => a.title.localeCompare(b.title));
    let body = config.reduce((r, v, id) => {
      let params = {
        ...v,
        sendMessage: (...p) => this.message.current.sendMessage(...p),
        popup: (...p) => this.popup.current.alert(...p),
        setMenu: (...p) => this.setMenu(...p),
        config: config,
        popupMenu: (...p) => this.popupMenu(...p),
        router: this
      };
      return Page(params, r);
    }, []);
    if (!!this.state) {
      this.setState({
        menu: menu,
        body: body
      });
    } else {
      this.state = {
        menu: menu,
        body: body
      };
    }
    console.log("new body", body);
  };
  switchMenu(cb) {
    this.setState(p => ({ showmenu: !p.showmenu }), cb);
  }
  showMenu(cb) {
    this.setState(p => ({ showmenu: 1 }), cb);
  }
  closeMenu(cb) {
    this.setState(p => ({ showmenu: 0 }), cb);
  }
  popupMenu = (menuitems, menutitle) => {
    return new Promise((res, err) => {
      if (Array.isArray(menuitems)) {
        this.setState(
          p => ({
            popupMenu: (p.popupMenu || []).concat({
              menu: menuitems,
              title: menutitle
            })
          }),
          res
        );
      } else {
        this.setState(
          p => ({
            popupMenu: (p.popupMenu || []).filter((_, i, a) => i < a.length - 1)
          }),
          res
        );
      }
    });
  };
  setMenu(state, cb) {
    if (typeof state !== "number") {
      this.switchMenu(cb);
      return;
    } else {
      this.setState(p => ({ showmenu: state }), cb);
    }
  }
  componentDidMount() {}
  componentWillReceiveProps(props) {
    if (this.props.config !== props.config) {
      this.setConfig(props.config);
    }
  }
  showFullScreen = (component, initvalue) =>
    new Promise(res =>
      this.setState(
        { fullScreenComponent: component, fullScreenValue: initvalue },
        res
      )
    );
  updateFullScreen = value =>
    new Promise(res => this.setState({ fullScreenValue: value }, res));
  hiddenFullScreen = _ =>
    new Promise(res =>
      this.setState({ fullScreenComponent: null, fullScreenValue: null }, res)
    );
  hiddenMenu = e => {
    if (document.body.offsetWidth >= 769) return;
    this.setState({ showmenu: 0 });
  };
  render() {
    let { view_link, query_link, create_link, home_link, base_url } = this;
    return (
      <div>
        <BrowserRouter>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              display: this.state.fullScreenComponent ? "none" : "flex"
            }}
            //onClick={this.hiddenMenu}
          >
            <Route
              path={home_link() + ":type/:name"}
              render={({ match }) => (
                <Menu
                  navigationMenu={this.state.menu}
                  menuItems={this.state.popupMenu}
                  show={this.state.showmenu}
                  active={match.params.name}
                  onClick={this.hiddenMenu}
                />
              )}
            />
            <div style={{ flexGrow: 1, height: "100%" }}>
              <Switch>
                {this.state.body}
                <Redirect
                  exact
                  strict
                  path={home_link()}
                  to={{
                    pathname: base_url + this.props.homePage,
                    state: {}
                  }}
                />
                <Redirect
                  to={{
                    pathname:
                      base_url + (this.props.noMatch || this.props.homePage),
                    state: {}
                  }}
                />
              </Switch>
            </div>
          </div>
        </BrowserRouter>
        <Message
          ref={this.message}
          timeout={this.props.message_timeout || 1500}
        />
        <Popup ref={this.popup} />
        <FullScreen
          component={this.state.fullScreenComponent}
          value={this.state.fullScreenValue}
          hidden={this.hiddenFullScreen}
        />
      </div>
    );
  }
}
