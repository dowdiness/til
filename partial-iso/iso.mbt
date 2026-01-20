///|
/// Partial Isomorphisms for Unifying Parsing and Pretty Printing
/// Based on: Rendel & Ostermann 2010 - "Invertible Syntax Descriptions"

///|
/// A partial isomorphism between types A and B.
/// Represents a pair of partial inverse functions.
pub struct Iso[A, B] {
  apply : (A) -> B?
  unapply : (B) -> A?
}

///|
/// Create a new partial isomorphism from two partial functions.
pub fn[A, B] Iso::new(apply : (A) -> B?, unapply : (B) -> A?) -> Iso[A, B] {
  { apply, unapply }
}

///|
/// Apply the isomorphism in the forward direction.
pub fn[A, B] Iso::apply(self : Iso[A, B], a : A) -> B? {
  (self.apply)(a)
}

///|
/// Apply the isomorphism in the backward direction.
pub fn[A, B] Iso::unapply(self : Iso[A, B], b : B) -> A? {
  (self.unapply)(b)
}

///|
/// Invert the isomorphism, swapping forward and backward directions.
pub fn[A, B] Iso::inverse(self : Iso[A, B]) -> Iso[B, A] {
  { apply: self.unapply, unapply: self.apply }
}

///|
/// Identity isomorphism.
pub fn[A] Iso::id() -> Iso[A, A] {
  { apply: fn(a) { Some(a) }, unapply: fn(a) { Some(a) } }
}

///|
/// Compose two isomorphisms (categorical composition).
/// compose(g, f) means: first apply f, then apply g.
pub fn[A, B, C] compose(g : Iso[B, C], f : Iso[A, B]) -> Iso[A, C] {
  {
    apply: fn(a) { f.apply(a).bind(fn(b) { g.apply(b) }) },
    unapply: fn(c) { g.unapply(c).bind(fn(b) { f.unapply(b) }) },
  }
}

///|
/// Operator for composition: g << f means compose(g, f)
pub fn[A, B, C] op_shl(g : Iso[B, C], f : Iso[A, B]) -> Iso[A, C] {
  compose(g, f)
}

///|
/// Apply isomorphism to both components of a tuple (bifunctor map).
pub fn[A, B, C, D] product(i : Iso[A, B], j : Iso[C, D]) -> Iso[(A, C), (B, D)] {
  {
    apply: fn(pair) {
      match (i.apply(pair.0), j.apply(pair.1)) {
        (Some(b), Some(d)) => Some((b, d))
        _ => None
      }
    },
    unapply: fn(pair) {
      match (i.unapply(pair.0), j.unapply(pair.1)) {
        (Some(a), Some(c)) => Some((a, c))
        _ => None
      }
    },
  }
}

///|
/// Reassociate nested tuples: (a, (b, c)) <-> ((a, b), c)
pub fn[A, B, C] associate() -> Iso[(A, (B, C)), ((A, B), C)] {
  {
    apply: fn(t) { Some(((t.0, t.1.0), t.1.1)) },
    unapply: fn(t) { Some((t.0.0, (t.0.1, t.1))) },
  }
}

///|
/// Flip tuple components: (a, b) <-> (b, a)
pub fn[A, B] commute() -> Iso[(A, B), (B, A)] {
  { apply: fn(t) { Some((t.1, t.0)) }, unapply: fn(t) { Some((t.1, t.0)) } }
}

///|
/// Unit introduction/elimination on the right: a <-> (a, ())
pub fn[A] unit_right() -> Iso[A, (A, Unit)] {
  { apply: fn(a) { Some((a, ())) }, unapply: fn(t) { Some(t.0) } }
}

///|
/// Unit introduction/elimination on the left: a <-> ((), a)
pub fn[A] unit_left() -> Iso[A, (Unit, A)] {
  { apply: fn(a) { Some(((), a)) }, unapply: fn(t) { Some(t.1) } }
}

///|
/// Subset isomorphism: filters values by a predicate.
pub fn[A] subset(pred : (A) -> Bool) -> Iso[A, A] {
  {
    apply: fn(a) { if pred(a) { Some(a) } else { None } },
    unapply: fn(a) { if pred(a) { Some(a) } else { None } },
  }
}

///|
/// Literal isomorphism: matches a specific value.
pub fn[A : Eq] literal(value : A) -> Iso[Unit, A] {
  {
    apply: fn(_) { Some(value) },
    unapply: fn(a) { if a == value { Some(()) } else { None } },
  }
}
