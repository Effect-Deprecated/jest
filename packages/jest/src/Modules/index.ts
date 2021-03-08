import * as A from "@effect-ts/core/Array"
import * as D from "@effect-ts/core/Dictionary"
import { pipe, tuple } from "@effect-ts/system/Function"

export const tracedMapper = pipe(
  ["system", "core", "monocle", "morphic", "query", "express", "node", "jest"],
  A.chain((p) => [
    tuple(`@effect-ts/${p}/(.*)$`, `<rootDir>/node_modules/@effect-ts/${p}/_traced/$1`),
    tuple(`@effect-ts/${p}$`, `<rootDir>/node_modules/@effect-ts/${p}/_traced`)
  ]),
  D.fromArray
)
