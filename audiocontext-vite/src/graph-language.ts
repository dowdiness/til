/**
 * This code implements a simple graph-based language interpreter. Here's how it works:
 *
 * 1. Core Concepts:
 * - LangNode: A class representing nodes in an expression tree. Each node has:
 *   - type: The operation (e.g. 'add', 'mul')
 *   - ins: Input values/nodes
 *   - compileSelf: Function to generate code for this node
 *
 * 2. Key Components:
 * - registerNode(): Creates node types and adds methods to LangNode prototype
 * - topoSort(): Orders nodes for execution (inner expressions before outer ones)
 * - compile(): Generates executable JavaScript code from nodes
 * - interpreter: Handles step-by-step execution and visualization
 *
 * 3. Example Flow:
 * Input: add(5, mul(sub(3,1), 2))
 *
 * a) Parsing creates nodes:
 *    sub(3,1) -> mul(result,2) -> add(5,result)
 *
 * b) Topological sort orders execution:
 *    sub -> mul -> add
 *
 * c) Code generation:
 *    let v0 = lib.sub(3,1)
 *    let v1 = lib.mul(v0,2)
 *    let v2 = lib.add(5,v1)
 *    return v2
 *
 * d) Execution using the lib functions
 *
 * The interpreter can run this either all at once or step-by-step for visualization.
 */

// Rest of code remains unchanged...
/**
 * Retrieves the reference for a given input.
 *
 * @param {LangNode[]} nodes - The array of LangNode instances.
 * @returns {(input: number | LangNode) => string | number} - A function that returns the reference for the input.
 */
const getRef = (nodes: LangNode[]) => (input: number | LangNode) => {
  return typeof input !== "object" ? input : `v${nodes.indexOf(input)}`
}

/**
 * Represents a node in the language graph.
 */
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
   * @param {(node: LangNode, ref: string | number, args: (string | number)[]) => string} [compileSelf] - Optional custom compile function.
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
      // In this default implementation, if input is
      //   node = LangNode { type: 'add', ... }
      //   ref = "v0"
      //   args = [3, 2]
      // then output becomes
      //   "let v0 = lib.add(3,2)"
      this.compileSelf = (node, ref, args) => {
        return `let ${ref} = lib.${node.type}(${args.join(",")})`
      }
    }
  }

  /**
   * Converts the node to a string representation.
   *
   * @returns {string} - The string representation of the node.
   */
  toString() {
    return `(${this.type}${this.ins?.map((arg) => ` ${arg}`)})`
  }

  /**
   * Compiles the node and its dependencies into executable code.
   *
   * @returns {{ lines: string[], last: string | number }} - The compiled code lines and the last reference.
   */
  compile() {
    // Execution order will be determined by topoSort algorithm.
    const nodes = Array.from(topoSort(this))
    const lines = []
    for (const id in nodes) {
      const node = nodes[id]
      const args = node.ins.map(getRef(nodes))
      const ref = getRef(nodes)(node)
      lines.push(node.compileSelf(node, ref, args))
    }
    const last = getRef(nodes)(nodes[nodes.length - 1])
    return { lines, last }
  }

  /**
   * Default compile function for the node.
   *
   * @param {LangNode} node - The node to compile.
   * @param {string | number} ref - The reference for the node.
   * @param {(string | number)[]} args - The arguments for the node.
   * @returns {string} - The compiled code for the node.
   */
  compileSelf(node: LangNode, ref: string | number, args: (string | number)[]) {
    return `let ${ref} = lib.${node.type}(${args.join(",")})`
  }
}

/**
 * Registers a new node type.
 *
 * @param {string} type - The type of the node to register.
 * @returns {(...args: any[]) => LangNode} - A function to create a new node of the specified type.
 */
const registerNode = (type: string) => {
  // @ts-ignore
  LangNode.prototype[type] = function (...args: any[]) {
    return new LangNode(type, [this, ...args])
  }
  return (...args: any[]) => new LangNode(type, args)
};

export const lib = {
  add: (a: number, b: number) => a + b,
  sub: (a: number, b: number) => a - b,
  mul: (a: number, b: number) => a * b,
  div: (a: number, b: number) => a / b,
}

export type FunctionNames = keyof typeof lib

