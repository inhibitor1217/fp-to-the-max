import { createInterface } from 'readline'

namespace T {
  export interface Task<A> {
    (): Promise<A>
  }

  export const map = <A, B>(f: (a: A) => B) => (fa: Task<A>): Task<B> => () => fa().then(f)

  export const chain = <A, B>(f: (a: A) => Task<B>) => (fa: Task<A>): Task<B> => () => fa().then(a => f(a)())

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

const putLine = (str: string): T.Task<void> => () => Promise.resolve(console.log(str))

const getLine = (): T.Task<string> =>
  () => new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question('> ', answer => {
      rl.close()
      resolve(answer)
    })
  })

const randomInt = (bound: number): number =>
  Math.floor(Math.random() * bound)

const main = (): T.Task<any> => {
  return T.chain(name => putLine(`Hello, ${name}, welcome to the game!`))
    (T.chain(getLine)
    (putLine('What is your name?')))

  // let exec = true

  // while (exec) {
  //   const num = randomInt(5) + 1

  //   putLine(`Dear ${name}, please guess a number from 1 to 5:`)

  //   O.fold(
  //     () => putLine('You did not enter a number'),
  //     (guess: number) => {
  //       if (guess === num) putLine(`You guessed right, ${name}!`)
  //       else putLine(`You guessed wrong, ${name}! The number was: ${num}`)
  //     }
  //   )(parseInt(await readLine()))

  //   putLine(`Do you want to continue, ${name}?`)

  //   let cont = true
  //   while (cont) {
  //     cont = false
  //     switch ((await readLine()).toLowerCase()) {
  //       case 'y':
  //         exec = true
  //         break
  //       case 'n':
  //         exec = false
  //         break
  //       default:
  //         cont = true
  //         break
  //     }
  //   }
  // }
}

main()()
