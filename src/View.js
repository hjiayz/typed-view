import React, { PureComponent } from "react";
import Icon from "./Icon";
import { QueryPanel } from "./Query";
import { Link } from "react-router-dom";
import err from "./MessageText";
import { verify as verifyTool, isTrue, init } from "./Verify";

class View extends PureComponent {
  constructor(props) {
    super(props);
    let define = props.structModel.define;
    let value = props.value || (define || {}).default;
    let verifyValue = init(value, -1);
    this.state = {
      value: value,
      verifyValue: verifyValue,
      oldvalue: [],
      nextvalue: [],
      goodvalue: err.verifying
    };
    this.verifyTool = verifyTool(props.structModel.define.verify);
  }
  popupMenu(...params) {
    this.props.popupMenu(...params);
  }
  componentWillMount() {
    this._isMounted = true;
  }
  componentDidMount() {
    this.verifyTool(this, this.state.value);
    this.props.popupMenu(this.getActionList(), this.props.title);
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.props.popupMenu();
    if (!!this.props.page) return;
    this.props.popupMenu(null, null);
  }
  componentWillReceiveProps(props) {
    if (props.value !== this.props.value) {
      this.setState({
        value: props.value || props.structModel.defaultvalue,
        oldvalue: [],
        nextvalue: []
      });
    }
  }
  inline_query(type, cb) {
    this.setState({
      query: {
        type: type,
        cb: cb
      }
    });
  }
  update_popupmenu = () => {
    this.props.popupMenu(null, null).then(() => {
      this.props.popupMenu(this.getActionList(), this.props.title);
    });
  };
  getActionList = () => {
    let {
      view_link,
      query_link,
      create_link,
      home_link,
      base_url
    } = this.props.router;
    let actionList = (this.props.actionList || [])
      .map((v, i) => {
        if (!v.readOnly && !this.state.editable) return null;
        return {
          title: v.title,
          action: async _ => {
            if (this.state.lock) {
              return;
            }
            try {
              let res = await v.action(this.state.value);
              if (!this._isMounted) {
                return;
              }
              if (!!res.value && this.state.editable) {
                this.setState(p => ({
                  value: res.value,
                  oldvalue: p.oldvalue.concat(p.value),
                  nextvalue: []
                }));
              }
              if (!!res.message) {
                this.props.sendMessage(res.message, "info");
              }
              if (!!res.url) {
                if (this.props.history.location.pathname === res.url) {
                  this.props.reload();
                } else {
                  this.props.history.push(base_url + res.url, new Object());
                }
              }
            } catch (e) {
              this.props.sendMessage(this.props.errorMessage[e] || e, "info");
            }
            return;
          }
        };
      })
      .filter(action => action !== null);
    return actionList;
  };
  undoClick = _ => {
    if (this.state.lock) {
      return;
    }
    this.setState(p => {
      let old = p.oldvalue.concat();
      let v = old.pop();
      let next = p.nextvalue.concat(p.value);
      return {
        value: v,
        oldvalue: old,
        nextvalue: next
      };
    });
  };
  redoClick = _ => {
    if (this.state.lock) {
      return;
    }
    this.setState(p => {
      let next = p.nextvalue.concat();
      let old = p.oldvalue.concat(p.value);
      let v = next.pop();
      return {
        value: v,
        oldvalue: old,
        nextvalue: next
      };
    });
  };
  editClick = _ => {
    if (this.state.lock) {
      return;
    }
    this.setState({ editable: true }, () => {
      this.update_popupmenu();
    });
  };
  updataClick = _ => {
    if (this.state.lock) {
      return;
    }
    this.setState({ updating: true, lock: true });
    this.props
      .onChange(this.state.value)
      .then(_ => {
        if (!this._isMounted) {
          return;
        }
        this.setState(
          {
            updating: null,
            editable: null,
            lock: false
          },
          () => {
            this.update_popupmenu();
          }
        );
      })
      .catch(_ => {
        if (!this._isMounted) {
          return;
        }
        this.setState({ updating: null, lock: false });
      });
  };
  delClick = _ => {
    if (this.state.lock) {
      return;
    }
    this.props.popup(err.confirm_delete, _ => {
      this.setState({ deleting: true, lock: true });
      this.props
        .onDelete()
        .then(_ => {
          if (!this._isMounted) {
            return;
          }
          this.setState({ deleting: null, lock: false });
        })
        .catch(_ => {
          if (!this._isMounted) {
            return;
          }
          this.setState({ deleting: null, lock: false });
        });
    });
  };
  createClick = _ => {
    if (this.state.lock) {
      return;
    }
    this.setState({ creating: true, lock: true });
    this.props
      .onCreate(this.state.value)
      .then(_ => {
        if (!this._isMounted) {
          return;
        }
        this.setState({ creating: null, lock: false });
      })
      .catch(_ => {
        if (!this._isMounted) {
          return;
        }
        this.setState({ creating: null, lock: false });
      });
  };
  queryOnChoose = v => {
    let cb = this.state.query.cb;
    this.setState({ query: undefined }, () => cb(v));
  };
  queryOnBack = _ => {
    this.setState({ query: undefined });
  };
  modelOnChange = v => {
    if (this.state.lock) {
      return;
    }
    this.verifyTool(this, v);
    this.setState(p => ({
      value: v,
      oldvalue: p.oldvalue.concat(p.value),
      nextvalue: []
    }));
  };
  menuOnClick = e => {
    e.stopPropagation();
    this.props.setMenu();
  };
  render() {
    console.log(this.props.value);
    let { view_link, query_link, create_link, home_link } = this.props.router;
    if (!!this.state.query) {
      let { queryCondList, onQuery, errorMessage } = this.props.config.find(
        item => item.name === this.state.query.type
      );
      return (
        <QueryPanel
          history={this.props.history}
          queryCondList={queryCondList}
          onQuery={onQuery}
          errorMessage={errorMessage}
          sendMessage={this.props.sendMessage}
          popup={this.props.popup}
          setMenu={this.props.setMenu}
          onChoose={this.queryOnChoose}
          onBack={this.queryOnBack}
          popupMenu={this.props.popupMenu}
          page={this.props.page || this}
        />
      );
    }
    let {
      value,
      title,
      structModel,
      onChange,
      onDelete,
      onCreate,
      history,
      ...props
    } = this.props;
    let StructModel = structModel;
    let nochanged = this.state.oldvalue.length === 0;
    let hasnext = this.state.nextvalue.length > 0;
    let goodvalue = isTrue(this.state.verifyValue);
    let undo = null;
    let redo = null;
    let update = null;
    let create = null;
    let del = null;
    let edit = null;
    let actionList = this.getActionList();
    undo = (
      <p
        className="control"
        style={
          {
            //display: !this.state.editable && !onCreate ? "none" : undefined
          }
        }
      >
        <a
          className={
            "button is-white" +
            (!nochanged ? "" : " is-active is-light is-static")
          }
          onClick={this.undoClick}
        >
          <Icon icon="undo" color={!nochanged ? "link" : null} isize="lg" />
          <span className="is-hidden-mobile">{err.undo}</span>
        </a>
      </p>
    );
    if (!this.state.editable && !onCreate) undo = null;
    redo = (
      <p
        className="control"
        style={
          {
            //display: !this.state.editable && !onCreate ? "none" : undefined
          }
        }
      >
        <a
          className={
            "button is-white" + (hasnext ? "" : " is-active is-light is-static")
          }
          onClick={this.redoClick}
        >
          <Icon icon="redo" color={hasnext ? "link" : null} isize="lg" />
          <span className="is-hidden-mobile">{err.redo}</span>
        </a>
      </p>
    );
    if (!this.state.editable && !onCreate ? "none" : undefined) redo = null;
    if (onChange) {
      edit = (
        <p
          className="control"
          //style={{ display: this.state.editable ? "none" : undefined }}
        >
          <a className={"button is-white"} onClick={this.editClick}>
            <Icon icon="edit" color={"link"} isize="lg" />
            <span className="is-hidden-mobile">{err.modify}</span>
          </a>
        </p>
      );
      if (this.state.editable) edit = null;
      update = (
        <p
          className="control"
          //style={{ display: !this.state.editable ? "none" : undefined }}
        >
          <a
            className={
              "button" +
              (this.state.updating
                ? " is-loading is-link"
                : goodvalue && !nochanged
                  ? " is-white"
                  : " is-active is-light is-static")
            }
            onClick={this.updataClick}
          >
            <Icon
              icon="check"
              color={goodvalue && !nochanged ? "link" : null}
              isize="lg"
              style={{ visibility: this.state.updating ? "hidden" : "visible" }}
            />
            <span className="is-hidden-mobile">{err.confirm}</span>
          </a>
        </p>
      );
    }
    if (!this.state.editable) update = null;
    if (onDelete) {
      del = (
        <p className="control">
          <a
            className={
              "button" +
              (this.state.deleting ? " is-loading is-danger" : " is-white")
            }
            onClick={this.delClick}
          >
            <Icon
              icon="trash"
              color="danger"
              isize="lg"
              style={{ visibility: this.state.deleting ? "hidden" : "visible" }}
            />
            <span className="is-hidden-mobile">{err.delete}</span>
          </a>
        </p>
      );
    }
    if (onCreate) {
      create = (
        <p className="control">
          <a
            className={
              "button" +
              (this.state.creating
                ? " is-loading is-link"
                : goodvalue
                  ? " is-white"
                  : " is-active is-light is-static")
            }
            onClick={this.createClick}
          >
            <Icon
              icon="plus"
              color={goodvalue ? "link" : null}
              isize="lg"
              style={{ visibility: this.state.creating ? "hidden" : "visible" }}
            />
            <span className="is-hidden-mobile">{err.confirm}</span>
          </a>
        </p>
      );
    }

    return (
      <div
        style={{
          //position: "absolute",
          //width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          flexGrow: 1
        }}
      >
        <nav className="navbar is-transparent">
          <div className="navbar-brand" style={{ flexGrow: 1 }}>
            <div className="navbar-item">
              <div className="field has-addons">
                <a className="button is-white" onClick={this.menuOnClick}>
                  <Icon icon="bars" color="link" isize="lg" />
                  <span className="is-hidden-mobile">{err.menu}</span>
                </a>
                <Link className="button is-white" to={home_link()}>
                  <Icon icon="home" color="link" isize="lg" />
                  <span className="is-hidden-mobile">{err.home}</span>
                </Link>
                {undo}
                {redo}
                {edit}
                {update}
                {del}
                {create}
              </div>
            </div>
            <div
              className="navbar-item has-text-primary is-hidden-mobile"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flexGrow: 1,
                flexShrink: 1,
                justifyContent: "center",
                minWidth: 0
              }}
            >
              {title}
            </div>
          </div>
        </nav>
        <div
          className="h2 has-text-primary is-hidden-tablet"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            margin: "1em",
            textAlign: "center"
          }}
        >
          {title}
        </div>
        <div className="control">
          <StructModel
            noBorder={true}
            onChange={
              !!this.state.editable || !!onCreate ? this.modelOnChange : null
            }
            value={this.state.value || value}
            page={this}
            verifyValue={this.state.verifyValue}
            {...props}
          />
        </div>
      </div>
    );
  }
}

export { View };
