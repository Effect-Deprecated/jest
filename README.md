## Welcome to Effect-TS - Jest

Please follow up to: [https://github.com/Effect-TS/jest/tree/master/packages/jest](https://github.com/Effect-TS/jest/tree/master/packages/jest)

## Install

We recommend the usage of `yarn` and if you have multiple packages the usage of `yarn workspaces` that handles by default hoisting of dependencies:

```sh
yarn add @effect-ts/system @effect-ts/tracing-utils @effect-ts/core @effect-ts/jest
```

## Setup

To enable the custom matcher `equals` that uses `equals` from `@effect-ts/core/Structural` add `@effect-ts/jest/Extend` to your Jest `setupFilesAfterEnv` configuration.

```json
{
  "setupFilesAfterEnv": ["@effect-ts/jest/Extend"]
}
```

and import `import "@effect-ts/jest/Extend"` in your `global.d.ts` or in a valid `typeRoot`
