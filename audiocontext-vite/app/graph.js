class LangNode {
  /** @member {string} */
  type
  /** @member {Array.<number|LangNode>} */
  ins
  compileSelf = (node, ref, args) => {
    return `let ${ref} = lib.${node.type}(${args.join(",")})`;
  }
  /**
   * Constructor for initializing a new instance of the Node.
   *
   * @param {string} type - The type of the instance to be created.
   * @param {(number|LangNode)[]} ins - The instance data or configuration.
   *
   */
  constructor(type, ins, compileSelf) {
    if (!compileSelf) {
      compileSelf = (node, ref, args) => {
        return `let ${ref} = lib.${node.type}(${args.join(",")})`;
      }
    }
    this.type = type;
    this.ins = ins;
    this.compileSelf = compileSelf;
  }

  toString() {
    return `(${this.type}${this.ins?.map((arg) => ` ${arg}`)})`
  }

  compile() {
    const nodes = Array.from(topoSort(this))
    /**
     * @param {number|LangNode} input
     */
    const getRef = (input) => {
      return typeof input !== "object" ? input : `v${nodes.indexOf(input)}`;
    }
    const lines = []
    for (let id in nodes) {
      const node = nodes[id];
      const args = node.ins.map(getRef);
      const ref = getRef(node);
      lines.push(node.compileSelf(node, ref, args));
    }
    const last = getRef(nodes[nodes.length - 1]);
    return { lines, last };
  }
}

const registerNode = (type) => {
  LangNode.prototype[type] = function (...args) {
    return new LangNode(type, [this, ...args]);
  };
  return (...args) => new LangNode(type, args);
};

const lib = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
  div: (a, b) => a / b,
}

const registers = Object.fromEntries(
  Object
    .keys(lib)
    .map((name) => [name, registerNode(`${name}`)])
)

/**
 * @generator
 * @param {number|LangNode} node
 * @param {Set.<LangNode>} visited
 * @yields {LangNode} sorted Node
 */
function* topoSort(node, visited = new Set()) {
  if (!(node instanceof LangNode) || visited.has(node)) {
    return; // constant values or already visited nodes
  }
  visited.add(node);
  for (let input of node.ins) {
    yield* topoSort(input, visited);
  }
  yield node;
}

const run = (code, lib) => {
  const keys = Object.keys(lib)
  const values = Object.values(lib)
  return new Function(...keys, code)(...values)
}

let timeout;
let generator, visited, lines

const interpreter = {
  start: (node) => {
    generator = topoSort(node);
    visited = [];
    lines = [];
    interpreter.step();
  },
  getRef: function(input) {
    return typeof input !== "object"
      ? input
      : `v${visited.indexOf(input)}`;
  },
  createNode: () => run(`return ${program.value}`, registers),
  update: (text, result) => {
    clearTimeout(timeout);
    const node = interpreter.createNode();
    interpreter.start(node)
    const unit = node.compile();
    unit.lines.push(`return ${unit.last}`);
    const code = unit.lines.join("\n");
    text.innerText = code
    console.log(code)
    const fn = new Function("lib", code);
    const res = fn(lib);
    result.innerText = res
    console.log(res)
  },
  step: () => {
    const res = generator.next();
    const current = res.value;
    if (current) {
      visited.push(current);
      const args = current.ins.map(interpreter.getRef);
      const line = current.compileSelf(current, interpreter.getRef(current), args);
      lines.push(line);
      timeout = setTimeout(() => interpreter.step(), 1000);
    } else if (res.done) {
      lines.push(`return ${interpreter.getRef(visited[visited.length - 1])}`);
      const code = lines.join("\n");
      const res = new Function("lib", code)(lib);
      lines.push("// result: " + res);
      timeout = setTimeout(() => interpreter.start(), 2000);
    }
  }
}
interpreter.update(process, output)
const updateCode = () => interpreter.update(process, output)
exec.addEventListener('click', updateCode)
