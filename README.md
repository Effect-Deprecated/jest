## Welcome to Effect-TS - Jest [![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-908a85?logo=gitpod)](https://gitpod.io/#https://github.com/Effect-TS/jest)

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
