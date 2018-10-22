import TList from "./List";
import TStruct from "./Struct";
import TText, { VText, Phone, Email } from "./Text";
import TNumber, { I32, U32, I8, U8, I16, U16, Double } from "./Number";
import ReadOnly from "./ReadOnly";
import Option from "./Option";
import ImageView from "./Image";
import Password, { ConfirmPassword, ConfirmPasswordData } from "./Password";
import TEnum, { TBoolean } from "./Enum";
import { RemoteType } from "./RemoteView";
import { Querier } from "./Query";
import Router, { UrlCreater, UrlBuilder } from "./Router";
import MessageText from "./MessageText";
import RemoteObject from "./RemoteObject";
import { Infomation } from "./DataView";
import Hidden from "./Hidden";

let Types = {
  Text: TText,
  Phone: Phone,
  Email: Email,
  I32: I32,
  U32: U32,
  I8: I8,
  U8: U8,
  I16: I16,
  U16: U16,
  Double: Double,
  Boolean: TBoolean,
  Infomation: Infomation
};
let GeneralTypes = {
  List: TList,
  Struct: TStruct,
  Input: VText,
  Number: TNumber,
  ReadOnly: ReadOnly,
  Option: Option,
  Password: Password,
  Image: ImageView,
  ConfirmPassword: ConfirmPassword,
  Enum: TEnum,
  RemoteType: RemoteType,
  Hidden: Hidden
};
let Datas = {
  ConfirmPasswordData: ConfirmPasswordData,
  RemoteObject: RemoteObject
};
let Tools = {
  Querier: Querier,
  Router: Router,
  UrlCreater: UrlCreater,
  UrlBuilder: UrlBuilder
};
export { Types, GeneralTypes, Tools, Datas, MessageText };
