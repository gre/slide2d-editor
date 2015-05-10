import { affine } from "affine";
import { methods as context2dMethods } from "./context2d";

function createAffineFromCanvasParams (m00, m10, m01, m11, v0, v1) {
  return new affine.affine2d([ m00, m01, m10, m11, v0, v1 ]);
}

/**
 * mock the canvas2d context API to provide
 * a way to track affine transformation
 * while being able to pass a TransformationContext in slide2d lib
 */
export default class TransformationContext {
  constructor (width, height) {
    this.t = new affine.affine2d();
    this.stack = [];
    for (var k in context2dMethods) {
      if (!this[k]) {
        this[k] = function(){};
      }
    }
    this.canvas = {
      width: width,
      height: height
    };

    this.realContext = document.createElement("canvas").getContext("2d");
  }

  // Expose real canvas2d implementation
  measureText () {
    this.realContext.font = this.font;
    return this.realContext.measureText.apply(this.realContext, arguments);
  }

  // Exposes the affine API
  transformVec () {
    this.t.transformVec.apply(this.t, arguments);
  }
  transformPair () {
    return this.t.transformPair.apply(this.t, arguments);
  }

  // Mocks context2d API
  save () {
    this.stack.push(this.t.copy());
  }
  restore () {
    this.t = this.stack.pop();
  }
  scale () {
    this.t.scale.apply(this.t, arguments);
  }
  translate () {
    this.t.translate.apply(this.t, arguments);
  }
  transform () {
    this.t.rightComposeWith(createAffineFromCanvasParams.apply(null, arguments));
  }
  setTransform () {
    this.t = createAffineFromCanvasParams.apply(null, arguments);
  }
}
