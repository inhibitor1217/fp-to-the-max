export interface Task<A> {
  (): Promise<A>
}

export const URI = 'Task'
export type URI = typeof URI

export const map = <A, B>(f: (a: A) => B) => (fa: Task<A>): Task<B> => () => fa().then(f)

export const chain = <A, B>(f: (a: A) => Task<B>) => (fa: Task<A>): Task<B> => () => fa().then(a => f(a)())

export const chainFirst = <A, B>(f: (a: A) => Task<B>) => (fa: Task<A>): Task<A> => () =>
  fa().then(a => f(a)().then(() => a))

export const of = <A>(a: A): Task<A> => () => Promise.resolve(a)

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: Task<A>
  }
}
