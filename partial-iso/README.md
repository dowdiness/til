# Partial Isomorphisms

A MoonBit implementation of partial isomorphisms for unifying parsing and pretty printing, based on:

> Rendel & Ostermann (2010). "Invertible Syntax Descriptions: Unifying Parsing and Pretty Printing"
> http://www.informatik.uni-marburg.de/~rendel/unparse/rendel10invertible.pdf

## Core Concept

A **partial isomorphism** `Iso[A, B]` represents an invertible (partial) function between types A and B:

```moonbit
struct Iso[A, B] {
  apply : (A) -> B?     // Forward direction
  unapply : (B) -> A?   // Backward direction
}
```

The key insight: parsers use `apply` (string → AST), printers use `unapply` (AST → string).

## Unified Syntax Type

Instead of higher-kinded types (which MoonBit lacks), we use the **product type approach** inspired by monocle-ts:

```moonbit
struct Syntax[A] {
  parser : Parser[A]
  printer : Printer[A]
}
```

A `Syntax[A]` bundles a parser and printer together, ensuring they stay consistent. All operations maintain both in sync:

```moonbit
// Define once, use both ways
let pair_syntax = syntax_digit()
  .skip_right(syntax_char(':'))
  .product(syntax_digit())

// Parse: "1:2" → ('1', '2')
pair_syntax.parse("1:2")   // Some(('1', '2'))

// Print: ('1', '2') → "1:2"
pair_syntax.print(('1', '2'))  // Some("1:2")
```

## API Overview

### Iso Combinators

```moonbit
Iso::id()                    // Identity isomorphism
Iso::new(apply, unapply)     // Create from two functions
iso.inverse()                // Swap directions
compose(g, f)                // Compose: first f, then g
product(i, j)                // Apply to tuple components
associate()                  // (a, (b, c)) <-> ((a, b), c)
commute()                    // (a, b) <-> (b, a)
literal(value)               // Unit <-> specific value
subset(predicate)            // Filter by predicate
```

### Unified Syntax

```moonbit
Syntax::token()              // Single character
Syntax::pure(value)          // Succeed without consuming
Syntax::empty()              // Always fail
syntax.parse(input)          // Parse a string
syntax.print(value)          // Print a value
syntax.iso_map(iso)          // Transform with isomorphism
syntax.product(other)        // Sequence
syntax.alt(other)            // Alternative
syntax.skip_left(other)      // Discard left
syntax.skip_right(other)     // Discard right
Syntax::delayed(thunk)       // Lazy for recursion

syntax_char(c)               // Specific character
syntax_text(s)               // Specific string
syntax_digit()               // Digit character
syntax_integer()             // Integer
syntax_many(s)               // Zero or more
syntax_many1(s)              // One or more
```

### Separate Parser/Printer (Low-level)

You can also use `Parser[A]` and `Printer[A]` directly:

```moonbit
// Parser combinators
Parser::token(), char_(c), text(s), digit(), integer()
parser.iso_map(iso), parser.product(other), parser.alt(other)
many(p), many1(p), Parser::delayed(thunk)

// Printer combinators  
Printer::token(), print_char(c), print_text(s), print_digit(), print_integer()
printer.iso_map(iso), printer.product(other), printer.alt(other)
print_many(p), print_many1(p)
```

## Usage

### Define constructor isomorphisms

```moonbit
enum Expr {
  Lit(Int)
  Add(Expr, Expr)
}

fn lit_iso() -> Iso[Int, Expr] {
  Iso::new(
    fn(n) { Some(Lit(n)) },
    fn(e) { match e { Lit(n) => Some(n); _ => None } }
  )
}
```

### Build unified syntax

```moonbit
fn atom() -> Syntax[Expr] {
  syntax_integer().iso_map(lit_iso()).alt(
    syntax_char('(')
      .skip_left(Syntax::delayed(expr))
      .skip_right(syntax_char(')'))
  )
}
```

### Parse and print with the same definition

```moonbit
let s = atom()
s.parse("42")           // Some(Lit(42))
s.print(Lit(42))        // Some("42")
```

## Running Tests

```bash
moon test --package partial-iso
```

## Design Notes

**Why product type instead of trait?**

The paper's original Haskell uses a type class `Syntax` with higher-kinded types:
```haskell
class Syntax f where
  (<$>) :: Iso a b -> f a -> f b
  (<*>) :: f a -> f b -> f (a, b)
```

MoonBit can't express `Self[A]` in traits (no HKT support). Instead, we bundle Parser and Printer into a product type `Syntax[A]`. This is similar to how monocle-ts works: concrete optic types with explicit composition, rather than abstracting over the "container".

**Benefits:**
- Single definition serves both directions
- Type-safe: can't accidentally use wrong direction
- Isomorphism laws enforced by structure
