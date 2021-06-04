import * as T from "@effect-ts/core/Effect"
import type { Clock } from "@effect-ts/core/Effect/Clock"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as L from "@effect-ts/core/Effect/Layer"
import * as P from "@effect-ts/core/Effect/Promise"
import type * as Random from "@effect-ts/core/Effect/Random"
import type { Has } from "@effect-ts/core/Has"
import { identity, pipe } from "@effect-ts/system/Function"
import type * as Annotations from "@effect-ts/system/Testing/Annotations"
import * as FibersPerTest from "@effect-ts/system/Testing/FibersPerTest"
import * as Live from "@effect-ts/system/Testing/Live"
import * as TestClock from "@effect-ts/system/Testing/TestClock"
import * as TE from "@effect-ts/system/Testing/TestEnvironment"

class MainProvider<R1, E, R> {
  constructor(
    readonly allocate: T.Effect<R1, E, boolean>,
    readonly release: T.UIO<void>,
    readonly provide: <R2, E1, A1>(
      self: T.Effect<R & R2, E1, A1>
    ) => T.Effect<R2, E | E1, A1>
  ) {}
}

function unsafeMainProvider<R1, E, R>(self: L.Layer<R1, E, R>) {
  const promise = P.unsafeMake<E, R>(F.None)
  const fref = {}

  return new MainProvider<R1, E, R>(
    T.gen(function* (_) {
      const x = yield* _(
        T.forkDaemon(
          pipe(
            T.accessM((_: R) => P.succeed(_)(promise)),
            T.zipRight(T.never),
            T.provideSomeLayer(self),
            T.catchAllCause((c) => P.halt_(promise, c))
          )
        )
      )
      fref["fiber"] = x
      yield* _(P.await(promise))
      return true
    }),
    T.suspend(() => {
      return F.interrupt(fref["fiber"])
    }),
    (self) => T.chain_(P.await(promise), (env) => T.provide(env)(self))
  )
}

export type TestEnvironment = Has<Annotations.Annotations> &
  Has<Live.Live> &
  Has<Clock> &
  Has<TestClock.TestClock> &
  Has<Random.Random>

export class TestRuntime<R, E> {
  constructor(
    readonly it: <E, A>(
      name: string,
      self: () => T.Effect<R & TestEnvironment, E, A>
    ) => void,
    readonly layer: L.Layer<unknown, E, R & TestEnvironment>,
    readonly provide: <R2, E1, A1>(
      self: T.Effect<R & TestEnvironment, E1, A1>
    ) => T.Effect<R2, E | E1, A1>
  ) {}
}

export function perTest<R1, E0>(
  f: <R, E, A>(_: T.Effect<R, E, A>) => T.Effect<R & R1, E, A>
) {
  return (_: TestRuntime<R1, E0>): TestRuntime<R1, E0> =>
    new TestRuntime((name, self) => _.it(name, () => f(self())), _.layer, _.provide)
}

export function runtime(): TestRuntime<TestEnvironment, never>
export function runtime<E, R>(
  f: (
    _: typeof TE.TestEnvironment,
    __: L.Layer<unknown, never, T.DefaultEnv>
  ) => L.Layer<unknown, E, R & TestEnvironment>
): TestRuntime<R, E>
export function runtime<E, R>(
  f?: (
    _: typeof TE.TestEnvironment,
    __: L.Layer<unknown, never, T.DefaultEnv>
  ) => L.Layer<unknown, E, R & TestEnvironment>
): TestRuntime<R, E> {
  const { allocate, provide, release } = unsafeMainProvider(
    // @ts-expect-error
    (f || identity)(TE.TestEnvironment, L.fromRawEffect(T.succeed(T.defaultEnv)))
  )

  beforeAll(() => T.runPromise(allocate), 60_000)
  afterAll(() => T.runPromise(release), 60_000)

  const it_ = <E, A>(name: string, self: () => T.Effect<R & TestEnvironment, E, A>) => {
    it(name, () => T.runPromise(provide(FibersPerTest.fibersPerTest(self()))))
  }

  return new TestRuntime(
    it_,
    L.fromRawEffect(provide(T.environment<R & TestEnvironment>())),
    provide
  )
}

export function shared<E, R>(layer: L.Layer<unknown, E, R>): L.Layer<unknown, E, R> {
  const { allocate, provide, release } = unsafeMainProvider(layer)

  beforeAll(() => T.runPromise(allocate))
  afterAll(() => T.runPromise(release))

  return L.fromRawEffect(provide(T.environment<R>()))
}

export function adjust(ms: number) {
  return T.accessServiceM(TestClock.TestClock)((_) => _.adjust(ms))
}

export function setTime(ms: number) {
  return T.accessServiceM(TestClock.TestClock)((_) => _.setTime(ms))
}

export const sleeps = T.accessServiceM(TestClock.TestClock)((_) => _.sleeps)

export const saveClock = T.accessServiceM(TestClock.TestClock)((_) => _.save)

export function live<E, A>(
  effect: T.Effect<T.DefaultEnv, E, A>
): T.Effect<Has<Live.Live>, E, A> {
  return T.accessServiceM(Live.Live)((_) => _.provide(effect))
}
