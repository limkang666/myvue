const isRealTag = tag => {
    return ['a','h','span','ul','li','div'].includes(tag)
}
export function createElementVNode(vm,tag,data = {},...children){
    if(data==null){
        data = {}
    }
    let key = data.key
    key && delete data.key

    console.log(vm.$options,88);
    if(isRealTag(tag)){

        return createVNode(vm,tag,key,data,children)
    }else{
        let ctor = vm.$options.components[tag]
        return createComponentVnode(vm,tag,key,data,children,ctor)
    }
}
function createComponentVnode(vm,tag,key,data,children,ctor){
    if(typeof ctor === 'object'){
        ctor = vm.$options._base.extend(ctor)
    }
    data.hook = {
        init(){
            
        }
    }
    return createVNode(vm,tag,key,data,children,null,{ctor})
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