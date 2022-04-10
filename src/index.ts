import { createInterface } from 'readline'

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

const readLine = (): Promise<string> =>
  new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question('> ', answer => {
      rl.close()
      resolve(answer)
    })
  })

const randomInt = (bound: number): number =>
  Math.floor(Math.random() * bound)

const main = async () => {
  console.log('What is your name?')

  const name = await readLine()

  console.log(`Hello, ${name}, welcome to the game!`)

  let exec = true

  while (exec) {
    const num = randomInt(5) + 1

    console.log(`Dear ${name}, please guess a number from 1 to 5:`)

    O.fold(
      () => console.log('You did not enter a number'),
      (guess: number) => {
        if (guess === num) console.log(`You guessed right, ${name}!`)
        else console.log(`You guessed wrong, ${name}! The number was: ${num}`)
      }
    )(parseInt(await readLine()))

    console.log(`Do you want to continue, ${name}?`)

    switch (await readLine()) {
      case 'y':
        exec = true
        break
      case 'n':
        exec = false
        break
    }
  }
}

main()
