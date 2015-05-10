
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export const styles = {};
export const methods = {};

for (var k in ctx) {
  if (k.indexOf("webkit") !== -1) continue;
  const typ = typeof ctx[k];
  if (typ === "function") {
    methods[k] = k;
  }
  else if (typ !== "object") {
    styles[k] = ctx[k];
  }
}
