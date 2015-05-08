import React from "react";
import Color from "color";
import cloneDeep from "lodash/lang/cloneDeep";
import clone from "lodash/lang/clone";
import Slide2d from "slide2d";
import objectAssign from "object-assign";
import * as core from "./core";
import * as vec2 from "./vec2";

const Shapes = {
  TEXT: "text"
};

function shapeOperation (op) {
  switch (op[0]) {
    case "fillText":
    case "strokeText":
      return Shapes.TEXT;
  }
}

function initialShapeForItem (/*item, data*/) {
  return [
    { fillStyle: "#000", font: "normal 40px Arial" },
    [ "fillText", "Text", 10, 10, 40 ]
  ];
}

const toolbarHeight = 40;

class ToolbarGroup extends React.Component {
  render () {
    const {
      children
    } = this.props;
    const style = {
      margin: "0 2px",
      padding: "0 2px",
      borderLeft: "1px solid #bbb",
      display: "inline-block",
      verticalAlign: "top"
    };
    return <div style={style}>{children}</div>;
  }
}

class ToolbarToggleButton extends React.Component {
  constructor (props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onHoverEnter = this.onHoverEnter.bind(this);
    this.onHoverLeave = this.onHoverLeave.bind(this);
    this.state = {
      hover: false
    };
  }
  onHoverEnter () {
    this.setState({
      hover: true
    });
  }
  onHoverLeave () {
    this.setState({
      hover: false
    });
  }
  onClick (e) {
    const { onChange } = this.props;
    e.preventDefault();
    if (onChange) onChange();
  }
  render () {
    const {
      hover
    } = this.state;
    const {
      icon,
      title,
      active
    } = this.props;
    const style = {
      verticalAlign: "top",
      fontSize: "24px",
      padding: "8px",
      color: active ? "#000" : "#999",
      background: hover ? "#fff" : "#eee"
    };
    return <i
      title={title}
      className={"fa fa-"+icon}
      style={style}
      onClick={this.onClick}
      onMouseEnter={this.onHoverEnter}
      onMouseLeave={this.onHoverLeave}
    ></i>;
  }
}

class ToolbarFontSize extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange (e) {
    this.props.onChange(parseInt(e.target.value, 10));
  }
  render () {
    const {
      value
    } = this.props;
    const style = {
      verticalAlign: "top",
      fontSize: "24px",
      width: "50px",
      height: "24px",
      padding: "6px",
      color: "#000",
      background: "#fff",
    };
    return <input style={style} type="number" min="4" max="100" step="1" value={value} onChange={this.onChange} />;
  }
}

class ToolbarFontFamily extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange (e) {
    this.props.onChange(e.target.value);
  }
  render () {
    const {
      value,
      width
    } = this.props;
    const style = {
      verticalAlign: "top",
      fontSize: "14px",
      fontFamily: value,
      lineHeight: "24px",
      width: width+"px",
      height: "24px",
      padding: "6px",
      color: "#000",
      background: "#fff",
    };
    return <input style={style} type="text" value={value} onChange={this.onChange} />;
  }
}

class ToolbarColor extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange (e) {
    this.props.onChange(e.target.value);
  }
  render () {
    const {
      value
    } = this.props;
    const style = {
      width: "24px",
      height: "24px",
      padding: "8px"
    };
    return <input style={style} type="color" value={Color(value || "#000000").hexString()} onChange={this.onChange} />;
  }
}

class ToolbarRatio extends React.Component {
  choices () {
    return this.props.choices; // default
  }
  render () {
    const {
      value,
      onChange
    } = this.props;
    const group = this.choices().map(choice => {
      const active = !choice.value ?
        choice.values.indexOf(value)!==-1 :
        value === choice.value;
      const val = choice.value || choice.values[0];
      return <ToolbarToggleButton
        key={choice.icon}
        icon={choice.icon}
        active={active}
        onChange={onChange.bind(null, val)}
      />;
    });
    return <ToolbarGroup>{group}</ToolbarGroup>;
  }
}

