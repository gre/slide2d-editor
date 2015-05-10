//import slide2d from "slide2d";
import objectAssign from "object-assign";
import clone from "lodash/lang/clone";
import { styles as initialCanvasStyles } from "./context2d";

export function serializeFont (style) {
  const {
    bold,
    italic,
    size,
    family
  } = style;
  let font = [
    bold ? "bold" : "",
    italic ? "italic" : "",
    (size || 12)+"px",
    family || "serif"
  ].filter(function (v) {
    return v;
  }).join(" ");
  return font;
}

export function deserializeFont (font) {
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


// all the styles of a given index in the data draws
export function getCanvasStyles (data, index) {
  const styles = objectAssign({}, initialCanvasStyles);
  for (var i=0; i<index; ++i) {
    var draw = data.draws[i];
    if (typeof draw === "object") {
      objectAssign(styles, draw);
    }
  }
  return styles;
}

export function simplifyStylesAt (data, index) {
  const stylesContext = getCanvasStyles(data, index);
  const styles = data.draws[index];
  const newStyles = {};
  for (let k in styles) {
    if (stylesContext[k] !== styles[k]) {
      newStyles[k] = styles[k];
    }
  }
  data.draws[index] = newStyles;
}

export function estimateTextHeight (ctx) {
  return ctx.measureText("–").width;
}

export function boundStyle (bound) {
  return {
    position: "absolute",
    left: Math.round(bound[0])+"px",
    top: Math.round(bound[1])+"px",
    width: Math.round(bound[2])+"px",
    height: Math.round(bound[3])+"px"
  };
}

export function translateDraw (draw, v) {
  const copy = clone(draw);
  switch (draw[0]) {
    case "fillText":
    case "strokeText":
    copy[2] += v[0];
    copy[3] += v[1];
    break;
    case "rect":
    case "fillRect":
    case "strokeRect":
    copy[1] += v[0];
    copy[2] += v[1];

    // TODO other shapes
  }
  return copy;
}

/*

export function normalizeData (data) {
  const obj = objectAssign({}, slide2d.defaults, cloneDeep(data));
  obj.draws.forEach(function (draw, i) {
    if (!(draw instanceof Array)) {
      simplifyStylesAt(obj, i);
    }
  });
  return obj;
}

function truncateDrawsInPlace (draws, path) {
  if (path.length === 0) return draws;
  const i = path[0];
  draws.splice(0, i+1);
  truncateDrawsInPlace(draws[i], path.slice(1));
}

export function truncate (data, path) {
  const copy = cloneDeep(data);
  truncateDrawsInPlace(copy.draws, path);
  return copy;
}
*/
