import * as vec2 from "./vec2";
import Slide2d from "slide2d";
import TransformationContext from "./TransformationContext";
import { estimateTextHeight } from "./core";

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

function computeBound (ctx, draw) {
  let bound = null;
  switch (draw[0]) {
    case "rect":
    case "fillRect":
    case "strokeRect":
    bound = draw.slice(1);
    break;

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
  return bound;
}

function transformBound (ctx, bound) {
  let [ x, y, w, h ] = bound;
  let [ax, ay] = ctx.transformPair(x, y);
  let [bx, by] = ctx.transformPair(x+w, y+h);
  x = Math.min(ax, bx);
  y = Math.min(ay, by);
  let x2 = Math.max(ax, bx);
  let y2 = Math.max(ay, by);
  return [ x, y, x2-x, y2-y ];
}

function serializePath (path) {
  return path.join(",");
}
function deserializePath (hash) {
  return hash.split(",").map(function (s) {
    return parseInt(s, 10);
  });
}

export default class Slide2dMeta {

  constructor (width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data;
    const ctx = new TransformationContext(width, height);
    const metas = {};
    Slide2d(ctx).render(data, function (path, draw) {
      let canvasBound, bound, styles, matrix = ctx.getTransform();
      styles = {};
      for (var k in ctx) {
        if (k.indexOf("webkit") !== -1) continue;
        const typ = typeof ctx[k];
        if (typ !== "function" && typ !== "object") {
          styles[k] = ctx[k];
        }
      }

      if (draw instanceof Array) {
        if (typeof draw[0] === "string") {
          canvasBound = computeBound(ctx, draw);
          bound = canvasBound && transformBound(ctx, canvasBound);
        }
        else {
          // TODO: union of bounds
        }
      }

      metas[serializePath(path)] = {
        canvasBound,
        bound,
        styles,
        matrix
      };
    });
    this.metas = metas;
  }

  getMeta (path) {
    return this.metas[serializePath(path)];
  }

  findByPosition (pos) {
    const metas = this.metas;
    for (let k in metas) {
      let meta = metas[k];
      if (meta && meta.bound && vec2.inBound(pos, meta.bound))
        return deserializePath(k);
    }
    return null;
  }
}