const getKeys = <T extends {[key: string]: unknown}>(obj: T): (keyof T)[] => {
  return Object.keys(obj)
}

export const functionNames = getKeys(lib) satisfies FunctionNames[]

const registers = Object.fromEntries(
  Object
    .keys(lib)
    .map((name) => [name, registerNode(`${name}`)])
)

/**
 * Topologically sorts the nodes in the graph.
 *
 * We need to organize expression execution order.
 * For Example, if we get this expression,
 *  add(5, mul(sub(3,1), 2))
 * we must execute inner expressions first before execute outer expressions.
 *   let v0 = lib.sub(3,1)
 *   let v1 = lib.mul(v0,2)
 *   let v2 = lib.add(5,v1)
 *   return v2
 *
 * @generator
 * @param {LangNode | number} node - The starting node.
 * @param {Set.<LangNode>} [visited=new Set()] - The set of visited nodes.
 * @yields {LangNode} - The next node in the sorted order.
 */
function* topoSort(
  node: LangNode | number,
  visited = new Set<LangNode>()
): Generator<LangNode, undefined> {
  if (!(node instanceof LangNode) || visited.has(node)) {
    return // constant values or already visited nodes
  }
  visited.add(node)
  for (let input of node.ins) {
    yield* topoSort(input, visited)
  }
  yield node
}

/**
 * Runs the generated code with the provided library.
 * create root Node class
 *
 * @param {string} code - The code to run.
 * @param {{ [k: string]: (...args: number[]) => LangNode }} lib - The library of functions.
 * @returns {any} - The result of the executed code.
 */
const run = (
  code: string,
  registers: {
    [k: string]: (...args: number[]) => LangNode;
  }
) => {
  const keys = Object.keys(registers)
  const values = Object.values(registers)
  return new Function(...keys, code)(...values)
}

let timeout: number | undefined;
let generator: Generator<LangNode, undefined> | undefined
let visited: LangNode[] = []
let lines: string[] = []

export const interpreter = {
  /**
   * Resets the interpreter with the given node and input.
   *
   * @param {LangNode | number} node - The root node.
   * @param {string} input - The input code.
   */
  reset: (node: LangNode | number, input: string) => {
    // Reset initial state.
    clearTimeout(timeout)
    generator = topoSort(node)
    visited = []
    lines = []
    // Start interpreter step by step
    interpreter.step(input)
  },

  /**
   * Creates a new node from the given code.
   *
   * @param {string} code - The code to create the node from.
   * @returns {LangNode} - The created node.
   */
  createNode: (code: string) => run(`return ${code}`, registers),

  /**
   * Start or updates the interpreter with the given input.
   *
   * @param {string} input - The input code.
   * @returns {[string, number]} - The compiled code and the result.
   */
  update: (input: string) => {
    // Create root node
    const rootNode = interpreter.createNode(input) as LangNode
    // Reset initial state and start step interpreter
    interpreter.reset(rootNode, input)
    // Genarate code that passed to new Function
    const unit = rootNode.compile()
    unit.lines.push(`return ${unit.last}`)
    const code = unit.lines.join("\n")
    // Apply lib functions to generated code, you can use any functions in lib object like this.
    // `lib.add(1, 3)`
    const fn = new Function("lib", code)
    const res = fn(lib) as number
    //
    return [code, res] as const
  },

  /**
   * Executes the next step in the interpreter.
   *
   * @param {string} input - The input code.
   */
  step: (input: string) => {
    if (!generator) return
    const res = generator.next()
    const current = res?.value
    if (current) {
      // Executed on each step
      visited.push(current)
      const args = current.ins.map(getRef(visited))
      const line = current.compileSelf(current, getRef(visited)(current), args)
      lines.push(line)
      timeout = setTimeout(() => interpreter.step(input), 1000)
    } else if (res?.done) {
      // Executed on final step
      lines.push(`return ${getRef(visited)(visited[visited.length - 1])}`)
      const code = lines.join("\n")
      const res = new Function("lib", code)(lib)
      lines.push("// result: " + res)
      const node = interpreter.createNode(input) as LangNode
      timeout = setTimeout(() => interpreter.reset(node, input), 2000)
    }
  }
}
