import React from "react";
import Color from "color";
import cloneDeep from "lodash/lang/cloneDeep";
import clone from "lodash/lang/clone";
import Slide2d from "slide2d";
import objectAssign from "object-assign";
import Slide2dMeta from "./Slide2dMeta";
import * as core from "./core";
import * as vec2 from "./vec2";

const Shapes = {
  TEXT: "text",
  RECT: "rect"
};

function shapeOperation (op) {
  switch (op[0]) {
    case "fillText":
    case "strokeText":
      return Shapes.TEXT;
    case "rect":
    case "fillRect":
    case "strokeRect":
      return Shapes.RECT;
  }
}

function initialShapeForItem (type) {
  switch (type) {
    case Shapes.TEXT:
    return [
      {},
      [ "fillText", "Text", 10, 10, 40 ]
    ];
    case Shapes.RECT:
    return [
      {},
      [ "fillRect", 10, 10, 40, 40 ]
    ]
  }
}

const toolbarHeight = 40;

class ToolbarGroup extends React.Component {
  render () {
    const {
      children,
      float
    } = this.props;
    const style = {
      display: "inline-block",
      verticalAlign: "top",
      float: float || "none"
    };
    return <div style={style}>{children}</div>;
  }
}

class ToolbarButton extends React.Component {
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
    const { onChange, disabled } = this.props;
    e.preventDefault();
    if (!disabled && onChange) onChange();
  }
  render () {
    const {
      hover
    } = this.state;
    const {
      icon,
      title,
      disabled
    } = this.props;
    const style = {
      verticalAlign: "top",
      fontSize: "24px",
      padding: "8px",
      color: disabled ? "#ccc" : "#000",
      background: disabled ? "#eee" : (hover ? "#fff" : "#eee")
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
    return <input style={style} type="number" min="4" max="99" step="1" value={value} onChange={this.onChange} />;
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

class ToolbarSize extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange () {
    const vals = [0,1].map(function (i) {
      return React.findDOMNode(this.refs[i]).value;
    }, this);
    this.props.onChange(vals);
  }
  render () {
    const {
      value
    } = this.props;
    const style = {
      display: "inline-block",
      verticalAlign: "top",
      border: "1px solid #ccc"
    };
    const inputStyle = {
      verticalAlign: "top",
      width: "40px",
      height: "32px",
      lineHeight: "32px",
      padding: "0px 2px",
      margin: 0,
      border: 0
    };

    const inputs = [0, 1].map(function (i) {
      return <input
        key={i}
        ref={i}
        style={inputStyle}
        type="number"
        value={value[i]}
        onChange={this.onChange}
      />;
    }, this);

    return <div style={style}>{inputs}</div>;
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

class RectToolbar extends React.Component {
  setStyle (name, value) {
    const styles = clone(this.props.styles);
    styles[name] = value;
    this.props.onStylesChange(styles);
  }
  onSizeChange (size) {
    const draw = clone(this.props.draw);
    draw[3] = size[0];
    draw[4] = size[1];
    this.props.onDrawChange(draw);
  }
  render () {
    const {
      styles,
      draw
    } = this.props;
    return <div>
      <ToolbarColor
        value={styles.fillStyle}
        onChange={this.setStyle.bind(this, "fillStyle")} />
      <ToolbarGroup>
        <ToolbarSize
          value={draw.slice(3, 5)}
          onChange={this.onSizeChange.bind(this)} />
      </ToolbarGroup>
    </div>;
  }
}

class TextToolbar extends React.Component {
  setFontProp (name, value) {
    const styles = clone(this.props.styles);
    const font = core.deserializeFont(styles.font);
    font[name] = value;
    styles.font = core.serializeFont(font);
    // TODO in case of size, the line-height should be in sync
    this.props.onStylesChange(styles);
  }
  setStyle (name, value) {
    const styles = clone(this.props.styles);
    styles[name] = value;
    this.props.onStylesChange(styles);
  }
  render () {
    const {
      styles
    } = this.props;
    const font = core.deserializeFont(styles.font);
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
      <ToolbarButton
        title="new Text"
        icon="font"
        onChange={createItem.bind(null, Shapes.TEXT)} />
      <ToolbarButton
        title="new Rectangle"
        icon="square-o"
        onChange={createItem.bind(null, Shapes.RECT)} />
      <ToolbarButton
        icon="circle-o"
        disabled={true}
        onChange={createItem.bind(null, Shapes.CIRCLE)} />
      <ToolbarButton
        icon="picture-o"
        disabled={true}
        onChange={createItem.bind(null, Shapes.PICTURE)} />
      <ToolbarGroup float="right">
        <ToolbarColor
          value={data.background}
          onChange={alterData.bind(null, "background")} />
      </ToolbarGroup>
    </div>;
  }
}

const ToolbarPerType = {
  [Shapes.TEXT]: TextToolbar,
  [Shapes.RECT]: RectToolbar
};

class Toolbar extends React.Component {
  render () {
    const {
      width,
      edit,
      data,
      meta,
      createItem,
      alterStyle,
      alterData,
      alterDraw
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
      let draw = data.draws[edit];
      let shape = shapeOperation(draw);
      let T = ToolbarPerType[shape];
      toolbar =
        <T
          draw={draw}
          onDrawChange={alterDraw.bind(null, edit)}
          styles={meta.getMeta([ edit ]).styles}
          onStylesChange={alterStyle.bind(null, edit)} />;
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
    const dpr = window.devicePixelRatio || 1;
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
      styles,
      bound,
      matrix
    } = this.props;
    const style = objectAssign(
      this.fromCanvasStyles(styles, value[4]), {
        padding: 0,
        border: "none",
        outline: "none",
        background: "transparent",
        position: "absolute",
        left: bound[0],
        top: bound[1],
        width: Math.max(10, Math.round(bound[2]))+"px",
        height: Math.round(bound[3])+"px",
        transform: "matrix("+matrix+")",
        overflow: "hidden",
        resize: "none"
    });
    return <textarea style={style} value={value[1]} onChange={this.onChange} />;
  }
}

class RectEditor extends React.Component {
  render () {
    const {
      value
    } = this.props;
    const style = objectAssign(
      core.boundStyle(value.slice(1)), {
      outline: "2px dotted #f00"
    });
    return <div style={style}></div>;
  }
}

class ViewportEditor extends React.Component {
  constructor (props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.state = {
      down: null,
      hover: null
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
    const meta = this.props.meta;
    const isTextArea = e.target.nodeName === "TEXTAREA";
    if (!isTextArea)
      e.preventDefault();
    const data = cloneDeep(this.props.data);
    const pos = this.positionForEvent(e);
    const t = meta.findByPosition(pos);
    const target = t ? t[0] : -1; // FIXME
    const down = { target, data, pos, isTextArea };
    this.setState({ down, hover: null });
  }
  onMouseMove (e) {
    const meta = this.props.meta;
    const down = this.state.down;
    const pos = this.positionForEvent(e);
    if (down && down.target!==-1) {
      if (down.hasLeavedTextArea) {
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
    if (!down) {
      const t = meta.findByPosition(pos);
      const target = t ? t[0] : -1; // FIXME
      const hover = {
        target: target
      };
      this.setState({ hover });
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
  onMouseLeave () {
    this.setState({
      down: null,
      hover: null
    });
  }
  render () {
    const {
      width,
      height,
      data,
      edit,
      alterDraw,
      meta
    } = this.props;
    const {
      down,
      hover
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
      onMouseMove: this.onMouseMove,
      onMouseLeave: this.onMouseLeave
    };

    const contentStyle = {
      position: "absolute",
      left: 0,
      top: 0,
      width: style.width,
      height: style.height
    };

    const overlayStyle = {
      position: "absolute",
      top: 0,
      left: 0,
    };

    const renderData = clone(data);
    const renderDraws = renderData.draws = clone(renderData.draws);

    let content;

    if (edit !== -1) {
      const object = data.draws[edit];
      let m = meta.getMeta([ edit ]);

      switch (shapeOperation(object)) {
        case Shapes.TEXT:
        // Text should disappear when edited
        renderDraws.splice(edit, 1);
        objectAssign(overlayStyle, core.boundStyle(m.bound), {
          outline: "1px solid #f00"
        });

        content = <TextEditor
          value={object}
          onChange={alterDraw.bind(null, edit)}
          bound={m.bound}
          matrix={m.matrix}
          styles={m.styles} />;
        break;

        case Shapes.RECT:
        content = <RectEditor
          value={object}
          styles={m.styles} />;
      }
    }

    if (down && down.target !== -1 && (!down.isTextArea || down.hasLeavedTextArea)) {
      let {target} = down;
      let { bound } = meta.getMeta([ target ]);
      objectAssign(overlayStyle, core.boundStyle(bound), {
        background: "rgba(255,0,0,0.2)",
        border: "1px solid rgba(255,0,0,1)"
      });
    }

    if (hover && hover.target !== -1 && (edit === -1 || edit !== hover.target)) {
      let {target} = hover;
      let { bound } = meta.getMeta([ target ]);
      objectAssign(overlayStyle, core.boundStyle(bound), {
        border: "1px solid rgba(255,0,0,1)"
      });
      style.cursor = "pointer";
    }

    return <div {...mouseEvents} style={style}>
      <Viewport width={width} height={height} data={renderData} />
      <div style={overlayStyle}></div>
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

    this.meta = new Slide2dMeta(props.width, props.height-toolbarHeight, props.value);
  }
  componentWillUpdate (props) {
    if (
      this.meta.width !== props.width ||
      this.meta.height !== props.height ||
      this.meta.data !== props.data)
      this.meta = new Slide2dMeta(props.width, props.height-toolbarHeight, props.value);
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
    const target = copy.draws[index] = clone(copy.draws[index]);
    if (shapeOperation(target) === Shapes.TEXT) {
      target[4] = core.deserializeFont(styles.font).size;
    }

    copy.draws[index-1] = styles;
    core.simplifyStylesAt(copy, index-1);

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
        meta={this.meta}
        createItem={this.createItem}
        alterStyle={this.alterStyle}
        alterData={this.alterData}
        alterDraw={this.alterDraw} />
      <ViewportEditor
        {...state}
        width={width}
        height={height-toolbarHeight}
        data={value}
        meta={this.meta}
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
