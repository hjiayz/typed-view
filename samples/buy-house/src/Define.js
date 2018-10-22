import React from "react";
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
  RemoteType,
  Hidden
} = GeneralTypes;
let { ConfirmPasswordData, RemoteObject } = Datas;

let { Querier, Router, UrlCreater, UrlBuilder } = Tools;

let base_url = process.env.PUBLIC_URL;
let { view_link, query_link, create_link, home_link } = UrlBuilder(
  base_url,
  UrlCreater
);

let Age = Number(20, 100, true);
let Sex = Enum(
  ["male", "female"],
  value => {
    if (value === "male") return "男";
    if (value === "female") return "女";
    return value;
  },
  value => {
    if (value === "男") return "male";
    if (value === "女") return "female";
    return value;
  }
);
let Person = Struct([
  { field: "name", label: "姓名", type: Text },
  { field: "age", label: "年龄", type: Age },
  { field: "gender", label: "性别", type: Sex },
  {
    field: "spouse",
    label: value => ({ male: "妻子", female: "丈夫" }[value.gender] || "配偶"),
    type: RemoteType("person")
  }
]);

let PersonInfomation = Struct([
  { field: "name", label: "姓名", type: ReadOnly(Text) },
  { field: "age", label: "年龄", type: ReadOnly(Age) },
  { field: "gender", label: "性别", type: ReadOnly(Sex) },
  {
    field: "spouse",
    label: value => ({ male: "妻子", female: "丈夫" }[value.gender] || "配偶"),
    type: ReadOnly(RemoteType("person"))
  },
  {
    field: "money",
    label: "现金",
    type: ReadOnly(U32)
  }
]);

let House = Struct([
  { field: "address", label: "位置", type: Text },
  { field: "size", label: "面积", type: U32 },
  { field: "value", label: "价格", type: U32 },
  {
    field: "owner",
    label: "所有者",
    type: ReadOnly(RemoteType("person"))
  },
  { field: "id", label: "编号", type: Hidden(Text) }
]);

const YourName = Input(
  async value => {
    if (typeof value !== "string") return "不是字符串";
    if (value.length === 0) return "名字不能为空";
    return true;
  },
  "text",
  value => {
    if (typeof value === "string") return value;
    return "";
  },
  value => {
    return String(value);
  },
  2000
);

let GameSize = Number(10, 100, true);

let NewGame = Struct([
  { field: "yourname", label: "你的名字", type: YourName },
  { field: "yourage", label: "你的年龄", type: Age },
  { field: "yourgender", label: "你的性别", type: Sex },
  { field: "housenumber", label: "房屋数量", type: GameSize },
  { field: "personnumber", label: "人口", type: GameSize }
]);

let chinese_name = () => {
  let result = [];
  result.push("赵钱孙李周吴郑王".codePointAt(parseInt(Math.random() * 8)));
  result.push("子非鱼安知鱼之乐".codePointAt(parseInt(Math.random() * 8)));
  result.push(parseInt(Math.random() * (0x9fa5 - 0x4e00)) + 0x4e00);
  return String.fromCodePoint(...result);
};

let address_name = () => {
  return (
    String.fromCodePoint(
      "赵钱孙李周吴郑王".codePointAt(parseInt(Math.random() * 8))
    ) +
    ["家", "城", "桥", "河"][parseInt(Math.random() * 4)] +
    ["湾", "庄", "新村", "小区", "山庄", "花园", "坑", "汤"][
      parseInt(Math.random() * 8)
    ]
  );
};

let newgame_config = {
  name: "newgame",
  createTitle: "新游戏",
  createStruct: NewGame,
  menuTitle: "新游戏",
  onCreate: v => {
    return new Promise((res, err) => {
      let persons = [
        {
          name: v.yourname,
          age: v.yourage,
          gender: v.yourgender,
          money: 0
        }
      ];
      for (let i = 0; i < v.personnumber - 1; i++) {
        let name = chinese_name();
        persons.push({
          name: name,
          age: parseInt(Math.random() * 50 + 20),
          gender: Math.random() > 0.5 ? "male" : "female",
          spouse: null,
          money: 0
        });
      }
      let address = {};
      for (let i = 0; i < parseInt(v.housenumber / 3); i++) {
        address[address_name()] = { value: Math.random() * 100000 + 5000 };
      }
      let address_keys = Object.keys(address);
      let houses = [];
      for (let i = 0; i < v.housenumber; i++) {
        houses.push({
          address: address_keys[parseInt(Math.random() * address_keys.length)],
          size: parseInt(Math.random() * 150 + 50),
          owner: parseInt(Math.random() * (v.personnumber - 1)) + 1
        });
      }
      window.localStorage.setItem(
        "game",
        JSON.stringify({ persons: persons, address: address, houses: houses })
      );
      res({
        url: view_link("0", "person"),
        message: "成功创建游戏"
      });
    });
  }
};

