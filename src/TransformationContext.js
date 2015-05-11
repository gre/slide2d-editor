import objectAssign from "object-assign";
import { affine } from "affine";

const preserveMethods = [ "measureText" ];

function createAffineFromCanvasParams (m00, m10, m01, m11, v0, v1) {
  return new affine.affine2d([ m00, m01, m10, m11, v0, v1 ]);
}

function wrap (obj, methods) {
  Object.keys(methods).map(k => {
    let old = obj[k];
    let method = methods[k];
    obj[k] = function () {
      old.apply(this, arguments);
      method.apply(this, arguments);
    };
  });
}

/**
 * mock the canvas2d context API to provide
 * a way to track affine transformation
 * while being able to pass a TransformationContext in slide2d lib
 */
export default class TransformationContext {

  constructor (width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    let t = new affine.affine2d(); // current transformation
    const stack = []; // stack of save()d transformations

    // Implementing noop methods for all unwrapped
    const keys = [];
    for (let k in ctx) keys.push(k);
    keys.map(k => {
      if (k.indexOf("webkit")!==-1) return;
      let prop = ctx[k];
      switch (typeof prop) {
        case "function":
        if (!this[k]) this[k] =
          preserveMethods.indexOf(k)===-1 ?
          function(){} : prop.bind(ctx);
        break;

        case "object":
        this[k] = ctx[k];
        break;

        default:
        Object.defineProperty(this, k, {
          enumerable: true,
          get () {
            return ctx[k];
          },
          set (value) {
            ctx[k] = value;
          }
        });
      }
    });

    // Wrap transformation methods
    wrap(this, {
      save () {
        stack.push(t.copy());
      },
      restore () {
        t = stack.pop();
      },
      rotate () {
        t.rotate.apply(t, arguments);
      },
      scale () {
        t.scale.apply(t, arguments);
      },
      translate () {
        t.translate.apply(t, arguments);
      },
      transform () {
        t.rightComposeWith(createAffineFromCanvasParams.apply(null, arguments));
      },
      setTransform () {
        t = createAffineFromCanvasParams.apply(null, arguments);
      }
    });

    // Mocks context2d API
    objectAssign(this, {
      // Special methods
      transformVec () {
        t.transformVec.apply(t, arguments);
      },
      transformPair () {
        return t.transformPair.apply(t, arguments);
      },
      getTransform () {
        const { m00, m10, m01, m11, v0, v1 } = t;
        return [ m00, m10, m01, m11, v0, v1 ];
      }
    });
  }

}
