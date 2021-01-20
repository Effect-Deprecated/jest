import * as T from "@effect-ts/core/Effect";
import * as Ex from "@effect-ts/core/Effect/Exit";
import * as L from "@effect-ts/core/Effect/Layer";
import * as RM from "@effect-ts/core/Effect/Managed/ReleaseMap";
import * as Pr from "@effect-ts/core/Effect/Promise";
import { pipe, tuple } from "@effect-ts/core/Function";
import { None } from "@effect-ts/system/Fiber";
export function testRuntime(self, {
  close = 120000,
  open = 120000
} = {}) {
  const promiseEnv = Pr.unsafeMake(None);
  const promiseRelMap = Pr.unsafeMake(None);
  beforeAll(() => T.runPromise(T.chain_(T.result(T.map_(T.bind_(T.tap_(T.bind_(T.do, "rm", () => RM.makeReleaseMap), ({
    rm
  }) => Pr.succeed(rm)(promiseRelMap)), "res", ({
    rm
  }) => T.provideSome_(L.build(self).effect, r => tuple(r, rm))), ({
    res
  }) => res[1])), ex => Pr.complete(T.orDie(T.done(ex)))(promiseEnv))), open);
  afterAll(() => T.runPromise(T.chain_(Pr.await(promiseRelMap), rm => RM.releaseAll(Ex.succeed(undefined), T.sequential)(rm))), close);
  return {
    it: (name, self) => it(name, () => T.runPromise(T.chain_(Pr.await(promiseEnv), r => T.provide(r)(self())))),
    runPromise: self => T.runPromise(T.chain_(Pr.await(promiseEnv), r => T.provide(r)(self))),
    runPromiseExit: self => T.runPromiseExit(T.chain_(Pr.await(promiseEnv), r => T.provide(r)(self))),
    provide: self => T.chain_(Pr.await(promiseEnv), r => T.provide(r)(self))
  };
}
//# sourceMappingURL=index.js.map