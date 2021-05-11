import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as E from "@effect-ts/core/Either"

import * as Te from "../src/Test"
import { Crypto, CryptoLive, PBKDF2ConfigTest } from "./crypto"

describe("Testing", () => {
  const { it, layer: Core } = Te.runtime()

  const crypto = Te.shared(Core[">+>"](PBKDF2ConfigTest[">+>"](CryptoLive)))

  it("time", () =>
    T.gen(function* (_) {
      const fiber = yield* _(T.fork(T.sleep(10_000)))

      yield* _(Te.adjust(10_000))

      const result = yield* _(T.either(F.join(fiber)))

      expect(result).toEqual(E.right(void 0))
    }))

  it("time", () =>
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
    })["|>"](crypto.provide))
})
