var React = require("react");
var Slide2dEditor = require("..");

const initialValue = {
  "background": "#ddd",
  "size": [ 800, 400 ],
  "draws": [
    { fillStyle: "#000", font: "bold 40px monospace", textBaseline: "top", textAlign: "start" },
    ["fillText", "Hello World", 400, 100, 40]
  ]
};

React.render(<Slide2dEditor
  width={800}
  height={440}
  defaultValue={initialValue} />, document.body);
