///|
test "lit_iso constructs and destructs Lit" {
  let iso = lit_iso()
  inspect(iso.apply(42), content="Some(Lit(42))")
  inspect(iso.unapply(Expr::Lit(42)), content="Some(42)")
  inspect(iso.unapply(Expr::Add(Expr::Lit(1), Expr::Lit(2))), content="None")
}

///|
test "add_iso constructs and destructs Add" {
  let iso = add_iso()
  inspect(
    iso.apply((Expr::Lit(1), Expr::Lit(2))),
    content="Some(Add(Lit(1), Lit(2)))",
  )
  inspect(
    iso.unapply(Expr::Add(Expr::Lit(1), Expr::Lit(2))),
    content="Some((Lit(1), Lit(2)))",
  )
  inspect(iso.unapply(Expr::Lit(42)), content="None")
}

///|
test "mul_iso constructs and destructs Mul" {
  let iso = mul_iso()
  inspect(
    iso.apply((Expr::Lit(1), Expr::Lit(2))),
    content="Some(Mul(Lit(1), Lit(2)))",
  )
  inspect(
    iso.unapply(Expr::Mul(Expr::Lit(1), Expr::Lit(2))),
    content="Some((Lit(1), Lit(2)))",
  )
  inspect(iso.unapply(Expr::Lit(42)), content="None")
}

///|
test "expr_parser parses literals" {
  let p = expr_parser()
  inspect(p.parse("42"), content="Some(Lit(42))")
  inspect(p.parse("0"), content="Some(Lit(0))")
}

///|
test "expr_parser parses addition" {
  let p = expr_parser()
  inspect(p.parse("1 + 2"), content="Some(Add(Lit(1), Lit(2)))")
}

///|
test "expr_parser parses multiplication" {
  let p = expr_parser()
  inspect(p.parse("3 * 4"), content="Some(Mul(Lit(3), Lit(4)))")
}

///|
test "expr_parser respects precedence" {
  let p = expr_parser()
  inspect(
    p.parse("1 + 2 * 3"),
    content="Some(Add(Lit(1), Mul(Lit(2), Lit(3))))",
  )
}

///|
test "expr_parser parses parentheses" {
  let p = expr_parser()
  inspect(
    p.parse("(1 + 2) * 3"),
    content="Some(Mul(Add(Lit(1), Lit(2)), Lit(3)))",
  )
}

///|
test "expr_printer prints literals" {
  let p = expr_printer()
  inspect(p.print(Expr::Lit(42)), content="Some(\"42\")")
}

///|
test "expr_printer prints addition" {
  let p = expr_printer()
  inspect(
    p.print(Expr::Add(Expr::Lit(1), Expr::Lit(2))),
    content="Some(\"1 + 2\")",
  )
}

///|
test "expr_printer prints multiplication" {
  let p = expr_printer()
  inspect(
    p.print(Expr::Mul(Expr::Lit(3), Expr::Lit(4))),
    content="Some(\"3 * 4\")",
  )
}

///|
test "expr_printer adds parentheses for precedence" {
  let p = expr_printer()
  inspect(
    p.print(Expr::Mul(Expr::Add(Expr::Lit(1), Expr::Lit(2)), Expr::Lit(3))),
    content="Some(\"(1 + 2) * 3\")",
  )
}

///|
test "roundtrip: parse then print" {
  let parser = expr_parser()
  let printer = expr_printer()
  let input = "1 + 2"
  let parsed = parser.parse(input)
  inspect(parsed, content="Some(Add(Lit(1), Lit(2)))")
  match parsed {
    Some(expr) => inspect(printer.print(expr), content="Some(\"1 + 2\")")
    None => fail("parse failed")
  }
}

///|
test "roundtrip: print then parse" {
  let parser = expr_parser()
  let printer = expr_printer()
  let expr = Expr::Add(Expr::Lit(1), Expr::Mul(Expr::Lit(2), Expr::Lit(3)))
  let printed = printer.print(expr)
  inspect(printed, content="Some(\"1 + 2 * 3\")")
  match printed {
    Some(s) =>
      inspect(parser.parse(s), content="Some(Add(Lit(1), Mul(Lit(2), Lit(3))))")
    None => fail("print failed")
  }
}
