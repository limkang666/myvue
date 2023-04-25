import {
    compileToFunction
} from "./compiler/index"
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
let render1 = compileToFunction(`
<ul>
<li key='a'>1</li>
<li key='b'>2</li>
<li key='c'>3</li>
<li key='d'>4</li>
</ul>
`)
let vm1 = new Vue({
    data: {
        name: 'af'
    }
})
let preVnode = render1.call(vm1)

let el = createElm(preVnode)

// console.log(document.querySelector('body'),999);
document.querySelector('body').appendChild(el)

let render2 = compileToFunction(`
<ul>
<li key='d'>4</li>
<li key='b'>2</li>
<li key='c'>3</li>
<li key='a'>1</li>
</ul>
`)
let vm2 = new Vue({
    data: {
        name: 'fa'
    }
})
let nextVnode = render2.call(vm2)
setTimeout(() => {
    patch(preVnode, nextVnode)
}, 1000)
export default Vue