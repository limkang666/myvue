import { initMinxin } from "./init"
import { initLifecycle } from "./lifecycle"
import Watcher, { nextTick } from "./observe/watcher"
import { initStateMixin } from "./state"

function Vue (options) {
    this._init(options)

}
initStateMixin(Vue)
initMinxin(Vue)
initLifecycle(Vue)
export default Vue