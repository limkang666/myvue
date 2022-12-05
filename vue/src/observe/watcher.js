import Dep, { popTarget, pushTarget } from "./dep"

let id = 0
class Watcher{
    constructor(vm,exprOrFn,option={},cb){
        this.vm = vm
        this.id = id++
        // this.getter = fn
        if(typeof exprOrFn === 'string'){
            this.getter = function(){
                return vm[exprOrFn]
            }
        }else{
                this.getter=exprOrFn
            }
        this.deps = []
        this.cb = cb
        this.user = option.user
        this.depIds = new Set()
        this.dirty = option.lazy
        this.lazy = option.lazy
        this.renderWatcher = option
        this.oldVal = this.lazy?undefined : this.get()
        
    }
    evaluate(){
        this.value = this.get()
        this.dirty = false
    }
    get(){
        // Dep.target = this
        pushTarget(this)
        let value = this.getter.call(this.vm)
        // Dep.target = null
        popTarget()
        return value
    }
    addDep(dep){
        let id = dep.id
        if(!this.depIds.has(id)){
            this.deps.push(dep)
            dep.addSub(this)
            this.depIds.add(id)
        }
    }
    depend(){
        let i = this.deps.length
        while(i--){
            this.deps[i].depend()
        }
    }
    update(){
        // this.get()
        if(this.lazy){
            // console.log(4);
            this.dirty = true;
        }else{
            queueWatcher(this)
        }
    }
    run(){
        let newVal = this.get()
        if(this.user){
            this.cb.call(this.vm,newVal,this.oldVal)
        }
    }
}
let has = {}
let queue = []
let pending = false
function flushSchedulerQueue(){
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q=>q.run())
}
function queueWatcher(wather){
    const id = wather.id
    if(!has[id]){
        queue.push(wather)
        has[id] = true
        if(!pending){
        nextTick(flushSchedulerQueue)
         pending = true
        }
    }
}
let callbacks = []
let waiting = false
function flushCallbacks(){
    let cbs = callbacks.slice(0)
    waiting = true
    callbacks = []
    cbs.forEach(cb=>cb())
}
export function nextTick(cb){
    callbacks.push(cb)
    if(!waiting){
        setTimeout(()=>{
            flushCallbacks()
        },0)
        waiting=true
    }
}
export default Watcher