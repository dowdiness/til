///|
/// Example: A simple expression language with parsing and printing unified.

///|
pub enum Expr {
  Lit(Int)
  Add(Expr, Expr)
  Mul(Expr, Expr)
}

///|
pub impl Show for Expr with output(self, logger) {
  match self {
    Lit(n) => logger.write_string("Lit(\{n})")
    Add(l, r) => logger.write_string("Add(\{l}, \{r})")
    Mul(l, r) => logger.write_string("Mul(\{l}, \{r})")
  }
}

///|
/// Partial isomorphism for Lit constructor
pub fn lit_iso() -> Iso[Int, Expr] {
  Iso::new(fn(n) { Some(Lit(n)) }, fn(e) {
    match e {
      Lit(n) => Some(n)
      _ => None
    }
  })
}

///|
/// Partial isomorphism for Add constructor
pub fn add_iso() -> Iso[(Expr, Expr), Expr] {
  Iso::new(fn(pair) { Some(Add(pair.0, pair.1)) }, fn(e) {
    match e {
      Add(l, r) => Some((l, r))
      _ => None
    }
  })
}

///|
/// Partial isomorphism for Mul constructor
pub fn mul_iso() -> Iso[(Expr, Expr), Expr] {
  Iso::new(fn(pair) { Some(Mul(pair.0, pair.1)) }, fn(e) {
    match e {
      Mul(l, r) => Some((l, r))
      _ => None
    }
  })
}

///|
/// Parser for expressions
pub fn expr_parser() -> Parser[Expr] {
  add_expr_parser()
}

///|
fn add_expr_parser() -> Parser[Expr] {
  let base = mul_expr_parser()
  let add_op = char_(' ')
    .skip_left(char_('+'))
    .skip_left(char_(' '))
    .skip_left(mul_expr_parser())
  fold_left(base, add_op, add_iso())
}

///|
fn mul_expr_parser() -> Parser[Expr] {
  let base = atom_parser()
  let mul_op = char_(' ')
    .skip_left(char_('*'))
    .skip_left(char_(' '))
    .skip_left(atom_parser())
  fold_left(base, mul_op, mul_iso())
}

///|
fn atom_parser() -> Parser[Expr] {
  integer()
  .iso_map(lit_iso())
  .alt(
    char_('(').skip_left(Parser::delayed(expr_parser)).skip_right(char_(')')),
  )
}

///|
/// Left-fold parser helper for left-associative operators
fn[A] fold_left(
  base : Parser[A],
  op : Parser[A],
  iso : Iso[(A, A), A],
) -> Parser[A] {
  base.product(many(op)).iso_map(fold_left_iso(iso))
}

///|
fn[A] fold_left_iso(step : Iso[(A, A), A]) -> Iso[(A, Array[A]), A] {
  Iso::new(
    fn(pair) {
      let (init, rest) = pair
      let mut acc = init
      for item in rest {
        match step.apply((acc, item)) {
          Some(result) => acc = result
          None => return None
        }
      }
      Some(acc)
    },
    fn(a) { Some((a, [])) },
  )
}

///|
/// Printer for expressions
pub fn expr_printer() -> Printer[Expr] {
  {
    run: fn(e) {
      match e {
        Lit(n) => print_integer().print(n)
        Add(l, r) =>
          match (expr_printer().print(l), expr_printer().print(r)) {
            (Some(ls), Some(rs)) => Some("\{ls} + \{rs}")
            _ => None
          }
        Mul(l, r) =>
          match (expr_printer().print(l), expr_printer().print(r)) {
            (Some(ls), Some(rs)) =>
              match l {
                Add(_, _) =>
                  match r {
                    Add(_, _) => Some("(\{ls}) * (\{rs})")
                    _ => Some("(\{ls}) * \{rs}")
                  }
                _ =>
                  match r {
                    Add(_, _) => Some("\{ls} * (\{rs})")
                    _ => Some("\{ls} * \{rs}")
                  }
              }
            _ => None
          }
      }
    },
  }
}