class ToolbarTextAlign extends ToolbarRatio {
  choices () {
    return [
      { icon: "align-left", values: ["left", "start"] },
      { icon: "align-center", value: "center" },
      { icon: "align-right", values: ["right", "end"] }
    ];
  }
}

function serializeFont (style) {
  const {
    bold,
    italic,
    size,
    family
  } = style;
  let font = [
    bold ? "bold" : "",
    italic ? "italic" : "",
    size ? size+"px" : "",
    family
  ].filter(function (v) {
    return v;
  }).join(" ");
  return font;
}
function deserializeFont (font) {
  const span = document.createElement("span");
  span.style.font = font;
  const {
    fontWeight,
    fontStyle,
    fontSize,
    fontFamily
  } = span.style;
  const extract = fontSize.match(/([0-9]+)px/);
  return {
    bold: fontWeight==="bold",
    italic: fontStyle==="italic",
    size: extract && parseInt(extract[1], 10) || 12,
    family: fontFamily
  };
}

class TextToolbar extends React.Component {
  constructor (props) {
    super(props);
  }
  setFontProp (name, value) {
    const styles = clone(this.props.styles);
    const font = deserializeFont(styles.font);
    font[name] = value;
    styles.font = serializeFont(font);
    // TODO in case of size, the line-height should be in sync
    this.props.onChange(styles);
  }
  setStyle (name, value) {
    const styles = clone(this.props.styles);
    styles[name] = value;
    this.props.onChange(styles);
  }
  render () {
    const {
      styles
    } = this.props;
    const font = deserializeFont(styles.font);
    return <div>
      <ToolbarToggleButton
        title="Bold"
        icon="bold"
        active={font.bold}
        onChange={this.setFontProp.bind(this, "bold", !font.bold)} />
      <ToolbarToggleButton
        title="Italic"
        icon="italic"
        active={font.italic}
        onChange={this.setFontProp.bind(this, "italic", !font.italic)} />
      <ToolbarColor
        value={styles.fillStyle}
        onChange={this.setStyle.bind(this, "fillStyle")} />
      <ToolbarFontSize
        value={font.size}
        onChange={this.setFontProp.bind(this, "size")} />
      <ToolbarFontFamily
        value={font.family}
        onChange={this.setFontProp.bind(this, "family")}
        width={120} />
      <ToolbarTextAlign
        value={styles.textAlign}
        onChange={this.setStyle.bind(this, "textAlign")} />
    </div>;
  }
}

class MainToolbar extends React.Component {
  render () {
    const {
      data,
      alterData,
      createItem
    } = this.props;
    return <div>
      <ToolbarToggleButton
        title="new Text"
        icon="font"
        active={false}
        onChange={createItem.bind(null, Shapes.TEXT)} />
      <ToolbarColor
        value={data.background}
        onChange={alterData.bind(null, "background")} />
    </div>;
  }
}

class Toolbar extends React.Component {
  render () {
    const {
      width,
      edit,
      data,
      createItem,
      alterStyle,
      alterData
    } = this.props;
    const style = {
      display: "inline-block",
      width: width + "px",
      height: toolbarHeight + "px",
      background: '#eee'
    };
    let toolbar;
    if (edit === -1) {
      toolbar =
      <MainToolbar
        data={data}
        alterData={alterData}
        createItem={createItem} />;
    }
    else {
      let shape = shapeOperation(data.draws[edit]);
      if (shape === Shapes.TEXT) {
        toolbar =
        <TextToolbar
          styles={core.getCanvasStyles(data, edit)}
          onChange={alterStyle.bind(null, edit)} />;
      }
    }

    return <div style={style}>{toolbar}</div>;
  }
}

