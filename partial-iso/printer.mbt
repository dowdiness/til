///|
/// Printer implementation using partial isomorphisms.
/// Uses the backward (unapply) direction of isomorphisms.

///|
pub struct Printer[A] {
  run : (A) -> String?
}

///|
pub fn[A] Printer::new(run : (A) -> String?) -> Printer[A] {
  { run, }
}

///|
pub fn[A] Printer::print(self : Printer[A], a : A) -> String? {
  (self.run)(a)
}

///|
/// Map using a partial isomorphism (IsoFunctor) - uses unapply direction
pub fn[A, B] Printer::iso_map(self : Printer[A], iso : Iso[A, B]) -> Printer[B] {
  {
    run: fn(b) {
      match iso.unapply(b) {
        Some(a) => (self.run)(a)
        None => None
      }
    },
  }
}

///|
/// Combine two printers sequentially (ProductFunctor)
pub fn[A, B] Printer::product(
  self : Printer[A],
  other : Printer[B],
) -> Printer[(A, B)] {
  {
    run: fn(pair) {
      match ((self.run)(pair.0), (other.run)(pair.1)) {
        (Some(s1), Some(s2)) => Some(s1 + s2)
        _ => None
      }
    },
  }
}

///|
/// Print first, then print second (discarding its value)
pub fn[A] Printer::skip_right(
  self : Printer[A],
  other : Printer[Unit],
) -> Printer[A] {
  {
    run: fn(a) {
      match ((self.run)(a), (other.run)(())) {
        (Some(s1), Some(s2)) => Some(s1 + s2)
        _ => None
      }
    },
  }
}

///|
/// Print first (discarding its value), then print second
pub fn[B] Printer::skip_left(
  self : Printer[Unit],
  other : Printer[B],
) -> Printer[B] {
  {
    run: fn(b) {
      match ((self.run)(()), (other.run)(b)) {
        (Some(s1), Some(s2)) => Some(s1 + s2)
        _ => None
      }
    },
  }
}

///|
/// Empty printer that always fails (Alternative)
pub fn[A] Printer::empty() -> Printer[A] {
  { run: fn(_) { None } }
}

///|
/// Try first printer, if fails try second (Alternative)
pub fn[A] Printer::alt(self : Printer[A], other : Printer[A]) -> Printer[A] {
  {
    run: fn(a) {
      match (self.run)(a) {
        Some(s) => Some(s)
        None => (other.run)(a)
      }
    },
  }
}

///|
/// Pure printer that outputs empty string
pub fn[A] Printer::pure(_a : A) -> Printer[A] {
  { run: fn(_) { Some("") } }
}

///|
/// Print a single character
pub fn Printer::token() -> Printer[Char] {
  { run: fn(c) { Some(c.to_string()) } }
}

///|
/// Print a specific character (checks that input matches)
pub fn print_char(c : Char) -> Printer[Unit] {
  Printer::token().iso_map(literal(c).inverse())
}

///|
/// Print a specific string
pub fn print_text(s : String) -> Printer[Unit] {
  { run: fn(_) { Some(s) } }
}

///|
/// Print zero or more occurrences
pub fn[A] print_many(p : Printer[A]) -> Printer[Array[A]] {
  {
    run: fn(arr) {
      let sb = StringBuilder::new()
      for item in arr {
        match (p.run)(item) {
          Some(s) => sb.write_string(s)
          None => return None
        }
      }
      Some(sb.to_string())
    },
  }
}

///|
/// Print one or more occurrences
pub fn[A] print_many1(p : Printer[A]) -> Printer[Array[A]] {
  {
    run: fn(arr) {
      if arr.is_empty() {
        return None
      }
      let sb = StringBuilder::new()
      for item in arr {
        match (p.run)(item) {
          Some(s) => sb.write_string(s)
          None => return None
        }
      }
      Some(sb.to_string())
    },
  }
}

///|
/// Print a digit
pub fn print_digit() -> Printer[Char] {
  Printer::token().iso_map(subset(fn(c : Char) { c >= '0' && c <= '9' }))
}

///|
/// Print an integer
pub fn print_integer() -> Printer[Int] {
  print_many1(print_digit()).iso_map(print_digits_to_int_iso())
}

///|
fn print_digits_to_int_iso() -> Iso[Array[Char], Int] {
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
