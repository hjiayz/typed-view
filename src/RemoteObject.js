import DataObject from "./DataObject";
export default class RemoteObject extends DataObject {
  constructor(id, name, type) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
  }
  valueOf() {
    return this.id;
  }
  toJson() {
    return this.id;
  }
  clone() {
    return new RemoteObject(this.id, this.name, this.type);
  }
  static is(value) {
    if (value instanceof RemoteObject && typeof value.id === "string")
      return true;
    return false;
  }
}
