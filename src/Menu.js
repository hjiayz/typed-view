import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import MessageText from "./MessageText";
import Icon from "./Icon";
//import "./Menu.css";
export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      query: ""
    };
  }
  render() {
    let { menuItems, show, active, navigationMenu } = this.props;
    let a_css = {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    };
    let menus = [
      {
        menu: (navigationMenu || []).filter(
          v => v.title.indexOf(this.state.query) !== -1
        ),
        title: MessageText.navigation,
        active: active
      }
    ];
    if (Array.isArray(menuItems)) {
      menus = menus.concat(
        menuItems.map(item =>
          Object.assign({}, item, {
            menu: item.menu.filter(
              v => v.title.indexOf(this.state.query) !== -1
            )
          })
        )
      );
    }
    menus.reverse();
    console.log(menus);
    return (
      <aside
        style={{
          maxWidth: 300,
          width: show ? "calc(100% - 4em)" : 0,
          height: "100%",
          overflowY: "scroll",
          overflowX: "hidden",
          transition: "all 0.5s",
          flexGrow: 0,
          flexShrink: 0
        }}
      >
        <div
          className={"control is-expanded has-icons-left"}
          style={{ margin: "0.5em" }}
        >
          <input
            className={"input is-fullwidth is-rounded"}
            onChange={e => {
              this.setState({ query: e.target.value });
            }}
            value={this.state.query}
          />
          <Icon icon="search" csize="small" left />
        </div>
        <div className="menu" style={{ margin: "0.5em" }}>
          {menus.map((menu_group, i) => {
            if (menu_group.menu.length === 0) return null;
            return (
              <React.Fragment key={i}>
                <p className="menu-label" style={a_css}>
                  {menu_group.title}
                </p>
                <ul
                  className="menu-list menu-list-main"
                  onClick={this.props.onClick}
                >
                  {menu_group.menu.map((v, i) => {
                    let link_class = "";
                    let title =
                      this.state.query === ""
                        ? [v.title]
                        : v.title.split(this.state.query);
                    title = title.map((v, i) => {
                      return (
                        <React.Fragment key={i}>
                          {i === 0 ? null : (
                            <strong className="has-text-primary">
                              {this.state.query}
                            </strong>
                          )}
                          {v}
                        </React.Fragment>
                      );
                    });
                    if (!!v.name && v.name === menu_group.active) {
                      link_class = "is-active";
                    }
                    if (v.href) {
                      return (
                        <li key={i}>
                          <Link
                            className={link_class}
                            to={v.href}
                            style={a_css}
                          >
                            {title}
                          </Link>
                        </li>
                      );
                    }
                    if (v.action) {
                      return (
                        <li key={i}>
                          <a
                            className={link_class}
                            onClick={v.action}
                            style={a_css}
                          >
                            {title}
                          </a>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </React.Fragment>
            );
          })}
        </div>
      </aside>
    );
  }
}
