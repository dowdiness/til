///|
test "Syntax::token roundtrips" {
  let s = Syntax::token()
  inspect(s.parse("a"), content="Some('a')")
  inspect(s.print('a'), content="Some(\"a\")")
}

///|
test "syntax_char roundtrips" {
  let s = syntax_char('x')
  inspect(s.parse("x"), content="Some(())")
  inspect(s.print(()), content="Some(\"x\")")
}

///|
test "syntax_text roundtrips" {
  let s = syntax_text("hello")
  inspect(s.parse("hello"), content="Some(())")
  inspect(s.print(()), content="Some(\"hello\")")
}

///|
test "syntax_integer roundtrips" {
  let s = syntax_integer()
  inspect(s.parse("42"), content="Some(42)")
  inspect(s.print(42), content="Some(\"42\")")
  inspect(s.print(0), content="Some(\"0\")")
}

///|
test "Syntax::product combines" {
  let s = syntax_digit().product(syntax_digit())
  inspect(s.parse("12"), content="Some(('1', '2'))")
  inspect(s.print(('1', '2')), content="Some(\"12\")")
}

///|
test "Syntax::alt tries alternatives" {
  let s = syntax_char('a').alt(syntax_char('b'))
  inspect(s.parse("a"), content="Some(())")
  inspect(s.parse("b"), content="Some(())")
  inspect(s.parse("c"), content="None")
}

///|
test "Syntax::iso_map transforms" {
  let double_iso = Iso::new(fn(n : Int) { Some(n * 2) }, fn(n : Int) {
    if n % 2 == 0 {
      Some(n / 2)
    } else {
      None
    }
  })
  let s = syntax_integer().iso_map(double_iso)
  // Parse "5" → 5 → double → 10
  inspect(s.parse("5"), content="Some(10)")
  // Print 10 → halve → 5 → "5"
  inspect(s.print(10), content="Some(\"5\")")
}

///|
test "Syntax::skip_right keeps left" {
  let s = syntax_digit().skip_right(syntax_char(','))
  inspect(s.parse("1,"), content="Some('1')")
  inspect(s.print('1'), content="Some(\"1,\")")
}

///|
test "Syntax::skip_left keeps right" {
  let s = syntax_char('(').skip_left(syntax_digit())
  inspect(s.parse("(5"), content="Some('5')")
  inspect(s.print('5'), content="Some(\"(5\")")
}

///|
test "syntax_many parses zero or more" {
  let s = syntax_many(syntax_digit())
  inspect(s.parse(""), content="Some([])")
  inspect(s.parse("123"), content="Some(['1', '2', '3'])")
  inspect(s.print([]), content="Some(\"\")")
  inspect(s.print(['1', '2']), content="Some(\"12\")")
}

///|
test "unified syntax description works both ways" {
  // Define a simple pair syntax: digit ":" digit
  let pair_syntax = syntax_digit()
    .skip_right(syntax_char(':'))
    .product(syntax_digit())

  // Use as parser
  inspect(pair_syntax.parse("1:2"), content="Some(('1', '2'))")

  // Use as printer
  inspect(pair_syntax.print(('1', '2')), content="Some(\"1:2\")")
}
