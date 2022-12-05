export function createElementVNode(vm,tag,data = {},...children){
    if(data==null){
        data = {}
    }
    let key = data.key
    key && delete data.key
    return createVNode(vm,tag,key,data,children)
}
export function createTextVNode(vm,text){
    return createVNode(vm,undefined,undefined,undefined,undefined,text)
}
function createVNode(vm,tag,key,data,children,text){
    return {
        vm,tag,key,data,children,text
    }
}
export function isSameVNode(vnode1,vnode2){
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}