///|
/// Parser implementation using partial isomorphisms.
/// Uses the forward (apply) direction of isomorphisms.

///|
pub struct Parser[A] {
  run : (String) -> (A, String)?
}

///|
pub fn[A] Parser::new(run : (String) -> (A, String)?) -> Parser[A] {
  { run, }
}

///|
pub fn[A] Parser::parse(self : Parser[A], input : String) -> A? {
  match (self.run)(input) {
    Some((a, rest)) => if rest.is_empty() { Some(a) } else { None }
    None => None
  }
}

///|
pub fn[A] Parser::parse_partial(
  self : Parser[A],
  input : String,
) -> (A, String)? {
  (self.run)(input)
}

///|
/// Map using a partial isomorphism (IsoFunctor)
pub fn[A, B] Parser::iso_map(self : Parser[A], iso : Iso[A, B]) -> Parser[B] {
  {
    run: fn(input) {
      match (self.run)(input) {
        Some((a, rest)) =>
          match iso.apply(a) {
            Some(b) => Some((b, rest))
            None => None
          }
        None => None
      }
    },
  }
}

///|
/// Combine two parsers sequentially (ProductFunctor)
pub fn[A, B] Parser::product(
  self : Parser[A],
  other : Parser[B],
) -> Parser[(A, B)] {
  {
    run: fn(input) {
      match (self.run)(input) {
        Some((a, rest1)) =>
          match (other.run)(rest1) {
            Some((b, rest2)) => Some(((a, b), rest2))
            None => None
          }
        None => None
      }
    },
  }
}

///|
/// Parse first, discard second but consume it
pub fn[A] Parser::skip_right(
  self : Parser[A],
  other : Parser[Unit],
) -> Parser[A] {
  {
    run: fn(input) {
      match (self.run)(input) {
        Some((a, rest1)) =>
          match (other.run)(rest1) {
            Some((_, rest2)) => Some((a, rest2))
            None => None
          }
        None => None
      }
    },
  }
}

///|
/// Discard first but consume it, parse second
pub fn[B] Parser::skip_left(
  self : Parser[Unit],
  other : Parser[B],
) -> Parser[B] {
  {
    run: fn(input) {
      match (self.run)(input) {
        Some((_, rest1)) =>
          match (other.run)(rest1) {
            Some((b, rest2)) => Some((b, rest2))
            None => None
          }
        None => None
      }
    },
  }
}

///|
/// Empty parser that always fails (Alternative)
pub fn[A] Parser::empty() -> Parser[A] {
  { run: fn(_) { None } }
}

///|
/// Try first parser, if fails try second (Alternative)
pub fn[A] Parser::alt(self : Parser[A], other : Parser[A]) -> Parser[A] {
  {
    run: fn(input) {
      match (self.run)(input) {
        Some(result) => Some(result)
        None => (other.run)(input)
      }
    },
  }
}

///|
/// Pure parser that succeeds with value without consuming input
pub fn[A] Parser::pure(a : A) -> Parser[A] {
  { run: fn(input) { Some((a, input)) } }
}

///|
/// Delayed parser - delays construction until parsing time (for recursive grammars)
pub fn[A] Parser::delayed(thunk : () -> Parser[A]) -> Parser[A] {
  {
    run: fn(input) {
      let p = thunk()
      (p.run)(input)
    },
  }
}

///|
/// Parse a single character
pub fn Parser::token() -> Parser[Char] {
  {
    run: fn(input) {
      if input.is_empty() {
        None
      } else {
        let chars = input.iter().collect()
        let rest = chars[1:]
          .iter()
          .fold(init=StringBuilder::new(), fn(sb, c) {
            sb.write_char(c)
            sb
          })
          .to_string()
        Some((chars[0], rest))
      }
    },
  }
}

///|
/// Parse a specific character
pub fn char_(c : Char) -> Parser[Unit] {
  Parser::token().iso_map(literal(c).inverse())
}

///|
/// Parse a specific string
pub fn text(s : String) -> Parser[Unit] {
  if s.is_empty() {
    Parser::pure(())
  } else {
    let chars : Array[Char] = s.iter().collect()
    let mut result : Parser[Unit] = char_(chars[0])
    for i = 1; i < chars.length(); i = i + 1 {
      result = result.skip_left(char_(chars[i]))
    }
    result
  }
}

///|
/// Parse zero or more occurrences
pub fn[A] many(p : Parser[A]) -> Parser[Array[A]] {
  {
    run: fn(input) {
      let results : Array[A] = []
      let mut remaining = input
      while true {
        match (p.run)(remaining) {
          Some((a, rest)) => {
            results.push(a)
            remaining = rest
          }
          None => break
        }
      }
      Some((results, remaining))
    },
  }
}

///|
/// Parse one or more occurrences
pub fn[A] many1(p : Parser[A]) -> Parser[Array[A]] {
  {
    run: fn(input) {
      match (p.run)(input) {
        Some((first, rest)) => {
          let results = [first]
          let mut remaining = rest
          while true {
            match (p.run)(remaining) {
              Some((a, r)) => {
                results.push(a)
                remaining = r
              }
              None => break
            }
          }
          Some((results, remaining))
        }
        None => None
      }
    },
  }
}

///|
/// Parse a digit character
pub fn digit() -> Parser[Char] {
  Parser::token().iso_map(subset(fn(c : Char) { c >= '0' && c <= '9' }))
}

///|
/// Parse an integer
pub fn integer() -> Parser[Int] {
  many1(digit()).iso_map(digits_to_int_iso())
}

///|
fn digits_to_int_iso() -> Iso[Array[Char], Int] {
  {
    apply: fn(chars) {
      let mut n = 0
      for c in chars {
        n = n * 10 + (c.to_int() - '0'.to_int())
      }
      Some(n)
    },
    unapply: fn(n) {
      if n < 0 {
        None
      } else {
        let digits : Array[Char] = []
        let mut num = n
        if num == 0 {
          digits.push('0')
        } else {
          while num > 0 {
            digits.push(Int::unsafe_to_char(num % 10 + '0'.to_int()))
            num = num / 10
          }
          digits.rev_in_place()
        }
        Some(digits)
      }
    },
  }
}
