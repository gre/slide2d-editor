import objectAssign from "object-assign";
import clone from "lodash/lang/clone";
import * as vec2 from "./vec2";

export function translateDraw (draw, v) {
  const copy = clone(draw);
  switch (draw[0]) {
    case "fillText":
    case "strokeText":
    copy[2] += v[0];
    copy[3] += v[1];
    break;
    // TODO other shapes
  }
  return copy;
}

const initialCanvasStyles = (() => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const styles = {};
  for (var k in ctx) {
    if (k.indexOf("webkit") !== -1) continue;
    const typ = typeof ctx[k];
    if (typ !== "object" && typ !== "function") {
      styles[k] = ctx[k];
    }
  }
  return styles;
})();

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

export function estimateTextHeight (ctx) {
  return ctx.measureText(" ").width;
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

function offsetBoundForText (ctx, bound, textHeight) {
  const [ox, oy, w, h] = bound;
  let x;
  switch (ctx.textAlign) {
    case "center":
      x = ox - w / 2;
      break;
    case "end":
    case "right":
      x = ox - w;
      break;
    default: // left
      x = ox;
      break;
  }
  let y;
  switch (ctx.textBaseline) {
    case "top":
      y = oy;
      break;
    // FIXME it is hard to compute magically.. so we just always remove textHeight
    default: // alphabetic
      y = oy - textHeight;
  }
  return [x, y, w, h];
}

export function computeBound (slide2d, draw, accumulatedStyles) {
  const { ctx } = slide2d;
  ctx.save();
  for (var k in accumulatedStyles) {
    ctx[k] = accumulatedStyles[k];
  }
  let bound = null;
  switch (draw[0]) {
    case "fillText":
    case "strokeText":
      const [, text, x, y, lineHeight] = draw;
      const lines = text.split("\n");
      if (draw.length < 4 || lines.length === 1) {
        let w = ctx.measureText(text).width;
        let h = Math.max(lineHeight, estimateTextHeight(ctx));
        bound = offsetBoundForText(ctx, [x, y, Math.ceil(w), Math.ceil(h)], h);
      }
      else {
        let w = 0;
        let h = lines.length * lineHeight;
        for (let i=0; i<lines.length; ++i) {
          let lineW = ctx.measureText(lines[i]).width;
          if (lineW > w) w = lineW;
        }
        bound = offsetBoundForText(ctx, [x, y, Math.ceil(w), Math.ceil(h)], lineHeight);
      }
      break;
  }
  ctx.restore();
  return bound;
}

export function findItemByPosition (slide2d, data, pos) {
  const draws = data.draws;
  const styles = objectAssign({}, initialCanvasStyles);
  for (var i=0; i<draws.length; ++i) {
    var draw = draws[i];
    if (draw instanceof Array) {
      const bound = computeBound(slide2d, draw, styles);
      if (bound && vec2.inBound(pos, bound)) {
        return i;
      }
    }
    else {
      objectAssign(styles, draw);
    }
  }
  return -1;
}

export function Position (slide2d, data) {
  // FIXME this needs to works properly..
  const size = slide2d.getSize(data);
  const rect = slide2d.getRectangle(data);
  /*
  const [w, h] = size;
  const [X, Y, W, H] = rect;
  const ratioW = W / w;
  const ratioH = H / h;
  */
  function apply (p) {
    return p;
    /*
    const [x, y] = p;
    return [
      Math.floor(X + x / ratioW),
      Math.floor(Y + y / ratioH)
    ];
    */
  }
  function applyBound (b) {
    return b;
    /*
    const [bx, by, w, h] = b;
    const [ x, y ] = apply([ bx, by ]);
    const [ x2, y2 ] = apply([ bx+w, by+h ]);
    return [ x, y, x2-x, y2-y ];
    */
  }
  function getScale () {
    return 1;
    //return ratioW;
  }
  return {
    applyBound,
    apply,
    getScale
  };
}
