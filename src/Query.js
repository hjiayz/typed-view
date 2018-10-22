import React, { PureComponent } from "react";
import Icon from "./Icon";
import Loading from "./Loading";
import Message from "./Message";
//cond_model:{name:string,verify:verify function,}
import { RemoteItem } from "./RemoteView";
import RemoteObject from "./RemoteObject";
import err from "./MessageText";
function getElementDefine(define) {
  if (define.model === "list") {
    return define.elementModel.define;
  }
  if (define.model === "input") {
    return define;
  }
  throw new Error(err.type_mismatch);
}

const Querier = (definelist, addable) => {
  let defaultAddable = (definelist, data) => {
    console.log("default addable start", data);
    let result = [];
    for (let define of definelist) {
      console.log(define);
      let value = data[define.field];
      let model = define.type.define.model;
      if (model === "list") {
        let elementModel = define.type.define.elementModel;
        if (elementModel.define.model === "input") {
          console.log("element define", elementModel.define);
          if (
            value === undefined ||
            value.length < define.type.define.maxLength
          ) {
            result.push(define);
          } else {
            //error = err.exceed_the_capacity_of_the_array;
          }
          continue;
        }
        //error = err.type_mismatch;
      }
      if (model === "input") {
        if (value === undefined) {
          result.push(define);
        }
        continue;
      }
      console.log("type_mismatch happend");
      //error = err.type_mismatch;
    }
    console.log("default addable end", result);
    return result;
  };
  addable = addable || defaultAddable;
  return {
    definelist: definelist,
    define: {
      model: "querier",
      definelist: definelist,
      addable: addable
    },
    addable: addable
  };
};

