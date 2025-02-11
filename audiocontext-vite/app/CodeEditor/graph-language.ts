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
  return typeof input !== 'object' ? input : `v${nodes.indexOf(input)}`
}

/**
 * Represents a node in the language graph.
 */
export class LangNode {
  /** @member {FunctionNames} */
  type: FunctionNames = 'add'
  /** @member {Array.<number|LangNode>} */
  _ins: (LangNode | number)[] = []
  private _sortedCache: LangNode[] | null = null

  /**
   * Constructor for initializing a new instance of the Node.
   *
   * @param {string} type - The type of the instance to be created.
   * @param {Array.<number|LangNode|null>} ins - The instance data or configuration.
   * @param {(node: LangNode, ref: string | number, args: (string | number)[]) => string} [compileSelf] - Optional custom compile function.
   */
  constructor(
    type: FunctionNames,
    ins: (LangNode | number | null)[],
    compileSelf?: (node: LangNode, ref: string | number, args: (string | number)[]) => string,
  ) {
    this.type = type
    this.ins = ins.map((inlet) => (inlet === null ? 0 : inlet))
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
        return `let ${ref} = lib.${node.type}(${args.join(',')})`
      }
    }
  }

  get ins(): (LangNode | number)[] {
    return this._ins
  }

  // Reset cache when inputs change
  set ins(value: (LangNode | number)[]) {
    this._sortedCache = null
    this._ins = value
  }

  getSortedNodes(): LangNode[] {
    if (!this._sortedCache) {
      this._sortedCache = topoSort(this)
    }
    return this._sortedCache
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
   * TODO Currentry this function is not used.
   */
  compileSelf(node: LangNode, ref: string | number, args: (string | number)[]) {
    return `let ${ref} = lib.${node.type}(${args.join(',')})`
  }
}

/**
 * Registers a new node type.
 *
 * @param {string} type - The type of the node to register.
 * @returns {(...args: any[]) => LangNode} - A function to create a new node of the specified type.
 */
const registerNode = (type: FunctionNames) => {
  // @ts-ignore
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  LangNode.prototype[type] = function (...args: any[]) {
    return new LangNode(type, [this, ...args])
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (...args: any[]) => new LangNode(type, args)
}

export const funcs = [
  { name: 'n', symbol: 'n', func: (a: number) => a },
  { name: 'add', symbol: '+', func: (a: number, b: number) => a + b },
  { name: 'sub', symbol: '-', func: (a: number, b: number) => a - b },
  { name: 'mul', symbol: '*', func: (a: number, b: number) => a * b },
  { name: 'div', symbol: '/', func: (a: number, b: number) => a / b },
  { name: 'out', symbol: '=', func: (a: number) => a },
]

export const lib = {
  n: (a: number) => a,
  add: (a: number, b: number) => a + b,
  sub: (a: number, b: number) => a - b,
  mul: (a: number, b: number) => a * b,
  div: (a: number, b: number) => a / b,
  out: (a: number) => a,
}

export type FunctionNames = keyof typeof lib

const getKeys = <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
  return Object.keys(obj)
}

export const functionNames = getKeys(lib) satisfies FunctionNames[]

const registers = Object.fromEntries(getKeys(lib).map((name) => [name, registerNode(name)]))

/**
 * Topologically sort the nodes in the graph.
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
 * @param {LangNode | number} node - The starting node.
 * @yields {LangNode[]} - The sorted nodes.
 */
function topoSort(startNode: LangNode | number): LangNode[] {
  if (!(startNode instanceof LangNode)) {
    return []
  }

  const result: LangNode[] = []
  const visited = new Set<LangNode>()
  const visiting = new Set<LangNode>()
  const stack: [LangNode, number][] = [[startNode, 0]]

  while (stack.length > 0) {
    const [node, childIndex] = stack[stack.length - 1]

    if (childIndex >= node.ins.length) {
      stack.pop()
      if (!visited.has(node)) {
        visited.add(node)
        result.push(node)
      }
      continue
    }

    const input = node.ins[childIndex]
    stack[stack.length - 1][1]++

    if (input instanceof LangNode && !visited.has(input)) {
      if (visiting.has(input)) {
        throw new Error('Cyclic dependency detected')
      }
      visiting.add(input)
      stack.push([input, 0])
    }
  }

  return result
}

