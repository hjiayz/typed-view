let viewStyle = {
  flex: "1 0 280px",
  margin: "0.25em",
  padding: "0.25em",
  border: "1px solid hsl(171, 100%, 41%)",
  height: "6em",
  borderRadius: "4px",
  boxShadow: "3px 3px 5px hsl(171, 100%, 41%)"
};
let boldViewStyle = {
  flex: "1 0 51%",
  margin: "0.25em",
  padding: "0.25em",
  border: "1px solid hsl(171, 100%, 41%)",
  borderRadius: "4px",
  alignItems: "end",
  justifyContent: "space-evenly",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gridAutoFlow: "row dense",
  gridGap: "0px",
  gridAutoRows: "7em"
};

let labelStyle = {
  backgroundColor: "hsl(171, 100%, 41%)",
  color: "white",
  borderRadius: "4px 15px 8px 4px",
  width: "auto",
  display: "inline-block",
  padding: "0px 14px 0px 8px",
  boxShadow: "1px 1px 6px #888888"
};
export { viewStyle, boldViewStyle, labelStyle };
