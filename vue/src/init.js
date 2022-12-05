import { compileToFunction } from "./compiler/index.js"
import { mountComponent } from "./lifecycle.js"
import { nextTick } from "./observe/watcher.js"
import { initState } from "./state"

export function initMinxin(Vue) {
    // debugger
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options
        initState(vm)

        if(options.el){
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if(!ops.render){
            let template;
            if(!ops.template && el){
                template = el.outerHTML
            } else{
                if(el){
                    template = ops.template
                }
            }
            if(template){
                const render = compileToFunction(template)
                ops.render = render
            }
            //console.log(template);
        }
        mountComponent(vm,el)
    }
}


