import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"

import { testRuntime } from "../src/Runtime/index.js"
import {
  Crypto,
  CryptoLive,
  InvalidPassword,
  PBKDF2ConfigLive,
  PBKDF2ConfigTest
} from "./crypto/index.js"

describe("Crypto Suite", () => {
  describe("Live", () => {
    const { it } = testRuntime(CryptoLive["<<<"](PBKDF2ConfigLive))

    it("should hash and verify password", () =>
      T.gen(function* (_) {
        const { hashPassword, verifyPassword } = yield* _(Crypto)

        const password = "wuihfjierngjkrnjgwrgn"
        const hash = yield* _(hashPassword(password))
        const verify = yield* _(T.result(verifyPassword(password, hash)))

        expect(Ex.untraced(verify)).toEqual(Ex.unit)
      }))

    it("should hash and not verify password", () =>
      T.gen(function* (_) {
        const { hashPassword, verifyPassword } = yield* _(Crypto)

        const password = "wuihfjierngjkrnjgwrgn"
        const passwordBad = "wuIhfjierngjkrnjgwrgn"
        const hash = yield* _(hashPassword(password))
        const verify = yield* _(T.result(verifyPassword(passwordBad, hash)))

        expect(Ex.untraced(verify)).toEqual(Ex.fail(new InvalidPassword()))
      }))
  })
  describe("Test", () => {
    const { it } = testRuntime(CryptoLive["<<<"](PBKDF2ConfigTest))

    it("should hash and verify password", () =>
      T.gen(function* (_) {
        const { hashPassword, verifyPassword } = yield* _(Crypto)

        const password = "wuihfjierngjkrnjgwrgn"
        const hash = yield* _(hashPassword(password))
        const verify = yield* _(T.result(verifyPassword(password, hash)))

        expect(Ex.untraced(verify)).toEqual(Ex.unit)
      }))

    it("should hash and not verify password", () =>
      T.gen(function* (_) {
        const { hashPassword, verifyPassword } = yield* _(Crypto)

        const password = "wuihfjierngjkrnjgwrgn"
        const passwordBad = "wuIhfjierngjkrnjgwrgn"
        const hash = yield* _(hashPassword(password))
        const verify = yield* _(T.result(verifyPassword(passwordBad, hash)))

        expect(Ex.untraced(verify)).toEqual(Ex.fail(new InvalidPassword()))
      }))
  })
  describe("Empty", () => {
    const { it } = testRuntime()

    it("should use default env", () =>
      T.gen(function* (_) {
        const x = yield* _(T.succeedWith(() => 1))

        expect(x).toEqual(1)
      }))
  })
})
