
export function diff (a, b) {
  const [ xa, ya ] = a;
  const [ xb, yb ] = b;
  return [ xa-xb, ya-yb ];
}

export function length (v) {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}

export function inBound (p, b) {
  const [ x, y ] = p;
  const [ xb, yb, wb, hb ] = b;
  return xb <= x && x <= xb + wb &&
         yb <= y && y <= yb + hb;
}
