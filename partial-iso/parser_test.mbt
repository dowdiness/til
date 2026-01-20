///|
test "Parser::token parses single character" {
  let p : Parser[Char] = Parser::token()
  inspect(p.parse("a"), content="Some('a')")
  inspect(p.parse(""), content="None")
  inspect(p.parse("ab"), content="None")
}

///|
test "Parser::pure returns value without consuming" {
  let p : Parser[Int] = Parser::pure(42)
  inspect(p.parse(""), content="Some(42)")
  inspect(p.parse("abc"), content="None")
}

///|
test "char_ parses specific character" {
  let p = char_('x')
  inspect(p.parse("x"), content="Some(())")
  inspect(p.parse("y"), content="None")
}

///|
test "text parses specific string" {
  let p = text("hello")
  inspect(p.parse("hello"), content="Some(())")
  inspect(p.parse("hell"), content="None")
  inspect(p.parse("hello!"), content="None")
}

///|
test "digit parses digit character" {
  let p = digit()
  inspect(p.parse("5"), content="Some('5')")
  inspect(p.parse("a"), content="None")
}

///|
test "integer parses positive integers" {
  let p = integer()
  inspect(p.parse("123"), content="Some(123)")
  inspect(p.parse("0"), content="Some(0)")
  inspect(p.parse("abc"), content="None")
}

///|
test "many parses zero or more" {
  let p = many(digit())
  inspect(p.parse(""), content="Some([])")
  inspect(p.parse("123"), content="Some(['1', '2', '3'])")
}

///|
test "Parser::alt tries alternatives" {
  let p = char_('a').alt(char_('b'))
  inspect(p.parse("a"), content="Some(())")
  inspect(p.parse("b"), content="Some(())")
  inspect(p.parse("c"), content="None")
}

///|
test "Parser::product combines parsers" {
  let p = digit().product(digit())
  inspect(p.parse("12"), content="Some(('1', '2'))")
  inspect(p.parse("1"), content="None")
}

///|
test "Parser::iso_map transforms result" {
  let p = integer().iso_map(
    Iso::new(fn(n) { Some(n * 2) }, fn(n) {
      if n % 2 == 0 {
        Some(n / 2)
      } else {
        None
      }
    }),
  )
  inspect(p.parse("5"), content="Some(10)")
}
