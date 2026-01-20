///|
/// Unified Syntax abstraction
/// 
/// Instead of higher-kinded types (which MoonBit lacks), we use:
/// 1. A product type `Syntax[A]` containing both Parser and Printer
/// 2. All operations maintain the invariant that both are consistent
/// 3. Iso transformations automatically apply in the correct direction
///
/// This approach is inspired by monocle-ts: concrete types with explicit
/// composition, rather than abstracting over the container type.

///|
/// A unified syntax description that works both as parser and printer.
/// This is the "abstract" syntax that can be interpreted in either direction.
pub struct Syntax[A] {
  parser : Parser[A]
  printer : Printer[A]
}

///|
/// Create a syntax from matching parser and printer
pub fn[A] Syntax::new(parser : Parser[A], printer : Printer[A]) -> Syntax[A] {
  { parser, printer }
}

///|
/// Parse using this syntax
pub fn[A] Syntax::parse(self : Syntax[A], input : String) -> A? {
  self.parser.parse(input)
}

///|
/// Print using this syntax
pub fn[A] Syntax::print(self : Syntax[A], a : A) -> String? {
  self.printer.print(a)
}

///|
/// Map with a partial isomorphism
pub fn[A, B] Syntax::iso_map(self : Syntax[A], iso : Iso[A, B]) -> Syntax[B] {
  { parser: self.parser.iso_map(iso), printer: self.printer.iso_map(iso) }
}

///|
/// Sequence two syntaxes
pub fn[A, B] Syntax::product(
  self : Syntax[A],
  other : Syntax[B],
) -> Syntax[(A, B)] {
  {
    parser: self.parser.product(other.parser),
    printer: self.printer.product(other.printer),
  }
}

///|
/// Alternative: try first, then second
pub fn[A] Syntax::alt(self : Syntax[A], other : Syntax[A]) -> Syntax[A] {
  {
    parser: self.parser.alt(other.parser),
    printer: self.printer.alt(other.printer),
  }
}

///|
/// Empty syntax (always fails)
pub fn[A] Syntax::empty() -> Syntax[A] {
  { parser: Parser::empty(), printer: Printer::empty() }
}

///|
/// Pure syntax: succeeds with value, produces empty string
pub fn[A] Syntax::pure(a : A) -> Syntax[A] {
  { parser: Parser::pure(a), printer: Printer::pure(a) }
}

///|
/// Skip right: parse/print both but only keep left value
pub fn[A] Syntax::skip_right(
  self : Syntax[A],
  other : Syntax[Unit],
) -> Syntax[A] {
  {
    parser: self.parser.skip_right(other.parser),
    printer: self.printer.skip_right(other.printer),
  }
}

///|
/// Skip left: parse/print both but only keep right value
pub fn[B] Syntax::skip_left(
  self : Syntax[Unit],
  other : Syntax[B],
) -> Syntax[B] {
  {
    parser: self.parser.skip_left(other.parser),
    printer: self.printer.skip_left(other.printer),
  }
}

///|
/// Token syntax: single character
pub fn Syntax::token() -> Syntax[Char] {
  { parser: Parser::token(), printer: Printer::token() }
}

///|
/// Delayed syntax for recursive grammars
pub fn[A] Syntax::delayed(thunk : () -> Syntax[A]) -> Syntax[A] {
  {
    parser: Parser::delayed(fn() { thunk().parser }),
    printer: Printer::new(fn(a) { thunk().printer.print(a) }),
  }
}

///|
/// Syntax for a specific character
pub fn syntax_char(c : Char) -> Syntax[Unit] {
  { parser: char_(c), printer: print_char(c) }
}

///|
/// Syntax for a specific string
pub fn syntax_text(s : String) -> Syntax[Unit] {
  { parser: text(s), printer: print_text(s) }
}

///|
/// Syntax for a digit
pub fn syntax_digit() -> Syntax[Char] {
  { parser: digit(), printer: print_digit() }
}

///|
/// Syntax for an integer
pub fn syntax_integer() -> Syntax[Int] {
  { parser: integer(), printer: print_integer() }
}

///|
/// Syntax for zero or more occurrences
pub fn[A] syntax_many(s : Syntax[A]) -> Syntax[Array[A]] {
  { parser: many(s.parser), printer: print_many(s.printer) }
}

///|
/// Syntax for one or more occurrences
pub fn[A] syntax_many1(s : Syntax[A]) -> Syntax[Array[A]] {
  { parser: many1(s.parser), printer: print_many1(s.printer) }
}
