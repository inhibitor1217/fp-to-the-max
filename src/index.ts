import { createInterface } from 'readline'

namespace F {
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
}

namespace T {
  export interface Task<A> {
    (): Promise<A>
  }

  export const map = <A, B>(f: (a: A) => B) => (fa: Task<A>): Task<B> => () => fa().then(f)

  export const chain = <A, B>(f: (a: A) => Task<B>) => (fa: Task<A>): Task<B> => () => fa().then(a => f(a)())

  export const chainFirst = <A, B>(f: (a: A) => Task<B>) => (fa: Task<A>): Task<A> => () =>
    fa().then(a => f(a)().then(() => a))

  export const of = <A>(a: A): Task<A> => () => Promise.resolve(a)
}

namespace O {
  export interface None {
    readonly _tag: 'None'
  }

  export interface Some<A> {
    readonly _tag: 'Some'
    readonly value: A
  }

  export type Option<A> = None | Some<A>
  
  export const none: None = { _tag: 'None' }

  export const some = <A>(a: A): Option<A> => ({ _tag: 'Some', value: a })

  export const isNone = (fa: Option<unknown>): fa is None => fa._tag === 'None'

  export const isSome = <A>(fa: Option<A>): fa is Some<A> => fa._tag === 'Some'

  export const fold = <A, B>(
    onNone: () => B,
    onSome: (a: A) => B,
  ) => (fa: Option<A>): B => (
    isSome(fa)
      ? onSome(fa.value)
      : onNone()
  )
}

const parseInt = (str: string): O.Option<number> => {
  const s = +str
  if (isNaN(s) || s % 1 !== 0) return O.none
  return O.some(s)
}

/* Higher ordered types (a.k.a Kinds) */
namespace HKT {
  interface URItoKind<A> {}

  export type URIS = keyof URItoKind<any>

  /**
   * `* -> *`
   */
  export type Kind<URI extends URIS, A> = URI extends URIS ? URItoKind<A>[URI] : any
}

/* type classes */
interface Program<F extends HKT.URIS> {
  readonly finish: <A>(a: A) => HKT.Kind<F, A>
  readonly map: <A, B>(ab: (a: A) => B) => (fa: HKT.Kind<F, A>) => HKT.Kind<F, B>
  readonly chain: <A, B>(afb: (a: A) => HKT.Kind<F, B>) => (fa: HKT.Kind<F, A>) => HKT.Kind<F, B>
  readonly chainFirst: <A, B>(afb: (a: A) => HKT.Kind<F, B>) => (fa: HKT.Kind<F, A>) => HKT.Kind<F, A>
}

interface Console<F extends HKT.URIS> {
  readonly putLine: (str: string) => HKT.Kind<F, void>
  readonly getLine: () => HKT.Kind<F, string>
}

interface Random<F extends HKT.URIS> {
  readonly randomInt: (bound: number) => HKT.Kind<F, number>
}

interface Main<F extends HKT.URIS> extends
  Program<F>,
  Console<F>,
  Random<F> {}

const putLine = (str: string): T.Task<void> => () => Promise.resolve(console.log(str))

const getLine = (): T.Task<string> =>
  () => new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question('> ', answer => {
      rl.close()
      resolve(answer)
    })
  })

const randomInt = (bound: number): T.Task<number> =>
  () => Promise.resolve(Math.floor(Math.random() * bound))

const checkContinue = (): T.Task<boolean> =>
  F.pipe(
    getLine(),
    T.chain(line => {
      switch (line.toLowerCase()) {
        case 'y':
          return T.of(true)
        case 'n':
          return T.of(false)
        default:
          return checkContinue()
      }
    }),
  )

const gameLoop = (name: string): T.Task<void> =>
  F.pipe(
    randomInt(5),
    T.map(num => num + 1),
    T.chainFirst(() => putLine(`Dear ${name}, please guess a number from 1 to 5:`)),
    T.chain(num =>
       F.pipe(
         getLine(),
         T.map(parseInt),
         T.chain(O.fold(
           () => putLine('You did not enter a number'),
           guess => (
              guess === num
                ? putLine(`You guessed right, ${name}!`)
                : putLine(`You guessed wrong, ${name}! The number was: ${num}`)
           ),
         )),
       )
    ),
    T.chain(() => putLine(`Do you want to continue, ${name}?`)),
    T.chain(checkContinue),
    T.chain(cont => cont ? gameLoop(name) : T.of(void 0)),
  )

const main = (): T.Task<void> =>
  F.pipe(
    putLine('What is your name?'),
    T.chain(getLine),
    T.chainFirst(name => putLine(`Hello, ${name}, welcome to the game!`)),
    T.chain(gameLoop),
  )

main()()
