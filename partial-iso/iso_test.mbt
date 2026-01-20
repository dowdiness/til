///|
test "Iso::id applies both ways" {
  let id : Iso[Int, Int] = Iso::id()
  inspect(id.apply(42), content="Some(42)")
  inspect(id.unapply(42), content="Some(42)")
}

///|
test "Iso::inverse swaps directions" {
  let iso = Iso::new(fn(n : Int) { Some(n.to_string()) }, fn(s : String) {
    Some(@strconv.parse_int(s)) catch {
      _ => None
    }
  })
  let inv = iso.inverse()
  inspect(inv.apply("123"), content="Some(123)")
  inspect(inv.unapply(123), content="Some(\"123\")")
}

///|
test "compose chains isomorphisms" {
  let double = Iso::new(fn(n : Int) { Some(n * 2) }, fn(n : Int) {
    if n % 2 == 0 {
      Some(n / 2)
    } else {
      None
    }
  })
  let add_one = Iso::new(fn(n : Int) { Some(n + 1) }, fn(n : Int) {
    Some(n - 1)
  })
  // (n * 2) + 1
  let composed = compose(add_one, double)
  inspect(composed.apply(5), content="Some(11)")
  inspect(composed.unapply(11), content="Some(5)")
}

///|
test "literal matches specific value" {
  let lit_a = literal('a')
  inspect(lit_a.apply(()), content="Some('a')")
  inspect(lit_a.unapply('a'), content="Some(())")
  inspect(lit_a.unapply('b'), content="None")
}

///|
test "subset filters values" {
  let positive = subset(fn(n : Int) { n > 0 })
  inspect(positive.apply(5), content="Some(5)")
  inspect(positive.apply(-3), content="None")
  inspect(positive.unapply(5), content="Some(5)")
  inspect(positive.unapply(-3), content="None")
}

///|
test "associate restructures tuples" {
  let assoc : Iso[(Int, (String, Bool)), ((Int, String), Bool)] = associate()
  inspect(assoc.apply((1, ("a", true))), content="Some(((1, \"a\"), true))")
  inspect(assoc.unapply(((1, "a"), true)), content="Some((1, (\"a\", true)))")
}

///|
test "commute swaps tuple elements" {
  let comm : Iso[(Int, String), (String, Int)] = commute()
  inspect(comm.apply((1, "a")), content="Some((\"a\", 1))")
  inspect(comm.unapply(("a", 1)), content="Some((1, \"a\"))")
}

///|
test "product applies isos to tuple components" {
  let double = Iso::new(fn(n : Int) { Some(n * 2) }, fn(n : Int) {
    if n % 2 == 0 {
      Some(n / 2)
    } else {
      None
    }
  })
  let upper = Iso::new(
    fn(c : Char) { Some(Int::unsafe_to_char(c.to_int() - 32)) },
    fn(c : Char) { Some(Int::unsafe_to_char(c.to_int() + 32)) },
  )
  let prod = product(double, upper)
  inspect(prod.apply((5, 'a')), content="Some((10, 'A'))")
  inspect(prod.unapply((10, 'A')), content="Some((5, 'a'))")
}
