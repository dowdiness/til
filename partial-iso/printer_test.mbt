///|
test "Printer::token prints single character" {
  let p : Printer[Char] = Printer::token()
  inspect(p.print('a'), content="Some(\"a\")")
}

///|
test "Printer::pure prints empty string" {
  let p : Printer[Int] = Printer::pure(42)
  inspect(p.print(42), content="Some(\"\")")
  inspect(p.print(0), content="Some(\"\")")
}

///|
test "print_text prints specific string" {
  let p = print_text("hello")
  inspect(p.print(()), content="Some(\"hello\")")
}

///|
test "print_digit prints digit character" {
  let p = print_digit()
  inspect(p.print('5'), content="Some(\"5\")")
  inspect(p.print('a'), content="None")
}

///|
test "print_integer prints positive integers" {
  let p = print_integer()
  inspect(p.print(123), content="Some(\"123\")")
  inspect(p.print(0), content="Some(\"0\")")
}

///|
test "Printer::alt tries alternatives" {
  let p1 : Printer[Int] = print_integer().iso_map(
    Iso::new(fn(n) { Some(n) }, fn(n) { if n > 0 { Some(n) } else { None } }),
  )
  let p2 : Printer[Int] = Printer::new(fn(_) { Some("zero") })
  let p = p1.alt(p2)
  inspect(p.print(5), content="Some(\"5\")")
  inspect(p.print(0), content="Some(\"zero\")")
}

///|
test "Printer::product combines printers" {
  let p = print_digit().product(print_digit())
  inspect(p.print(('1', '2')), content="Some(\"12\")")
}

///|
test "Printer::iso_map transforms input" {
  let p = print_integer().iso_map(
    Iso::new(fn(n) { Some(n * 2) }, fn(n) {
      if n % 2 == 0 {
        Some(n / 2)
      } else {
        None
      }
    }),
  )
  inspect(p.print(10), content="Some(\"5\")")
  inspect(p.print(11), content="None")
}