let person_config = {
  name: "person",
  viewStruct: PersonInfomation,
  viewTitle: "人物",
  menuTitle: "人物",
  onLoad: async id => {
    let data = load_data();
    if (!data) {
      return { name: "查无此人", age: 0, gender: "未知" };
    }
    console.log("load person", data.persons[id]);
    return data.persons[id];
  },
  onQuery: async p => {
    let data = load_data();
    console.log("游戏数据", data);
    data = data.persons;
    data = data.map((v, i) => Object.assign({}, v, { id: i }));
    if (typeof p.name === "string") {
      data = data.filter(v => v.name.indexOf(p.name) !== -1);
    }
    return data.map(
      ({ name, gender, id }) =>
        new RemoteObject(
          id.toString(),
          name + (gender === "male" ? "先生" : "女士"),
          "person"
        )
    );
  },
  batchActions: [],
  actionList: [],
  queryCondList: Querier([
    {
      type: Text,
      field: "name",
      label: "姓名",
      getTag: v => "姓名:" + v,
      autoComplete: async v => []
    }
  ]),
  errorMessage: {}
};
let house_config = {
  name: "house",
  viewStruct: House,
  viewTitle: "房屋",
  menuTitle: "房屋",
  onLoad: async id => {
    let data = load_data();
    let house = { ...data.houses[id] };
    let persons = data.persons;
    house.value = parseInt(data.address[house.address].value * house.size, 10);
    house.id = id;
    let owner = persons[house.owner];
    house.owner = new RemoteObject(
      house.owner.toString(),
      owner.name + (owner.gender === "male" ? "先生" : "女士"),
      "person"
    );
    return house;
  },
  onQuery: async p => {
    let data = load_data();
    console.log("游戏数据", data);
    let houses = data.houses;
    houses = houses.map((v, i) => ({ ...v, id: i }));
    if (typeof p.address === "string") {
      houses = houses.filter(v => v.address.indexOf(p.address) !== -1);
    }
    if (typeof p.owner === "string") {
      let persons = data.persons;
      if (!Array.isArray(persons)) {
        return [];
      }
      houses = houses.filter(v => persons[v.owner].name === p.owner);
    }
    return houses.map(
      ({ address, size, owner, id }) =>
        new RemoteObject(id.toString(), address + `(${size}平)`, "house")
    );
  },
  batchActions: [],
  actionList: [
    {
      title: "看门",
      readOnly: true,
      action: async v => {
        let cash = 100;
        let data = load_data();
        let you = data.persons[0];
        you.money += cash;
        console.log("you", you);
        make_data(data);
        return {
          message: `在人来人往的一天后，你收到了${cash}元报酬`,
          url: view_link(v.id, "house")
        };
      }
    }
  ],
  queryCondList: Querier([
    {
      type: Text,
      field: "address",
      label: "地址",
      getTag: v => "地址:" + v,
      autoComplete: async v => []
    },
    {
      type: Text,
      field: "owner",
      label: "所有者",
      getTag: v => "所有者:" + v,
      autoComplete: async p => {
        let data = load_data();
        console.log("游戏数据", data);
        data = data.persons;
        data = data.map((v, i) => Object.assign({}, v, { id: i }));
        if (typeof p.name === "string") {
          data = data.filter(v => v.name.indexOf(p.name) !== -1);
        }
        return data.map(({ name }) => name);
      }
    }
  ]),
  errorMessage: {}
};

export default [newgame_config, person_config, house_config];

function load_data() {
  return JSON.parse(window.localStorage.getItem("game"));
}
function make_data(data) {
  let result = [];
  let { persons, address, houses } = data;
  let money_sum = 0;
  for (let person of persons) {
    person.money += 100; //工资收入
    money_sum += person.money;
  }
  let cost_day = money_sum / 3650; //钱可以用10年;
  let rental_day = cost_day * 0.5; //一半的钱交租金
  let value_sum = 0;
  let size_sum = 0;
  for (let house of houses) {
    size_sum += house.size;
    value_sum += house.size * address[house.address].value;
  }
  for (let house of houses) {
    let owner = persons[house.owner];
    let rental =
      (rental_day * house.size * address[house.address].value) / value_sum;
    owner.money = parseInt(owner.money + rental, 10); //收租金
  }
  let cost_person = (rental_day * 50) / size_sum; //设50米的平均租金等于每月花费
  console.log(
    "cost_person",
    money_sum,
    cost_day,
    value_sum,
    size_sum,
    rental_day,
    cost_person
  );
  let no_house = 0;
  for (let person of persons) {
    if (person.money > cost_person) {
      person.money = parseInt(person.money - cost_person, 10);
    } else {
      no_house++;
      if (Math.random() > 0.5) {
        //睡天桥被盗概率
        person.money = 0;
      } else {
        person.money = parseInt(person.money / 2); //省吃俭用
      }
    }
  }
  console.log("睡天桥人数", no_house);
  let address_keys = Object.keys(address);
  for (let name in address) {
    let old = address[name].value;
    let sign = Math.random() > no_house / persons.length ? 1 : -1;
    let change = Math.random() / (Math.random() * 100 < 1 ? 10 : 100000);
    let newvalue = old * (1 + change * sign);
    address[name].value = newvalue;
    if (change > 0.01) {
      result.push(
        `${name}暴${sign > 0 ? "涨" : "跌"}百分之${parseInt(change * 100, 10)}`
      );
    }
  }
  window.localStorage.setItem("game", JSON.stringify(data));
  console.log(JSON.stringify(result));
  return result;
}
