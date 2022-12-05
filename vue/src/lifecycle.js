import Watcher from "./observe/watcher"
import { createElementVNode, createTextVNode } from "./vnode/index"
import { patch } from "./vnode/patch"

export function mountComponent(vm,el){
    vm.$el = el
    const updateComponent = () => {

        vm._update(vm._render())
    }
    let w = new Watcher(vm,updateComponent)
}
export function initLifecycle(Vue){
    Vue.prototype._update=function(vnode){
        this.$el = patch(this.$el,vnode)
    }
    Vue.prototype._render = function(){
        let vm = this
        return vm.$options.render.call(vm)
    }
    Vue.prototype._v=function(){
        return createTextVNode(this,...arguments)
    }
    Vue.prototype._c = function(){
        return createElementVNode(this,...arguments)
    }
    Vue.prototype._s = function(value){
        if(typeof value !=='object') return value
        return JSON.stringify(value)
    }
}