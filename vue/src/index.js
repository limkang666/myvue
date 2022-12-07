import {
    compileToFunction
} from "./compiler/index"
import { initGlobalAPI } from "./globalAPI.js"
import {
    initMinxin
} from "./init"
import {
    initLifecycle
} from "./lifecycle"
import Watcher, {
    nextTick
} from "./observe/watcher"
import {
    initStateMixin
} from "./state"
import {
    createElm,
    patch
} from "./vnode/patch"

function Vue(options) {
    this._init(options)

}
initStateMixin(Vue)
initMinxin(Vue)
initLifecycle(Vue)
initGlobalAPI(Vue)
export default Vue