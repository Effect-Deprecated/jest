import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as L from "@effect-ts/core/Effect/Layer"
export interface TestRuntime<R> {
  it: <E, A>(name: string, self: () => T.Effect<R & T.DefaultEnv, E, A>) => void
  runPromise: <E, A>(self: T.Effect<R & T.DefaultEnv, E, A>) => Promise<A>
  runPromiseExit: <E, A>(
    self: T.Effect<R & T.DefaultEnv, E, A>
  ) => Promise<Ex.Exit<E, A>>
  provide: <R2, E, A>(self: T.Effect<R & R2, E, A>) => T.Effect<R2, E, A>
}
export declare function testRuntime<R, E>(
  self: L.Layer<T.DefaultEnv, E, R>,
  {
    close,
    open
  }?: {
    open?: number
    close?: number
  }
): TestRuntime<R>
//# sourceMappingURL=index.d.ts.map
