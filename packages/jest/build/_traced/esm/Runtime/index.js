import * as tracing_1 from "@effect-ts/tracing-utils";
const fileName_1 = "(@effect-ts/jest): _src/Runtime/index.ts";
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
  beforeAll(() => T.runPromise(T.chain_(tracing_1.traceCall(T.result, fileName_1 + ":41:17")(T.map_(T.bind_(T.tap_(T.bind_(T.do, "rm", () => RM.makeReleaseMap), tracing_1.traceFrom(fileName_1 + ":36:15", ({
    rm
  }) => Pr.succeed(rm)(promiseRelMap))), "res", ({
    rm
  }) => T.provideSome_(L.build(self).effect, r => tuple(r, rm))), tracing_1.traceFrom(fileName_1 + ":40:15", ({
    res
  }) => res[1]))), tracing_1.traceFrom(fileName_1 + ":42:17", ex => Pr.complete(T.orDie(T.done(ex)))(promiseEnv)))), open);
  afterAll(() => T.runPromise(T.chain_(Pr.await(promiseRelMap), tracing_1.traceFrom(fileName_1 + ":53:17", rm => RM.releaseAll(Ex.succeed(undefined), T.sequential)(rm)))), close);
  return {
    it: (name, self) => it(name, () => T.runPromise(T.chain_(Pr.await(promiseEnv), tracing_1.traceFrom(fileName_1 + ":65:19", r => T.provide(r)(self()))))),
    runPromise: self => T.runPromise(T.chain_(Pr.await(promiseEnv), tracing_1.traceFrom(fileName_1 + ":73:17", r => T.provide(r)(self)))),
    runPromiseExit: self => T.runPromiseExit(T.chain_(Pr.await(promiseEnv), tracing_1.traceFrom(fileName_1 + ":80:17", r => T.provide(r)(self)))),
    provide: self => T.chain_(Pr.await(promiseEnv), tracing_1.traceFrom(fileName_1 + ":87:17", r => T.provide(r)(self)))
  };
}
//# sourceMappingURL=index.js.map