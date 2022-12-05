import { isSameVNode } from "./index"

export function createElm(vnode){
    let {tag,data,children,text} = vnode
    if(typeof tag == "string"){
        vnode.el = document.createElement(tag)
        patchProps(vnode.el,{},data)
        children.forEach(child=>{
            vnode.el.appendChild(createElm(child))
        })
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
export function patchProps(el,oldProps,props){
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    for(let key in oldStyles){
        if(!newStyles[key]){
            el.style[key]=''
        }
    }
    for(let key in oldProps){
        if(!props[key]){
            el.removeAttribute(key)
        }
    }
    for(let key in props){
        if(key === 'style'){
            for(let stylename in props.style){
                el.style[stylename] = props.style[stylename]
            }
        }else{
            el.setAttribute(key,props[key])
        }
    }
}
export function patch(oldVNode,vnode){
    const isRealDom = oldVNode.nodeType
    if(isRealDom){
        const elm = oldVNode
        const parentElm = elm.parentNode

        let newEle = createElm(vnode)
        parentElm.insertBefore(newEle,elm.nextSibling)
        parentElm.removeChild(elm)
        console.log(newEle);
        return newEle
    }else{
        return patchVNode(oldVNode,vnode)
    }
}

function patchVNode(oldVNode,vnode){
    if(!isSameVNode(oldVNode,vnode)){
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el,oldVNode.el)
        return el
    }
    let el = vnode.el = oldVNode.el
    if(!oldVNode.tag){
        if(oldVNode.text !==vnode.text){
            el.textContent = vnode.text
        }
    }

    patchProps(el,oldVNode.data,vnode.data)

    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []

    if(oldChildren>0 && newChildren>0){
        updateChildren(el,oldChildren,newChildren)
    }else if(newChildren.length>0){
        mountChildren(el,newChildren)
    }else if(oldChildren.length>0){
        el.innerHTML = ''
    }

    return el
}

function mountChildren(el,newChildren){
    for(let i=0;i<newChildren.length;i++){
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

function updateChildren (el,oldChildren,newChildren){
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length -1
    let newEndIndex = newChildren.length -1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]

    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[oldEndIndex]

    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
        if(isSameVNode(oldStartVnode,newStartVnode)){
            patchVNode(oldStartVnode,newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else if(isSameVNode(oldEndVnode,newEndVnode)){
            patchVNode(oldEndVnode,newStartVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndVnode]
        }else if(isSameVNode(oldEndVnode,newStartVnode)){
            patchVNode(oldEndVnode,newStartVnode)
            el.insertBefore(oldEndVnode.el,newStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]

        }else if(isSameVNode(oldStartVnode,newEndVnode)){
            patchVNode(oldStartVnode,newEndVnode)
            el.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }
    }

    if(newStartIndex <=newEndIndex){
        for(let i = newStartIndex;i<=newEndIndex;i++){
            let childEl = createElm(newChildren[i])

            let anchor = newChildren[newEndIndex + 1] ?newChildren[newEndIndex+1].el : null
            el.insertBefore(childEl,anchor)
        }
    }
    if(oldStartIndex <=oldEndIndex){
        for(let i = oldStartIndex;i<=oldEndIndex;i++){
            let childEl = oldChildren[i].el
            el.removeChild(childEl)
        }
    }
}