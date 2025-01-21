const getRef = (nodes: LangNode[]) => (input: number | LangNode) => {
  return typeof input !== "object" ? input : `v${nodes.indexOf(input)}`;
}

export class LangNode {
  /** @member {string} */
  type: string = 'add'
  /** @member {Array.<number|LangNode>} */
  ins: (LangNode | number)[]
  /**
   * Constructor for initializing a new instance of the Node.
   *
   * @param {string} type - The type of the instance to be created.
   * @param {...number|LangNode} ins - The instance data or configuration.
   *
   */
  constructor(
    type: string,
    ins: (LangNode | number)[],
    compileSelf?: (
      node: LangNode,
      ref: string | number,
      args: (string | number)[]
    ) => string
  ) {

    this.type = type
    this.ins = ins
    if (compileSelf) {
      this.compileSelf = compileSelf
    } else {
      this.compileSelf = (node, ref, args) => {
        return `let ${ref} = lib.${node.type}(${args.join(",")})`;
      }
    }
  }

  toString() {
    return `(${this.type}${this.ins?.map((arg) => ` ${arg}`)})`
  }

  compile() {
    const nodes = Array.from(topoSort(this))
    /**
     * @param {number|LangNode} input
     */
    const lines = []
    for (let id in nodes) {
      const node = nodes[id];
      const args = node.ins.map(getRef(nodes));
      const ref = getRef(nodes)(node);
      lines.push(node.compileSelf(node, ref, args));
    }
    const last = getRef(nodes)(nodes[nodes.length - 1]);
    return { lines, last };
  }

  compileSelf(node: LangNode, ref: string | number, args: (string | number)[]) {
    return `let ${ref} = lib.${node.type}(${args.join(",")})`;
  }
}

const registerNode = (type: string) => {
  // HACK
  // @ts-ignore
  LangNode.prototype[type] = function (...args: any[]) {
    return new LangNode(type, [this, ...args]);
  };
  return (...args: any[]) => new LangNode(type, args);
};

const lib = {
  add: (a: number, b: number) => a + b,
  sub: (a: number, b: number) => a - b,
  mul: (a: number, b: number) => a * b,
  div: (a: number, b: number) => a / b,
}

export const functionNames = Object.keys(lib)

const registers = Object.fromEntries(
  Object
    .keys(lib)
    .map((name) => [name, registerNode(`${name}`)])
)

/**
 * @generator
 * @param {LangNode} node
 * @param {Set.<LangNode>} visited
 * @yields {LangNode} sorted Node
 */
function* topoSort(
  node: LangNode | number,
  visited = new Set<LangNode>()
): Generator<LangNode, undefined> {
  if (!(node instanceof LangNode) || visited.has(node)) {
    return; // constant values or already visited nodes
  }
  visited.add(node);
  for (let input of node.ins) {
    yield* topoSort(input, visited);
  }
  yield node;
}

const run = (
  code: string,
  lib: {
    [k: string]: (...args: number[]) => LangNode;
  }
) => {
  const keys = Object.keys(lib)
  const values = Object.values(lib)
  return new Function(...keys, code)(...values)
}

let timeout: number | undefined;
let generator: Generator<LangNode, undefined> | undefined,
  visited: LangNode[] = [],
  lines: string[] = []

export const interpreter = {
  start: (node: LangNode | number, input: string) => {
    generator = topoSort(node);
    visited = [];
    lines = [];
    interpreter.step(input);
  },
  getRef: function(input: number | LangNode) {
    return typeof input !== "object"
      ? input
      : `v${visited.indexOf(input)}`;
  },
  createNode: (code: string) => run(`return ${code}`, registers),
  update: (input: string) => {
    clearTimeout(timeout);
    const node = interpreter.createNode(input) as LangNode
    interpreter.start(node, input)
    const unit = node.compile();
    unit.lines.push(`return ${unit.last}`);
    const code = unit.lines.join("\n");
    const fn = new Function("lib", code);
    const res = fn(lib) as number
    return [code, res] as const
  },
  step: (input: string) => {
    const res = generator?.next();
    const current = res?.value;
    if (current) {
      visited.push(current);
      const args = current.ins.map(interpreter.getRef);
      const line = current.compileSelf(current, interpreter.getRef(current), args);
      lines.push(line);
      timeout = setTimeout(() => interpreter.step(input), 1000);
    } else if (res?.done) {
      lines.push(`return ${interpreter.getRef(visited[visited.length - 1])}`);
      const code = lines.join("\n");
      const res = new Function("lib", code)(lib);
      lines.push("// result: " + res);
      const node = interpreter.createNode(input) as LangNode
      timeout = setTimeout(() => interpreter.start(node, input), 2000);
    }
  }
}
