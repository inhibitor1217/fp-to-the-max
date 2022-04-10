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
