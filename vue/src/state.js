import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";
import watcher from "./observe/watcher"
export function initState(vm){
    const ops = vm.$options
    if(ops.data){
        initData(vm)
    }
    if(ops.computed){
        initComputed(vm)
    }
    if(ops.watch){
        initWatch(vm)
    }
}
function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newVal){
            vm[target][key]=newVal
        }
    })
}
function initData(vm){
   let data = vm.$options.data;
   data = typeof data === "function" ? data.call(this):data
   vm._data = data
   observe(data)
   for(let key in data){
       proxy(vm,"_data",key)
   }
}
function initComputed(vm){
    const computed = vm.$options.computed
    const watchers = vm._computedWathers={}
    for(let key in computed){
        let userDef = computed[key]
        let fn = typeof userDef == "function" ? userDef : userDef.get;
        watchers[key] = new watcher(vm,fn,{lazy:true})
        defineComputed(vm,key,userDef)
    }
}
function defineComputed(target,key,userDef){
    // const getter = typeof userDef == "function" ? userDef : userDef.get;
    const setter = userDef.set || (()=>{})
    Object.defineProperty(target,key,{
        get:createComputedGetter(key),
        set:setter
    })
}
function createComputedGetter(key){
    return function (){
        // console.log("duqufullname");
        const watcher = this._computedWathers[key]
        if(watcher.dirty){
            watcher.evaluate()
        }
        if(Dep.target){
            watcher.depend()
        }
        return watcher.value
    }
}
function initWatch(vm){
    let watch = vm.$options.watch
    for (let key in watch) {
        const handler = watch[key]
        if(Array.isArray(handler)){
            for(let i = 0;i<handler.length;i++){

                createWatcher(vm,key,handler[i])
            }
        }else{
            createWatcher(vm,key,handler)
        }
    }
}
function createWatcher(vm,key,handler){
    if(typeof handler === "string"){
        handler = vm[handler]
    }
    return vm.$watch(key,handler)
}
export function initStateMixin(Vue){
    Vue.prototype.$nextTick = nextTick
    Vue.prototype.$watch = function (exprOrFn,cb,options = {}){
        new Watcher(this,exprOrFn,{user:true},cb)
    }
}