class Viewport extends React.Component {
  componentDidMount () {
    const canvas = React.findDOMNode(this);
    const ctx = canvas.getContext("2d");
    this.slide2d = Slide2d(ctx);
    this.slide2d.render(this.props.data);
  }
  componentWillUpdate (props) {
    this.slide2d.render(props.data);
  }
  render () {
    const {
      width,
      height
    } = this.props;
    const dpr = 1;//window.devicePixelRatio || 1;
    const fullWidth = width * dpr;
    const fullHeight = height * dpr;
    const style = {
      position: "absolute",
      top: 0,
      left: 0,
      width: width + "px",
      height: height + "px"
    };
    return <canvas style={style} width={fullWidth} height={fullHeight}></canvas>;
  }
}

class TextEditor extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  componentDidMount () {
    const input = React.findDOMNode(this);
    input.focus();
  }
  onChange (e) {
    e.preventDefault();
    const copy = clone(this.props.value);
    copy[1] = e.target.value;
    this.props.onChange(copy);
  }
  fromCanvasStyles (styles, lineHeight) {
    const {
      font,
      fillStyle: color,
      textAlign
    } = styles;
    return {
      font,
      color,
      textAlign,
      lineHeight: lineHeight + "px"
    };
  }
  render () {
    const {
      value,
      canvasStyles,
      bound,
      scale
    } = this.props;
    const style = objectAssign(
      this.fromCanvasStyles(canvasStyles, value[4]), {
        padding: 0,
        border: "none",
        outline: "1px solid red",
        background: "transparent",
        position: "absolute",
        top: 0,
        left: 0,
        width: Math.max(10, Math.round(bound[2]))+"px",
        height: Math.round(bound[3])+"px",
        transform: "scale("+scale+") translate("+bound[0]+"px,"+bound[1]+"px)",
        overflow: "hidden",
        resize: "none"
    });
    return <textarea style={style} value={value[1]} onChange={this.onChange} />;
  }
}

class ViewportEditor extends React.Component {
  constructor (props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.state = {
      down: null
    };
  }
  positionForEvent (e) {
    const rect = React.findDOMNode(this).getBoundingClientRect();
    return [
      e.clientX - rect.left,
      e.clientY - rect.top
    ];
  }
  onMouseDown (e) {
    const isTextArea = e.target.nodeName === "TEXTAREA";
    if (!isTextArea)
      e.preventDefault();
    const slide2d = this.refs.viewport && this.refs.viewport.slide2d;
    const data = cloneDeep(this.props.data);
    const pos = this.positionForEvent(e);
    const target = core.findItemByPosition(slide2d, data, pos);
    const down = { target, data, pos, isTextArea };
    this.setState({ down });
  }
  onMouseMove (e) {
    const down = this.state.down;
    if (down && down.target!==-1) {
      if (down.hasLeavedTextArea) {
        const pos = this.positionForEvent(e);
        const delta = vec2.diff(pos, down.pos);
        this.props.alterDraw(down.target, core.translateDraw(down.data.draws[down.target], delta));
      }
      else {
        if (e.target.nodeName !== "TEXTAREA") {
          down.hasLeavedTextArea = true;
          this.setState({ down });
        }
      }
    }
  }
  onMouseUp (e) {
    const down = this.state.down;
    if (down) {
      if (!down.isTextArea) {
        const pos = this.positionForEvent(e);
        const delta = vec2.diff(pos, down.pos);
        const dist = vec2.length(delta);
        if (dist <= 2) {
          this.props.setEdit(down.target);
        }
      }
      this.setState({
        down: null
      });
    }
  }
  render () {
    const {
      width,
      height,
      data,
      edit,
      alterDraw
    } = this.props;
    const {
      down
    } = this.state;
    const style = {
      position: "relative",
      display: "inline-block",
      width: width + "px",
      height: height + "px"
    };
    const mouseEvents = {
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      onMouseMove: this.onMouseMove
    };

    const contentStyle = {
      position: "absolute",
      left: 0,
      top: 0,
      width: style.width,
      height: style.height
    };

    const renderData = clone(data);
    const renderDraws = renderData.draws = clone(renderData.draws);

    let content;
    const slide2d = this.refs.viewport && this.refs.viewport.slide2d;

    if (edit !== -1) {
      const object = data.draws[edit];
      const styles = core.getCanvasStyles(data, edit);
      let bound = core.computeBound(slide2d, object, styles);
      const P = core.Position(slide2d, data);
      const scale = P.getScale();
      if (shapeOperation(object) === Shapes.TEXT) {
        // Text should disappear when edited
        renderDraws.splice(edit, 1);

        content = <TextEditor
          value={object}
          onChange={alterDraw.bind(null, edit)}
          bound={P.applyBound(bound)}
          scale={scale}
          canvasStyles={styles} />;
      }
    }

    if (down && down.target !== -1 && (!down.isTextArea || down.hasLeavedTextArea)) {
      const {target} = down;
      let bound = core.computeBound(slide2d, data.draws[target], core.getCanvasStyles(data, target));
      renderDraws.push({
        fillStyle: "rgba(255,0,0,0.2)",
        strokeStyle: "rgba(255,0,0,1)",
        lineWidth: 1
      });
      renderDraws.push([ "fillRect" ].concat(bound));
      renderDraws.push([ "strokeRect" ].concat(bound));
    }

    return <div {...mouseEvents} style={style}>
      <Viewport ref="viewport" width={width} height={height} data={renderData} />
      <div style={contentStyle}>
        {content}
      </div>
    </div>;
  }
}

