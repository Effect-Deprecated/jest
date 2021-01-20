"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRuntime = void 0;
const T = __importStar(require("@effect-ts/core/Effect"));
const Ex = __importStar(require("@effect-ts/core/Effect/Exit"));
const L = __importStar(require("@effect-ts/core/Effect/Layer"));
const RM = __importStar(require("@effect-ts/core/Effect/Managed/ReleaseMap"));
const Pr = __importStar(require("@effect-ts/core/Effect/Promise"));
const Function_1 = require("@effect-ts/core/Function");
const Fiber_1 = require("@effect-ts/system/Fiber");
function testRuntime(self, { close = 120000, open = 120000 } = {}) {
    const promiseEnv = Pr.unsafeMake(Fiber_1.None);
    const promiseRelMap = Pr.unsafeMake(Fiber_1.None);
    beforeAll(() => T.runPromise(T.chain_(T.result(T.map_(T.bind_(T.tap_(T.bind_(T.do, "rm", () => RM.makeReleaseMap), ({ rm }) => Pr.succeed(rm)(promiseRelMap)), "res", ({ rm }) => T.provideSome_(L.build(self).effect, (r) => Function_1.tuple(r, rm))), ({ res }) => res[1])), (ex) => Pr.complete(T.orDie(T.done(ex)))(promiseEnv))), open);
    afterAll(() => T.runPromise(T.chain_(Pr.await(promiseRelMap), (rm) => RM.releaseAll(Ex.succeed(undefined), T.sequential)(rm))), close);
    return {
        it: (name, self) => it(name, () => T.runPromise(T.chain_(Pr.await(promiseEnv), (r) => T.provide(r)(self())))),
        runPromise: (self) => T.runPromise(T.chain_(Pr.await(promiseEnv), (r) => T.provide(r)(self))),
        runPromiseExit: (self) => T.runPromiseExit(T.chain_(Pr.await(promiseEnv), (r) => T.provide(r)(self))),
        provide: (self) => T.chain_(Pr.await(promiseEnv), (r) => T.provide(r)(self))
    };
}
exports.testRuntime = testRuntime;
//# sourceMappingURL=index.js.map