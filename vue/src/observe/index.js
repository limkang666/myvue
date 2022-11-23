import { newArrProto } from "./array"

 class Observe{
    constructor(data){
        Object.defineProperty(data,"__ob__",{
            value:this,
            enumerable:false
        })
        if(Array.isArray(data)){
            
            data.__proto__ = newArrProto
            this.observeArray(data)
            console.log(data);
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
    observe(value  )
    Object.defineProperty(target,key,{
        get(){
            console.log("huoqu");
            return value
        },
        set(newVal){
            if(newVal === value) return
            value = newVal
        }
    })
 }
 
 export function observe(data){
    if(typeof data !=="object" || data == null){
        return
    }
    if(data.__ob__ instanceof Observe) return

    return new Observe(data)
 }