import * as kable from '@kabelsalat/core'
import { SalatRepl } from "@kabelsalat/web";

import * as core from "@kabelsalat/core";
import * as lib from "@kabelsalat/lib";

Object.assign(globalThis, core);
Object.assign(globalThis, lib);

const items = Array.from(kable.nodeRegistry.entries())
  .filter(([_, schema]) => !schema.internal)
  .sort(([a], [b]) => a.localeCompare(b));

const tags = Array.from(
  new Set(items.map((item) => item[1].tags).flat())
).filter(Boolean);

const tagRefs = Object.fromEntries(
  tags.map((tag) => [
    tag,
    items.filter(([_, schema]) => schema.tags?.includes(tag)).length,
  ])
);

// const repl = new SalatRepl();

// console.log(repl);
// console.log(repl.evaluate('debug()'))

// for (const f of kable) {
//   console.log(f);
// }
const code = `n(440)`

export const kableMain = () => {
  const repl = new SalatRepl();
  const node = repl.evaluate(code)
  const unit = sine(200)
  .add((x) => x.mul(0.8));
  console.log(unit);
  // repl.play(node).then((n) => console.log(n)).catch(console.error)

  console.log(Object.getOwnPropertyNames(kable));
  console.log(items);
  console.log(tags);
  console.log(tagRefs);
  console.log(logAllProperties(core.Node));
}

function logAllProperties(obj) {
  if (obj == null) return; // recursive approach
  console.log(Object.getOwnPropertyNames(obj));
  logAllProperties(Object.getPrototypeOf(obj));
}
