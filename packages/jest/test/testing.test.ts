import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as Ref from "@effect-ts/core/Effect/Ref"
import * as Sc from "@effect-ts/core/Effect/Schedule"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"

import * as Te from "../src/Test"
import { Crypto, CryptoLive, PBKDF2ConfigTest } from "./crypto"

describe("Testing", () => {
  const { it, layer: CoreEnv } = Te.runtime((TestEnv) =>
    TestEnv["+++"](PBKDF2ConfigTest)
  )

  const { layer: CryptoEnv } = Te.shared(CoreEnv[">>>"](CryptoLive))

  it("time", () =>
    T.gen(function* (_) {
      const fiber = yield* _(T.fork(T.sleep(10_000)))

      yield* _(Te.adjust(10_000))

      const result = yield* _(T.either(F.join(fiber)))

      expect(result).toEqual(E.right(void 0))
    }))

  it("repeats", () =>
    T.gen(function* (_) {
      const cnt = yield* _(Ref.makeRef(0))

      const fiber = yield* _(
        pipe(
          cnt,
          Ref.update((n) => n + 1),
          T.delay(1_000),
          T.repeat(Sc.recurs(9)),
          T.fork
        )
      )

      yield* _(Te.adjust(10_000))
      yield* _(F.join(fiber))

      expect(yield* _(Ref.get(cnt))).toEqual(10)
    }))

  it("time live", () =>
    T.gen(function* (_) {
      const fiber = yield* _(T.fork(T.sleep(1_000)))

      const result = yield* _(T.either(F.join(fiber)))

      expect(result).toEqual(E.right(void 0))
    })["|>"](Te.live))

  it("should hash and verify password", () =>
    T.gen(function* (_) {
      const { hashPassword, verifyPassword } = yield* _(Crypto)

      const password = "wuihfjierngjkrnjgwrgn"
      const hash = yield* _(hashPassword(password))
      const verify = yield* _(T.result(verifyPassword(password, hash)))

      expect(Ex.untraced(verify)).toEqual(Ex.unit)
    })["|>"](CryptoEnv.use))
})