export default class Slide2dEditor extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      edit: -1 // The index of the draws object that is currently edited
    };
    this.setEdit = this.setEdit.bind(this);
    this.alterStyle = this.alterStyle.bind(this);
    this.alterDraw = this.alterDraw.bind(this);
    this.createItem = this.createItem.bind(this);
    this.alterData = this.alterData.bind(this);
  }

  setEdit (edit) {
    this.setState({ edit });
  }

  createItem (type) {
    const {
      value,
      onChange
    } = this.props;
    let copy = clone(value);
    copy.draws = clone(copy.draws).concat(initialShapeForItem(type, value));
    const edit = copy.draws.length - 1;
    onChange(copy);
    this.setState({ edit });
  }

  alterData (key, val) {
    const {
      value,
      onChange
    } = this.props;
    let copy = clone(value);
    copy[key] = val;
    onChange(copy);
  }

  alterStyle (index, styles) {
    const {
      value,
      onChange
    } = this.props;
    let copy = clone(value);
    copy.draws = clone(copy.draws);
    copy.draws[index-1] = styles;
    const target = copy.draws[index] = clone(copy.draws[index]);
    if (shapeOperation(target) === Shapes.TEXT) {
      target[4] = deserializeFont(styles.font).size;
    }
    // TODO: we need to apply styles simplification pass.
    onChange(copy);
  }

  alterDraw (index, draw) {
    const {
      value,
      onChange
    } = this.props;
    let copy = clone(value);
    copy.draws = clone(copy.draws);
    copy.draws[index] = draw;
    onChange(copy);
  }

  render() {
    const {
      width,
      height,
      value
    } = this.props;
    const state = this.state;
    const style = {
      display: "inline-block",
      width: width + "px",
      height: height + "px"
    };
    return <div style={style}>
      <Toolbar
        {...state}
        width={width}
        data={value}
        createItem={this.createItem}
        alterStyle={this.alterStyle}
        alterData={this.alterData} />
      <ViewportEditor
        {...state}
        width={width}
        height={height-toolbarHeight}
        data={value}
        setEdit={this.setEdit}
        alterDraw={this.alterDraw} />
    </div>;
  }

}

const PropTypes = React.PropTypes;
Slide2dEditor.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func
};
