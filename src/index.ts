import { createInterface } from 'readline'

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

    const guess = parseInt(await readLine())

    if (guess === num) console.log(`You guessed right, ${name}!`)
    else console.log(`You guessed wrong, ${name}! The number was: ${num}`)

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
