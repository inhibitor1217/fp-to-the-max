import { createInterface } from 'readline'

import { T } from '../lib'
import {
  type Program,
  type Console,
  type Random,
  type Main,
  main,
} from '../internals/main'

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

const app: Main<T.URI> = {
  ...program,
  ...console,
  ...random,
}

main(app)()