class QueryPanel extends PureComponent {
  constructor(props) {
    super(props);
    //queryCondList onQuery errorMessage toCreate history sendMessage
    this.state = {
      cond_verify: false,
      cond_list: [],
      datas: {},
      show_cond_types: false,
      scrollTop: 0,
      auto_complete: [],
      selected: {}
    };
    this.lastupdate = 0;
  }
  toQueryString = cond_list => {
    let cond_string = cond_list.map(v => {
      let r = [];
      r.push(v.type.field);
      r.push(getElementDefine(v.type.type.define).fromValue(v.value));
      return r;
    });
    let search_params = new URLSearchParams();
    for (let [key, value] of cond_string) {
      search_params.append(key, value);
    }
    let search = search_params.toString();
    if (!!this.props.page) {
      this.setState({ cond_string: search });
      return;
    }
    let history = this.props.history;
    history.push({
      pathname: history.location.pathname,
      search: search,
      state: {}
    });
  };
  getSearch = () => {
    let search = this.props.history.location.search;
    if (!!this.props.page) {
      search = this.state.cond_string;
    }
    return search;
  };
  fromQueryString = () => {
    let search = this.getSearch();
    let params = Array.from(new URLSearchParams(search));
    console.log("fromQueryString", params);
    return params.map(param => {
      let this_cond_type = this.props.queryCondList.definelist.find(
        define => define.field === param[0]
      );

      console.log(this_cond_type);
      let define = getElementDefine(this_cond_type.type.define);
      let cond = define.toChange(param[1]);
      let label = this_cond_type.getTag(cond);
      return {
        type: this_cond_type,
        value: cond,
        label: label
      };
    });
  };
  showHideCondPanel = _ => {
    this.setState(({ show_cond_types }) => ({
      show_cond_types: !show_cond_types
    }));
  };
  hideCondPanel = () => {
    this.setState(({ show_cond_types }) => ({
      show_cond_types: false
    }));
  };
  onSearch = e => {
    console.log("onSearchFocus");
    e.preventDefault();
  };
  onSearchFocus = e => {
    console.log("onSearchFocus");
    e.preventDefault();
    this.searchbox.focus();
  };
  onSearchBlur = e => {
    console.log("onSearchBlur");
    e.preventDefault();
    this.searchbox.blur();
  };
  popupMenu(...menu) {
    this.props.popupMenu(...menu);
  }
  getValue = value => {
    let list = value || this.fromQueryString();
    console.log("get list", list);
    return list.reduce((r, v, i) => {
      let field = v.type.field;
      let val;
      if (v.type.type && v.type.type.define.model === "list") {
        val = (r[field] || []).concat(v.value);
      } else {
        val = v.value;
      }
      return { ...r, [field]: val };
    }, {});
  };
  update_hidden_query_cond = value => {
    let queryCondList = this.props.queryCondList;
    let definelist = queryCondList.definelist;
    let addable = queryCondList.addable;
    console.log("query_cond, value", value);
    return addable(definelist, value);
  };
  setMessage = msg => {
    console.log("sendMessage");
    this.props.sendMessage(this.props.errorMessage[msg] || msg, "info");
  };
  update = cb => {
    this.lastupdate++;
    let updateid = this.lastupdate;
    this.setState({ querystring: this.getSearch() });
    let conds = this.fromQueryString();

    if (!conds[0]) {
      this.setState({ cond_verify: false, auto_complete: [] }, cb);
      return;
    }
    let this_cond_type = conds[0].type;
    let query_params = this.getValue(conds);
    console.log("query_params", query_params);
    this.setState({ cond_verify: false, loading: true, auto_complete: [] });
    let back = 0;
    let try_cb = () => {
      back++;
      if (back === 2 && typeof cb === "function") {
        cb();
      }
    };
    this_cond_type
      .autoComplete(conds[0].value)
      .then(res => {
        if (!this._isMounted) return try_cb();
        if (updateid === this.lastupdate) {
          this.setState({ auto_complete: res }, try_cb);
        } else {
          try_cb();
        }
      })
      .catch(e => {
        this.setMessage(this.props.errorMessage[e.message] || e.message);
        try_cb();
      });
    let catch_func = e => {
      if (!this._isMounted) return try_cb();
      this.setMessage(this.props.errorMessage[e.message] || e.message);
      this.setState(
        {
          loading: false
        },
        try_cb
      );
    };
    getElementDefine(this_cond_type.type.define)
      .verify(query_params[this_cond_type.field])
      .then(v => {
        if (!this._isMounted) return;
        if (v) {
          this.setState({ cond_verify: true });
          this.props
            .onQuery(query_params)
            .then(res => {
              if (!this._isMounted) return try_cb();
              if (updateid === this.lastupdate) {
                this.setState(
                  prev => ({
                    datas: Object.assign({}, ...res.map(v => ({ [v.id]: v }))),
                    selected: Object.assign(
                      {},
                      ...res.map(v => ({ [v.id]: !!prev.selected[v.id] }))
                    ),
                    loading: false
                  }),
                  () => {
                    this.update_popupmenu(try_cb);
                  }
                );
              } else {
                try_cb();
              }
            })
            .catch(catch_func);
        } else {
          this.setState({ loading: false }, try_cb);
        }
      })
      .catch(catch_func);
  };
  getActionList = () => {
    let {
      view_link,
      query_link,
      create_link,
      home_link,
      base_url
    } = this.props.router;
    if (
      this.props.actions.length === 0 ||
      !Object.values(this.state.selected || {}).some(v => v)
    )
      return [];
    let actions = this.props.actions
      .map(v => {
        return Object.assign({}, v, {
          action: () =>
            new Promise((res, err) => {
              v.action(
                Object.values(this.state.datas).filter(
                  v => this.state.selected[v.id]
                )
              )
                .then(res => {
                  if (!!res) {
                    if (!!res.url) {
                      this.props.history.push(base_url + res.url, new Object());
                    }
                    if (!!res.message) {
                      this.setMessage(res.message);
                    }
                  }
                  this.update(() => {
                    this.update_popupmenu(res);
                  });
                })
                .catch(e => {
                  this.setMessage(
                    this.props.errorMessage[e.message] || e.message
                  );
                  this.update_popupmenu(res);
                });
            })
        });
      })
      .concat(
        {
          title: err.all,
          action: _ => {
            return new Promise((res, err) => {
              this.setState(
                prev => ({
                  selected: Object.assign(
                    {},
                    ...Object.keys(prev.selected).map(v => ({
                      [v]: true
                    }))
                  )
                }),
                () => {
                  this.update_popupmenu(res);
                }
              );
            });
          }
        },
        {
          title: err.cancel,
          action: _ => {
            return new Promise((res, err) => {
              this.setState(
                prev => ({
                  selected: Object.assign(
                    {},
                    ...Object.keys(prev.selected).map(v => ({
                      [v]: false
                    }))
                  )
                }),
                () => {
                  this.update_popupmenu(res);
                }
              );
            });
          }
        }
      );

    return actions;
  };
  update_popupmenu = res => {
    this.props.popupMenu(null, null).then(() => {
      this.props.popupMenu(this.getActionList(), this.props.title).then(res);
    });
  };
  componentDidMount() {
    this._isMounted = true;
    let cond_list = this.fromQueryString();
    console.log("did Mount cond_list", cond_list);
    if (
      cond_list.length === 0 &&
      this.props.queryCondList.definelist.length > 0
    ) {
      let cond_type = this.props.queryCondList.definelist[0];
      let value = getElementDefine(cond_type.type.define).toChange("");
      this.toQueryString([{ type: cond_type, value: value }]);
    }
    this.update();
    this.props.popupMenu(this.getActionList(), this.props.title);
  }
  componentWillUnmount() {
    this._isMounted = false;
    if (!!this.props.page) return;
    this.popupMenu(null, null);
  }
  componentDidUpdate(prevProps, prevStates) {
    console.log("did update");
    let cond_list = this.fromQueryString();
    if (
      cond_list.length === 0 &&
      this.props.queryCondList.definelist.length > 0
    ) {
      let cond_type = this.props.queryCondList.definelist[0];
      let value = getElementDefine(cond_type.type.define).toChange("");
      this.toQueryString([{ type: cond_type, value: value }]);
    }
    if (!!this.state.cond_string) {
      if (this.state.cond_string !== this.state.querystring) {
        this.update();
      }
    } else {
      if (this.props.history.location.search !== this.state.querystring) {
        this.update();
      }
    }
  }
  render() {
    let query_cond_value = this.getValue();
    let addable_conds = this.update_hidden_query_cond(query_cond_value);
    let full_cond_list = this.fromQueryString();
    let cond_list = full_cond_list.filter((_, i) => i !== 0);
    let cond = full_cond_list[0] || {};
    let this_cond_type = cond.type;
    console.log(this.state);
    let cond_type_list = this.props.queryCondList.definelist;
    let add_icon = addable_conds.length > 0;
    let loader = null;
    if (this.state.loading) {
      loader = <Loading />;
    }
    let create_icon = this.props.toCreate ? (
      <a
        className="button is-large is-rounded is-success"
        style={{
          position: "absolute",
          bottom: "1em",
          right: "1em",
          height: "2.5em",
          width: "2.5em",
          zIndex: 11,
          overflow: "hidden",
          boxShadow: "0 0 6px #888"
        }}
        onClick={this.props.toCreate}
      >
        <Icon icon="plus" csize="large" isize="2x" color="white" />
      </a>
    ) : null;
    let show_buttons = this.state.focus || this.state.show_cond_types;
    return (
      <nav
        className="panel"
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowX: "hidden",
          overflowY: "hidden"
        }}
      >
        <div
          className="panel-block"
          style={{
            boxShadow: this.state.scrollTop === 0 ? null : "0 0 4px #888",
            flex: "0 0 auto"
          }}
        >
          <div className="control">
            <div className="control">
              <div className="field" style={{ display: "flex" }}>
                <div
                  className="control"
                  style={{
                    // display: this.state.show_cond_types ? 'none' : undefined,
                    width: show_buttons ? "0" : null
                  }}
                >
                  <a
                    className="button is-white"
                    onClick={e => {
                      e.stopPropagation();
                      this.props.setMenu();
                    }}
                  >
                    <Icon icon="bars" color="link" isize="lg" />
                    <span className="is-hidden-mobile">{err.menu}</span>
                  </a>
                </div>
                <div
                  className="control"
                  style={{
                    width: !!this.props.onBack && !show_buttons ? undefined : 0
                  }}
                >
                  <a
                    className="button is-white"
                    onClick={e => {
                      this.props.onBack();
                    }}
                  >
                    <Icon icon="arrow-left" color="link" isize="lg" />
                    <span className="is-hidden-mobile">{err.back}</span>
                  </a>
                </div>

