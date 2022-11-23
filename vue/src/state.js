import { observe } from "./observe/index";

export function initState(vm){
    const ops = vm.$options
    if(ops.data){
        initData(vm)
    }
}
function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newVal){
            vam[target][key]=newVal
        }
    })
}
 function initData(vm){
    let data = vm.$options.data;
    data = typeof data === "function" ? data.call(this):data
    console.log(data);
    vm._data = data
    observe(data)

    for(let key in data){
        proxy(vm,"_data",key)
    }
}