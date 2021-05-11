import * as Tp from "@effect-ts/core/Collections/Immutable/Tuple"
import * as T from "@effect-ts/core/Effect"
import type { Clock } from "@effect-ts/core/Effect/Clock"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as L from "@effect-ts/core/Effect/Layer"
import type { State } from "@effect-ts/core/Effect/Managed/ReleaseMap"
import {
  releaseAll,
  ReleaseMap,
  Running
} from "@effect-ts/core/Effect/Managed/ReleaseMap"
import * as P from "@effect-ts/core/Effect/Promise"
import type * as Random from "@effect-ts/core/Effect/Random"
import * as Ref from "@effect-ts/core/Effect/Ref"
import type { Has } from "@effect-ts/core/Has"
import { identity } from "@effect-ts/system/Function"
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
  const relMap = new ReleaseMap(Ref.unsafeMakeRef<State>(new Running(0, new Map())))

  return new MainProvider<R1, E, R>(
    T.map_(
      T.provideSome_(L.build(self).effect, (r: R1) => Tp.tuple(r, relMap)),
      (_) => _.get(1)
    )["|>"](
      T.foldCauseM(
        (cause) => P.halt_(promise, cause)["|>"](T.chain(() => T.halt(cause))),
        (r) => P.succeed(r)(promise)
      )
    ),
    T.descriptorWith((d) =>
      releaseAll(Ex.interrupt(d.id), T.sequential)(relMap)["|>"](T.asUnit)
    ),
    (self) => T.chain_(P.await(promise), (env) => T.provide(env)(self))
  )
}

export type TestEnvironment = Has<Annotations.Annotations> &
  Has<Live.Live> &
  Has<Clock> &
  Has<TestClock.TestClock> &
  Has<Random.Random>

export interface TestRuntime<R, E> {
  it: <E, A>(
    name: string,
    self: () => T.Effect<R & Has<Annotations.Annotations> & Has<Clock>, E, A>
  ) => void

  layer: L.Layer<unknown, E, R & Has<Annotations.Annotations> & Has<Clock>>

  provide: <R2, E1, A1>(
    self: T.Effect<
      R & Has<Annotations.Annotations> & Has<Clock> & R2 & Has<Random.Random>,
      E1,
      A1
    >
  ) => T.Effect<R2, E | E1, A1>
}

export function runtime(): TestRuntime<TestEnvironment, never>
export function runtime<E, R>(
  f: (
    _: typeof TE.TestEnvironment
  ) => L.Layer<
    unknown,
    E,
    R & Has<Annotations.Annotations> & Has<Clock> & Has<Random.Random>
  >
): TestRuntime<R, E>
export function runtime<E, R>(
  f?: (
    _: typeof TE.TestEnvironment
  ) => L.Layer<
    unknown,
    E,
    R & Has<Annotations.Annotations> & Has<Clock> & Has<Random.Random>
  >
): TestRuntime<R, E> {
  const { allocate, provide, release } = unsafeMainProvider(
    // @ts-expect-error
    (f || identity)(TE.TestEnvironment)
  )

  beforeAll(() => T.runPromise(allocate))
  afterAll(() => T.runPromise(release))

  const it_ = <E, A>(
    name: string,
    self: () => T.Effect<
      R & Has<Annotations.Annotations> & Has<Clock> & Has<Random.Random>,
      E,
      A
    >
  ) => {
    it(name, () => T.runPromise(provide(FibersPerTest.fibersPerTest(self()))))
  }

  return {
    it: it_,
    layer: L.fromRawEffect(
      provide(
        T.environment<
          R & Has<Annotations.Annotations> & Has<Clock> & Has<Random.Random>
        >()
      )
    ),
    provide
  }
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
