import { createInterface } from 'readline'
import { F, HKT, O, T } from './lib'

const parseInt = (str: string): O.Option<number> => {
  const s = +str
  if (isNaN(s) || s % 1 !== 0) return O.none
  return O.some(s)
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

const checkContinue = <URI extends HKT.URIS>(
  app:
    & Program<URI>
    & Console<URI>,
): HKT.Kind<URI, boolean> => {
  const {
    finish,
    chain,
    getLine,
  } = app

  return F.pipe(
    getLine(),
    chain(line => {
      switch (line.toLowerCase()) {
        case 'y':
          return finish(true)
        case 'n':
          return finish(false)
        default:
          return checkContinue(app)
      }
    }),
  )
}

const gameLoop = <URI extends HKT.URIS>(
  app:
    & Program<URI>
    & Console<URI>
    & Random<URI>,
  name: string,
): HKT.Kind<URI, void> => {
  const {
    finish,
    map,
    chain,
    chainFirst,
    putLine,
    getLine,
    randomInt,
  } = app

  return F.pipe(
    randomInt(5),
    map(num => num + 1),
    chainFirst(() => putLine(`Dear ${name}, please guess a number from 1 to 5:`)),
    chain(num =>
       F.pipe(
         getLine(),
         map(parseInt),
         chain(O.fold(
           () => putLine('You did not enter a number'),
           guess => (
              guess === num
                ? putLine(`You guessed right, ${name}!`)
                : putLine(`You guessed wrong, ${name}! The number was: ${num}`)
           ),
         )),
       )
    ),
    chain(() => putLine(`Do you want to continue, ${name}?`)),
    chain(() => checkContinue(app)),
    chain(cont => cont ? gameLoop(app, name) : finish(void 0)),
  )
}

const main = <URI extends HKT.URIS>(app: Main<URI>): HKT.Kind<URI, void> => {
  const {
    chain,
    chainFirst,
    putLine,
    getLine,
  } = app

  return F.pipe(
    putLine('What is your name?'),
    chain(getLine),
    chainFirst(name => putLine(`Hello, ${name}, welcome to the game!`)),
    chain(name => gameLoop(app, name)),
  )
}

namespace RealApplication {
  const program: Program<T.URI> = {
    map: T.map,
    chain: T.chain,
    chainFirst: T.chainFirst,
    finish: T.of,
  }

  const console: Console<T.URI> = {
    putLine: str => () => Promise.resolve(global.console.log(str)),
    getLine: () =>
      () => new Promise(resolve => {
        const rl = createInterface({ input: process.stdin, output: process.stdout })
        rl.question('> ', answer => {
          rl.close()
          resolve(answer)
        })
      }),
  }

  const random: Random<T.URI> = {
    randomInt: bound => () => Promise.resolve(Math.floor(Math.random() * bound))
  }

  export const app: Main<T.URI> = {
    ...program,
    ...console,
    ...random,
  }
}

main(RealApplication.app)()
