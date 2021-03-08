import * as A from "@effect-ts/core/Array"
import * as D from "@effect-ts/core/Dictionary"
import * as Str from "@effect-ts/core/String"
import { pipe, tuple } from "@effect-ts/system/Function"

export function tracedMapper(modules: A.Array<string>) {
  return pipe(
    modules,
    A.chain((p) => [
      tuple(`${p}/(.*)$`, `<rootDir>/node_modules/@effect-ts/${p}/_traced/$1`),
      tuple(`${p}$`, `<rootDir>/node_modules/@effect-ts/${p}/_traced`)
    ]),
    D.fromArray
  )
}

export const defaultMapper = pipe(
  ["system", "core", "monocle", "morphic", "query", "express", "node", "jest"],
  A.map(Str.prepend("@effect-ts/")),
  tracedMapper
)