type InterpreterState = {
  initialNode: LangNode | null
  sortedNodes: LangNode[]
  executionIndex: number
  variables: Map<string, number>
  steps: string[]
  lastResult: number
  errorMessage: string
}

export class Interpreter {
  private state: InterpreterState

  constructor() {
    this.state = {
      initialNode: null,
      sortedNodes: [],
      executionIndex: 0,
      variables: new Map(),
      steps: [],
      lastResult: 0,
      errorMessage: '',
    }
  }

  private handleError(e: unknown) {
    if (e instanceof TypeError) {
      this.state.errorMessage = `TypeError: ${e.message}`
    } else if (e instanceof SyntaxError) {
      this.state.errorMessage = `SyntaxError: ${e.message}`
    } else if (e instanceof Error) {
      this.state.errorMessage = e.message
    }
  }

  private reset(node: LangNode) {
    try {
      this.state = {
        initialNode: node,
        sortedNodes: topoSort(node),
        executionIndex: 0,
        variables: new Map(),
        steps: [],
        lastResult: 0,
        errorMessage: '',
      }
    } catch (e) {
      this.handleError(e)
    }
  }

  private getNodeReference(node: LangNode | number): string | number {
    if (typeof node === 'number') {
      return node
    }
    const index = this.state.sortedNodes.indexOf(node)
    return `v${index}`
  }

  private executeNode(node: LangNode): number {
    const refs = node.ins.map((input) => {
      if (typeof input === 'number') {
        return input
      }
      return this.getNodeReference(input)
    })

    const args = node.ins.map((input) => {
      if (typeof input === 'number') {
        return input
      }
      const ref = this.getNodeReference(input)
      return this.state.variables.get(ref.toString()) ?? 0
    })

    // @ts-expect-error args length can be different
    const result = lib[node.type](...args)
    const ref = this.getNodeReference(node)
    this.state.variables.set(ref.toString(), result)

    const line = `let ${ref} = lib.${node.type}(${refs.join(',')}) // = ${result}`
    this.state.steps.push(line)

    return result
  }

  init(code: string) {
    try {
      // Create and validate the node
      const node = this.createNode(code)
      this.reset(node)
    } catch (e) {
      this.handleError(e)
    }
  }

  step(): [string, number] {
    if (this.state.errorMessage.length > 0) {
      return [this.state.errorMessage, this.state.lastResult]
    }
    // Reset interpreter if all nodes are already executed.
    if (this.state.executionIndex >= this.state.sortedNodes.length) {
      if (this.state.initialNode) {
        this.reset(this.state.initialNode)
      }
      return [this.state.steps.join('\n'), this.state.lastResult]
    }
    try {
      const node = this.state.sortedNodes[this.state.executionIndex]
      this.state.lastResult = this.executeNode(node)
      this.state.executionIndex++
      return [this.state.steps.join('\n'), this.state.lastResult]
    } catch (e) {
      this.handleError(e)
      return [String(e), this.state.lastResult]
    }
  }

  compile(code: string): [string, number] {
    try {
      // Create and validate the node
      const node = this.createNode(code)
      this.reset(node)

      // Execute all nodes immediately
      for (const node of this.state.sortedNodes) {
        this.state.lastResult = this.executeNode(node)
      }

      return [this.state.steps.join('\n'), this.state.lastResult]
    } catch (e) {
      this.handleError(e)
      return [String(e), this.state.lastResult]
    }
  }

  /**
   * Create root LangNode class by code.
   *
   * @param {string} code - The code to create LangNode instance.
   * @return {LangNode} - The generated instance of LangNode class.
   */
  createNode(code: string): LangNode {
    const keys = Object.keys(registers)
    const values = Object.values(registers)
    return new Function(...keys, `return ${code}`)(...values)
  }

  getState(): Readonly<InterpreterState> {
    return { ...this.state }
  }

  // Debug utilities
  getExecutionTrace(): string {
    return this.state.steps.join('\n')
  }

  getVariableState(): Map<string, number> {
    return new Map(this.state.variables)
  }
}

// Create a singleton instance
export const interpreter = new Interpreter()