                <div
                  className="field has-addons"
                  style={{ position: "relative", flexGrow: 1 }}
                >
                  {this_cond_type ? (
                    <p className="control">
                      <a
                        className="button is-primary"
                        onMouseDown={this.onSearch}
                        onClick={this.showHideCondPanel}
                      >
                        {this_cond_type.label}
                      </a>
                    </p>
                  ) : null}
                  <div
                    className={"control is-expanded has-icons-left"}
                    style={{ flexGrow: 1 }}
                  >
                    <input
                      {...(this_cond_type
                        ? {
                            type: getElementDefine(this_cond_type.type.define)
                              .type,
                            value: getElementDefine(
                              this_cond_type.type.define
                            ).fromValue(cond.value)
                          }
                        : { readOnly: true, value: "" })}
                      className={"input is-fullwidth"}
                      ref={ref => (this.searchbox = ref)}
                      onFocus={_ => {
                        console.log("onFocus");
                        this.setState({ focus: true });
                      }}
                      onBlur={_ => {
                        console.log("onBlur");
                        this.setState({ focus: false });
                      }}
                      onChange={v => {
                        this.toQueryString(
                          full_cond_list.map((cond, i) => {
                            if (i === 0) {
                              let val = Object.assign({}, cond);
                              val.value = getElementDefine(
                                cond.type.type.define
                              ).toChange(v.target.value);
                              return val;
                            } else {
                              return cond;
                            }
                          })
                        );
                      }}
                      style={
                        this.state.show_cond_types
                          ? {
                              borderBottomLeftRadius: 0,
                              borderBottomRightRadius: 0
                            }
                          : null
                      }
                    />
                    <Icon icon="search" csize="small" left />
                  </div>
                  <p className="control" onMouseDown={this.onSearch}>
                    <a
                      className={
                        "button" + (add_icon ? " is-primary" : " is-static")
                      }
                      onClick={e => {
                        e.preventDefault();
                        console.log("thiscondtype", this_cond_type);
                        if (add_icon) {
                          console.log(
                            "addable this_cond",
                            addable_conds,
                            this_cond_type
                          );
                          let new_cond_type =
                            addable_conds.find(v => v === this_cond_type) ||
                            addable_conds[0];
                          let new_cond_list = [
                            {
                              type: new_cond_type,
                              value: getElementDefine(
                                new_cond_type.type.define
                              ).toChange("")
                            }
                          ].concat(full_cond_list);
                          this.toQueryString(new_cond_list);
                        }
                      }}
                    >
                      <Icon icon="plus" csize="small" color="white" />
                    </a>
                  </p>

