import React, { PureComponent, Component } from "react";
import { Link } from "react-router-dom";
import { View } from "./View";
import Loading from "./Loading";
import ErrorPage from "./ErrorPage";
import RemoteObject from "./RemoteObject";
import err from "./MessageText";
import { labelStyle } from "./styles";
import { viewStyle } from "./styles";

class RemoteView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    console.log("remoteview created");
  }
  componentDidMount() {
    this.loaddata();
  }
  componentWillReceiveProps(props) {}
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.remoteid !== this.props.remoteid) {
      this.loaddata();
    }
  }
  loaddata() {
    console.log("loading");
    this.setState(_ => ({ reload: null, loading: true }));
    this.props
      .onLoad(this.props.remoteid)
      .then(v => {
        console.log("load result", v);
        this.setState(_ => ({ value: v, loading: false }));
      })
      .catch(e => {
        console.log(e);
        this.setState(_ => ({ reload: e.message, loading: false }));
      });
  }
  render() {
    let { onChange, onDelete, onLoad, ...props } = this.props;
    let errorMessage = this.props.errorMessage;
    if (!!this.state.reload) {
      return (
        <ErrorPage
          router={this.props.router}
          reload={_ => this.loaddata()}
          message={errorMessage[this.state.reload]}
        />
      );
    } else if (!!this.state.loading) {
      return <Loading />;
    }
    return (
      <React.Fragment>
        {!!this.state.value ? (
          <View
            config={this.props.config}
            value={this.state.value}
            reload={_ => this.loaddata()}
            onChange={
              !!onChange
                ? v =>
                    onChange(v)
                      .then(reload => {
                        if (reload) {
                          this.loaddata();
                        } else {
                          this.setState({ value: v });
                        }
                      })
                      .catch(e => {
                        this.props.sendMessage(
                          this.props.errorMessage[e.message],
                          "info"
                        );
                        throw e;
                      })
                : null
            }
            onDelete={
              !!onDelete
                ? v =>
                    onDelete(this.props.remoteid)
                      .then(_ => {})
                      .catch(e => {
                        throw e;
                      })
                : null
            }
            {...props}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

const toOperate = (name, opt) => {
  if (typeof opt === "function") {
    return {
      title: name,
      operate: opt
    };
  }
  return;
};
const RemoteItem = class extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    let {
      view_link,
      query_link,
      create_link,
      home_link
    } = this.props.page.props.router;
    let buttons = [];
    console.log("remoteview", this.props);
    let {
      onSelect,
      onChange,
      value,
      selected,
      page,
      hidden,
      isOption,
      onChoose
    } = this.props;
    if (!!onSelect && RemoteObject.is(value)) {
      buttons.push(
        toOperate(this.props.selected ? err.cancel : err.checked, onSelect)
      );
    }
    if (!!onChoose) {
      buttons.push({
        title: err.choose,
        operate: _ => onChoose(value)
      });
    } else {
      if (RemoteObject.is(value)) {
        buttons.push({
          title: err.look,
          href: view_link(value.id, value.type)
        });
      }

      if (!!onChange) {
        if (isOption && RemoteObject.is(value))
          buttons.push(
            toOperate(err.clear, _ =>
              onChange(new RemoteObject(null, null, value.type))
            )
          );
        if (!!page) {
          buttons.push(
            toOperate(err.change, () => {
              page.inline_query(value.type, onChange);
            })
          );
        }
      }
    }
    let labelstyle = { flex: "1 0 auto" };
    return (
      <div
        className="control"
        style={{
          width: "100%",
          display: "flex",
          whiteSpace: "nowrap",
          alignItems: "center",
          flex: "1 0 auto"
        }}
      >
        {buttons.length === 0 ? (
          <span style={labelstyle}> {(value || {}).name || err.empty}</span>
        ) : buttons[0].href ? (
          <Link to={buttons[0].href} style={labelstyle}>
            {(value || {}).name || err.empty}
          </Link>
        ) : (
          <a onClick={buttons[0].operate} style={labelstyle}>
            {(value || {}).name || err.empty}
          </a>
        )}
        <div
          className={"field" + (buttons.length > 1 ? " has-addons" : "")}
          style={{ flex: "0 0 auto" }}
        >
          {buttons.map((v, i) => {
            if (!!v.href) {
              return (
                <p className="control" key={i}>
                  <Link
                    className={"button" + (i === 0 ? " is-primary" : "")}
                    key={i}
                    to={v.href}
                  >
                    {v.title}
                  </Link>
                </p>
              );
            }
            if (!!v.operate) {
              return (
                <p className="control" key={i}>
                  <a
                    className={"button" + (i === 0 ? " is-primary" : "")}
                    key={i}
                    onClick={v.operate}
                  >
                    {v.title}
                  </a>
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }
};
const RemoteType = name => {
  return class RemoteTypeIns extends PureComponent {
    constructor(props) {
      super(props);
      this.count = 0;
      this.count++;
    }
    static define = {
      model: "RemoteType",
      name: name,
      verify: value =>
        value instanceof RemoteObject ? true : err.type_mismatch
    };
    fromValue = value => {
      if (!!this.props.fromValue) return this.props.fromValue(value);
      if (value instanceof RemoteObject) return value;
      return new RemoteObject(null, null, name);
    };
    toChange = value => {
      if (!!this.props.toChange) return this.props.toChange(value);
      return value;
    };
    onChange = value => {
      this.count++;
      return this.props.onChange(this.toChange(value));
    };
    render() {
      let { value, label, ...props } = this.props;
      return (
        <div
          className="field"
          style={{ ...viewStyle, borderWidth: Number(!this.props.noBorder) }}
        >
          {label ? (
            <label className="label" style={labelStyle}>
              {label}
            </label>
          ) : null}
          <RemoteItem value={this.fromValue(value)} {...props} />
        </div>
      );
    }
  };
};
export { RemoteView, RemoteItem, RemoteType };
