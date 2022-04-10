export type Pipe = {
  <A>(a: A): A
  <A, B>(a: A, ab: (a: A) => B): B
  <A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
  <A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
  <A, B, C, D, E>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E): E
  <A, B, C, D, E, F>(
    a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E,
    ef: (e: E) => F,
  ): F
  <A, B, C, D, E, F, G>(
    a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E,
    ef: (e: E) => F, fg: (f: F) => G
  ): G
}

export const pipe: Pipe = (a: any, ...fs: any[]) => fs.reduce((p, f) => f(p), a)
