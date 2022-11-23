let oldArrProto = Array.prototype
 let newArrProto = Object.create(oldArrProto)
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]
methods.forEach(method=>{
    newArrProto[method]=function(...args){
        let res = oldArrProto[method].call(this,...args)
        let inserted
        switch(method){
            case "push":
            case "unshift":
                console.log("chufa");
                inserted = args
                break;
            case "splice":
                inserted = args.slice(2)
            default:
                break
        }
        
        if(inserted){
            this.__ob__.observeArray(inserted)
        }
        return res
    }
})
export {
    newArrProto
}