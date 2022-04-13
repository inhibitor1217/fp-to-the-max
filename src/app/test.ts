import {
  type Program,
  type Console,
  type Random,
  type Main,
  main,
} from '../internals/main'

/* State monad */
interface State<S, A> {
  (s: S): [A, S]
}

const map = <A, B>(f: (a: A) => B) => <S>(fa: State<S, A>): State<S, B> => s => {
  const [a, s_] = fa(s)
  return [f(a), s_]
}

const chain = <S, A, B>(f: (a: A) => State<S, B>) => (fa: State<S, A>): State<S, B> => s => {
  const [a, s_] = fa(s)
  return f(a)(s_)
}

const chainFirst = <S, A, B>(f: (a: A) => State<S, B>) => (fa: State<S, A>): State<S, A> => s => {
  const [a, s_] = fa(s)
  const [, s__] = f(a)(s_)
  return [a, s__]
}

const of = <S, A>(a: A): State<S, A> => s => [a, s]

const URI = 'Test'
type URI = typeof URI

type Testcase = {
  inputs: string[]
  outputs: string[]
  rng: number[]
}

declare module '../lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: State<Testcase, A>
  }
}

const program: Program<URI> = {
  map,
  chain,
  chainFirst,
  finish: of,
}

const console: Console<URI> = {
  putLine: str => ({ outputs, ...testcase }) => [void 0, { ...testcase, outputs: [...outputs, str] }],
  getLine: () => ({ inputs, ...testcase }) => [inputs[0], { ...testcase, inputs: inputs.slice(1) }],
}

const random: Random<URI> = {
  randomInt: bound => ({ rng, ...testcase }) => [rng[0], { ...testcase, rng: rng.slice(1) }],
}

const app: Main<URI> = {
  ...program,
  ...console,
  ...random,
}

global.console.log(
  'Test1',
  main(app)({
    inputs: ['alice', '3', 'n'],
    outputs: [],
    rng: [2],
  })
)

global.console.log(
  'Test2',
  main(app)({
    inputs: ['bob', '3', 'n'],
    outputs: [],
    rng: [4],
  })
)

global.console.log(
  'Test3',
  main(app)({
    inputs: ['charlie', '2', 'y', '1', 'n'],
    outputs: [],
    rng: [1, 3],
  })
)