                  {this.state.show_cond_types &&
                  (cond_type_list.length > 1 || cond_list.length > 0) ? (
                    <div
                      className="box"
                      onMouseDown={this.onSearch}
                      style={{
                        ...(this.state.show_cond_types
                          ? {
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0
                            }
                          : null),
                        position: "absolute",
                        top: "100%",
                        width: "100%",
                        zIndex: 11,
                        overflow: "hidden"
                      }}
                    >
                      {addable_conds.length > 0 ? (
                        <div className="tags">
                          {addable_conds.map((v, i) => {
                            return (
                              <span
                                className={`tag is-${
                                  v === this_cond_type ? "info" : "light"
                                }`}
                                onClick={e => {
                                  let new_cond_list = full_cond_list.concat();
                                  new_cond_list[0] = {
                                    type: v,
                                    value: getElementDefine(
                                      v.type.define
                                    ).toChange("")
                                  };
                                  this.toQueryString(new_cond_list);
                                }}
                                key={i}
                              >
                                {v.label}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                      {cond_list.length > 0 ? (
                        <div className="tags">
                          {cond_list.map((v, i) => {
                            return (
                              <span
                                className="tag is-success"
                                key={i}
                                onClick={_ =>
                                  this.toQueryString(
                                    full_cond_list.filter(cond => cond !== v)
                                  )
                                }
                              >
                                {v.label}
                                <button className="delete is-small" />
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                      {this.state.auto_complete.length > 0 ? (
                        <div className="tags">
                          {this.state.auto_complete.map((v, i) => {
                            return (
                              <span
                                className="tag is-light"
                                key={i}
                                onClick={e => {
                                  //this.searchbox.focus();
                                  e.preventDefault();
                                  this.toQueryString(
                                    full_cond_list.map((cond, i) => {
                                      if (i === 0) {
                                        let val = Object.assign({}, cond);
                                        val.value = v;
                                        return val;
                                      } else {
                                        return cond;
                                      }
                                    })
                                  );
                                }}
                              >
                                {v}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="control">
                    <a
                      className="button is-link"
                      onMouseDown={
                        this.state.show_cond_types
                          ? this.onSearchBlur
                          : this.onSearchFocus
                      }
                      onClick={this.showHideCondPanel}
                    >
                      <Icon
                        icon={
                          this.state.show_cond_types
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        color="white"
                        isize="lg"
                      />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            overflowY: "scroll",
            overflowX: "hidden",
            userSelect: "none",
            flexGrow: 1,
            flexShrink: 1,
            alignItems: "end",
            justifyContent: "space-evenly",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gridAutoFlow: "row dense",
            gridGap: "0px",
            gridAutoRows: "3.5em"
          }}
          onScroll={e => {
            this.setState({
              scrollTop: e.target.scrollTop
            });
          }}
        >
          {Object.values(this.state.datas).map((v, i) => (
            <div
              key={v.id}
              style={{
                margin: "0.25em",
                padding: "0.25em",
                border: "1px solid hsl(171, 100%, 41%)",
                borderRadius: "4px",
                boxShadow: this.state.selected[v.id]
                  ? null
                  : "3px 3px 5px hsl(171, 100%, 41%)",
                backgroundColor: this.state.selected[v.id] ? "#DDD" : null
              }}
            >
              <RemoteItem
                router={this.props.router}
                page={this.props.page || this}
                selected={this.state.selected[v.id]}
                value={v}
                onChoose={
                  !!this.props.onChoose ? val => this.props.onChoose(val) : null
                }
                onSelect={
                  Array.isArray(this.props.actions) &&
                  this.props.actions.length > 0
                    ? _ => {
                        this.setState(
                          prev => ({
                            selected: Object.assign({}, prev.selected, {
                              [v.id]: !prev.selected[v.id]
                            })
                          }),
                          () => {
                            console.log("update popupmenu");
                            this.update_popupmenu();
                          }
                        );
                      }
                    : null
                }
              />
            </div>
          ))}
        </div>
        {loader}
        {create_icon}
      </nav>
    );
  }
}
export { QueryPanel, Querier };
