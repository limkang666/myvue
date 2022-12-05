import { newArrProto } from "./array"
import Dep from "./dep"
 class Observe{
    constructor(data){
        this.dep = new Dep()
        Object.defineProperty(data,"__ob__",{
            value:this,
            enumerable:false
        })
        if(Array.isArray(data)){
            data.__proto__ = newArrProto
            this.observeArray(data)
            //console.log(data);
        }else{
            this.walk(data)
        }
    }

    observeArray(data){
        data.forEach(item=>observe(item))
    }
    walk(data){
        Object.keys(data).forEach(key=>defineReactive(data,key,data[key]))
    }
 }

 export function defineReactive(target,key,value){
    let childOb = observe(value)
    let dep = new Dep()
    Object.defineProperty(target,key,{
        get(){
            if(Dep.target){
                dep.depend()
                if(childOb?.dep){
                    childOb.dep.depend()
                }
            }
            return value
        },
        set(newVal){
            if(newVal === value) return
            observe(newVal)
            value = newVal
            // console.log(newVal);
            dep.notify()
        }
    })
 }
 export function observe(data){
    // console.log(data);
    if(typeof data !=="object" || data == null){
        return
    }
    if(data.__ob__ instanceof Observe) return
    return new Observe(data)
 }