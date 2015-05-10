var React = require("react");
var Slide2dEditor = require("..");

const initialValue = {
  "background": "#ddd",
  "size": [ 600, 400 ],
  "draws": [
    { fillStyle: "#000", font: "bold 40px monospace", textBaseline: "top", textAlign: "start" },
    ["fillText", "Hello World", 100, 100, 40]
  ]
};

class App extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.state = {
      value: initialValue
    };
  }
  onChange (value) {
    this.setState({ value });
  }
  onEdit (e) {
    try {
      this.onChange(JSON.parse(e.target.value));
    }
    catch (err) {
      console.error(err);
    }
  }
  render () {
    const { value } = this.state;
    return <div>
      <Slide2dEditor
        width={600}
        height={440}
        value={value}
        onChange={this.onChange} />
      <textarea
        style={{ width: "300px", height: "434px", fontFamily: "monospace" }}
        onChange={this.onEdit}
        value={JSON.stringify(value, null, 2)} />
    </div>;
  }
}

React.render(<App />, document.body);
