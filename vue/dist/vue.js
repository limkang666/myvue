(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    const ncname = `[a-zA-Z][\\-\\.0-9_a-zA-Z]*`;
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
    const startTagOpen = new RegExp(`^<${qnameCapture}`);
    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
    const startTagClose = /^\s*(\/?)>/;
    function parseHTML(html){
        const ELEMENT_TYPE = 1;
        const TEXT_TYPE = 3;
        const stack = [];
        let currentParant;
        let root;
        function creatASTElement(tag,attrs){
            return {
                tag,
                type:ELEMENT_TYPE,
                children:[],
                parent:null,
                attrs
            }
        }
        function start (tagName,attrs){
            let node = creatASTElement(tagName,attrs);
            if(!root){
                root = node;
            }
            if(currentParant){
                node.parent = currentParant;
                currentParant.children.push(node);
            }
            stack.push(node);
            currentParant = node;
        }
        function chars (text){
            text = text.trim();
            text && currentParant.children.push(
                {
                    type:TEXT_TYPE,
                    text,
                    parent:currentParant
                }
            );
        }
        function end (tagName){
            stack.pop();
            currentParant = stack[stack.length-1];
        }
        //console.log(111);
        function advance(n){
            html = html.slice(n);
        }
        function parseStartTag(){
            const start = html.match(startTagOpen);
            if(start){
                const match = {
                    tagName:start[1],
                    attr:[]
                };
                advance(start[0].length);
                let attr,end;
                while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                    advance(attr[0].length);
                    match.attr.push({
                        name:attr[1],value:attr[3]||attr[4]||attr[5]
                    });
                }
                if(end){
                    advance(end[0].length);
                }
                return match
            }
            return false 
        }
        while(html){
            let textEnd = html.indexOf("<");
            if(textEnd == 0){
                const startTagMatch =  parseStartTag();
                if(startTagMatch){
                    start(startTagMatch.tagName,startTagMatch.attr);
                    continue
                }

                let endTagMatch = html.match(endTag);
                if(endTagMatch){
                    end(endTagMatch[1]);
                    advance(endTagMatch[0].length);
                    continue
                }
                // break
            }

            if(textEnd > 0){
                let text = html.substring(0,textEnd);
                if(text){
                    chars(text);
                    advance(text.length);
                }
            }
        }
        return root
    }

    function genProps(attrs){
        let str = "";
        for(let i = 0;i<attrs.length;i++){
            let attr = attrs[i];
            if(attr.name=="style"){
                let obj = {};
                attr.value.split(";").forEach(item => {
                    let [key,value] = item.split(":");
                    obj[key] = value;
                });
                attr.value = obj;
            }
            str += `${attr.name}:${JSON.stringify(attr.value)},`;
        }
        return `{${str.slice(0,-1)}}`
    }
    const defaultTagRE=/\{\{((?:.|\r?\n)+?)\}\}/g;
    function gen(node){
        if(node.type===1){
            return codeGen(node)
        }else {
            let text = node.text;
            text = text.replace(/\s/g,'');
            if(!defaultTagRE.test(text)){
                return `_v(${text})`
            }else {
                let tokens = [];
                let match;
                let lastIndex = 0;
                defaultTagRE.lastIndex = 0;
                while (match = defaultTagRE.exec(text)){
                    let index = match.index;
                    if(index > lastIndex){
                        tokens.push(JSON.stringify(text.slice(lastIndex,index)));

                    }
                    tokens.push(`_s(${match[1].trim()})`);
                    lastIndex = index + match[0].length;
                }
                if(lastIndex < text.length){
                    tokens.push(JSON.stringify(text.slice(lastIndex)));
                }
                return `_v(${tokens.join("+")})`
            }
        }
    }
    function genChildren(children){
        console.log(children,6);
        return children?.map(child=>gen(child)).join(",")
    }
    function codeGen(ast) {
        let children = genChildren(ast.children);
        let code = (`_c(${JSON.stringify(ast.tag)},${ast.attrs.length>0?genProps(ast.attrs):'null'}${ast.children.length?`,${children}`:''})`);
        return code
    }

    function compileToFunction(template) {
        let ast = parseHTML(template);
        let code = codeGen(ast);
        code = `with(this){return ${code}}`;
        let render = new Function(code);
        return render
    }

    let id$1 = 0;
    class Dep {
        constructor(){
            this.id = id$1++;
            this.subs = [];
        }
        depend(){
            Dep.target.addDep(this);
            // this.subs.push(Dep.target)
        }
        addSub(wather){
            this.subs.push(wather);
        }
        notify(){
            this.subs.forEach(watcher=>watcher.update());
        }
    }
    Dep.target = null;


    let stack = [];
    function pushTarget(watcher){    
        stack.push(watcher);
        Dep.target = watcher;
    }
    function popTarget(watcher){
        stack.pop();
        Dep.target = stack[stack.length-1];
    }

    let id = 0;
    class Watcher{
        constructor(vm,exprOrFn,option={},cb){
            this.vm = vm;
            this.id = id++;
            // this.getter = fn
            if(typeof exprOrFn === 'string'){
                this.getter = function(){
                    return vm[exprOrFn]
                };
            }else {
                    this.getter=exprOrFn;
                }
            this.deps = [];
            this.cb = cb;
            this.user = option.user;
            this.depIds = new Set();
            this.dirty = option.lazy;
            this.lazy = option.lazy;
            this.renderWatcher = option;
            this.oldVal = this.lazy?undefined : this.get();
            
        }
        evaluate(){
            this.value = this.get();
            this.dirty = false;
        }
        get(){
            // Dep.target = this
            pushTarget(this);
            let value = this.getter.call(this.vm);
            // Dep.target = null
            popTarget();
            return value
        }
        addDep(dep){
            let id = dep.id;
            if(!this.depIds.has(id)){
                this.deps.push(dep);
                dep.addSub(this);
                this.depIds.add(id);
            }
        }
        depend(){
            let i = this.deps.length;
            while(i--){
                this.deps[i].depend();
            }
        }
        update(){
            // this.get()
            if(this.lazy){
                // console.log(4);
                this.dirty = true;
            }else {
                queueWatcher(this);
            }
        }
        run(){
            let newVal = this.get();
            if(this.user){
                this.cb.call(this.vm,newVal,this.oldVal);
            }
        }
    }
    let has = {};
    let queue = [];
    let pending = false;
    function flushSchedulerQueue(){
        let flushQueue = queue.slice(0);
        queue = [];
        has = {};
        pending = false;
        flushQueue.forEach(q=>q.run());
    }
    function queueWatcher(wather){
        const id = wather.id;
        if(!has[id]){
            queue.push(wather);
            has[id] = true;
            if(!pending){
            nextTick(flushSchedulerQueue);
             pending = true;
            }
        }
    }
    let callbacks = [];
    let waiting = false;
    function flushCallbacks(){
        let cbs = callbacks.slice(0);
        waiting = true;
        callbacks = [];
        cbs.forEach(cb=>cb());
    }
    function nextTick(cb){
        callbacks.push(cb);
        if(!waiting){
            setTimeout(()=>{
                flushCallbacks();
            },0);
            waiting=true;
        }
    }

    function createElementVNode(vm,tag,data = {},...children){
        if(data==null){
            data = {};
        }
        let key = data.key;
        key && delete data.key;
        return createVNode(vm,tag,key,data,children)
    }
    function createTextVNode(vm,text){
        return createVNode(vm,undefined,undefined,undefined,undefined,text)
    }
    function createVNode(vm,tag,key,data,children,text){
        return {
            vm,tag,key,data,children,text
        }
    }
    function isSameVNode(vnode1,vnode2){
        return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
    }

    function createElm(vnode){
        let {tag,data,children,text} = vnode;
        if(typeof tag == "string"){
            vnode.el = document.createElement(tag);
            patchProps(vnode.el,{},data);
            children.forEach(child=>{
                vnode.el.appendChild(createElm(child));
            });
        }else {
            vnode.el = document.createTextNode(text);
        }
        return vnode.el
    }
    function patchProps(el,oldProps,props){
        let oldStyles = oldProps.style || {};
        let newStyles = props.style || {};
        for(let key in oldStyles){
            if(!newStyles[key]){
                el.style[key]='';
            }
        }
        for(let key in oldProps){
            if(!props[key]){
                el.removeAttribute(key);
            }
        }
        for(let key in props){
            if(key === 'style'){
                for(let stylename in props.style){
                    el.style[stylename] = props.style[stylename];
                }
            }else {
                el.setAttribute(key,props[key]);
            }
        }
    }
    function patch(oldVNode,vnode){
        const isRealDom = oldVNode.nodeType;
        if(isRealDom){
            const elm = oldVNode;
            const parentElm = elm.parentNode;

            let newEle = createElm(vnode);
            parentElm.insertBefore(newEle,elm.nextSibling);
            parentElm.removeChild(elm);
            console.log(newEle);
            return newEle
        }else {
            return patchVNode(oldVNode,vnode)
        }
    }

    function patchVNode(oldVNode,vnode){
        if(!isSameVNode(oldVNode,vnode)){
            let el = createElm(vnode);
            oldVNode.el.parentNode.replaceChild(el,oldVNode.el);
            return el
        }
        let el = vnode.el = oldVNode.el;
        if(!oldVNode.tag){
            if(oldVNode.text !==vnode.text){
                el.textContent = vnode.text;
            }
        }

        patchProps(el,oldVNode.data,vnode.data);

        let oldChildren = oldVNode.children || [];
        let newChildren = vnode.children || [];

        if(oldChildren>0 && newChildren>0){
            updateChildren(el,oldChildren,newChildren);
        }else if(newChildren.length>0){
            mountChildren(el,newChildren);
        }else if(oldChildren.length>0){
            el.innerHTML = '';
        }

        return el
    }

    function mountChildren(el,newChildren){
        for(let i=0;i<newChildren.length;i++){
            let child = newChildren[i];
            el.appendChild(createElm(child));
        }
    }

    function updateChildren (el,oldChildren,newChildren){
        let oldEndIndex = oldChildren.length -1;
        newChildren.length -1;

        oldChildren[0];
        newChildren[0];

        oldChildren[oldEndIndex];
        newChildren[oldEndIndex];
    }

    function mountComponent(vm,el){
        vm.$el = el;
        const updateComponent = () => {

            vm._update(vm._render());
        };
        new Watcher(vm,updateComponent);
    }
    function initLifecycle(Vue){
        Vue.prototype._update=function(vnode){
            this.$el = patch(this.$el,vnode);
        };
        Vue.prototype._render = function(){
            let vm = this;
            return vm.$options.render.call(vm)
        };
        Vue.prototype._v=function(){
            return createTextVNode(this,...arguments)
        };
        Vue.prototype._c = function(){
            return createElementVNode(this,...arguments)
        };
        Vue.prototype._s = function(value){
            if(typeof value !=='object') return value
            return JSON.stringify(value)
        };
    }

    let oldArrProto = Array.prototype;
     let newArrProto = Object.create(oldArrProto);
    let methods = [
        'push',
        'pop',
        'shift',
        'unshift',
        'reverse',
        'sort',
        'splice'
    ];
    methods.forEach(method=>{
        newArrProto[method]=function(...args){
            let res = oldArrProto[method].call(this,...args);
            let inserted;
            switch(method){
                case "push":
                case "unshift":
                    //console.log("chufa");
                    inserted = args;
                    break;
                case "splice":
                    inserted = args.slice(2);
            }
            
            if(inserted){
                this.__ob__.observeArray(inserted);
            }
            this.__ob__.dep.notify();
            return res
        };
    });

    class Observe{
        constructor(data){
            this.dep = new Dep();
            Object.defineProperty(data,"__ob__",{
                value:this,
                enumerable:false
            });
            if(Array.isArray(data)){
                data.__proto__ = newArrProto;
                this.observeArray(data);
                //console.log(data);
            }else {
                this.walk(data);
            }
        }

        observeArray(data){
            data.forEach(item=>observe(item));
        }
        walk(data){
            Object.keys(data).forEach(key=>defineReactive(data,key,data[key]));
        }
     }

     function defineReactive(target,key,value){
        let childOb = observe(value);
        let dep = new Dep();
        Object.defineProperty(target,key,{
            get(){
                if(Dep.target){
                    dep.depend();
                    if(childOb?.dep){
                        childOb.dep.depend();
                    }
                }
                return value
            },
            set(newVal){
                if(newVal === value) return
                observe(newVal);
                value = newVal;
                // console.log(newVal);
                dep.notify();
            }
        });
     }
     function observe(data){
        // console.log(data);
        if(typeof data !=="object" || data == null){
            return
        }
        if(data.__ob__ instanceof Observe) return
        return new Observe(data)
     }

    function initState(vm){
        const ops = vm.$options;
        if(ops.data){
            initData(vm);
        }
        if(ops.computed){
            initComputed(vm);
        }
        if(ops.watch){
            initWatch(vm);
        }
    }
    function proxy(vm,target,key){
        Object.defineProperty(vm,key,{
            get(){
                return vm[target][key]
            },
            set(newVal){
                vm[target][key]=newVal;
            }
        });
    }
    function initData(vm){
       let data = vm.$options.data;
       data = typeof data === "function" ? data.call(this):data;
       vm._data = data;
       observe(data);
       for(let key in data){
           proxy(vm,"_data",key);
       }
    }
    function initComputed(vm){
        const computed = vm.$options.computed;
        const watchers = vm._computedWathers={};
        for(let key in computed){
            let userDef = computed[key];
            let fn = typeof userDef == "function" ? userDef : userDef.get;
            watchers[key] = new Watcher(vm,fn,{lazy:true});
            defineComputed(vm,key,userDef);
        }
    }
    function defineComputed(target,key,userDef){
        // const getter = typeof userDef == "function" ? userDef : userDef.get;
        const setter = userDef.set || (()=>{});
        Object.defineProperty(target,key,{
            get:createComputedGetter(key),
            set:setter
        });
    }
    function createComputedGetter(key){
        return function (){
            // console.log("duqufullname");
            const watcher = this._computedWathers[key];
            if(watcher.dirty){
                watcher.evaluate();
            }
            if(Dep.target){
                watcher.depend();
            }
            return watcher.value
        }
    }
    function initWatch(vm){
        let watch = vm.$options.watch;
        for (let key in watch) {
            const handler = watch[key];
            if(Array.isArray(handler)){
                for(let i = 0;i<handler.length;i++){

                    createWatcher(vm,key,handler[i]);
                }
            }else {
                createWatcher(vm,key,handler);
            }
        }
    }
    function createWatcher(vm,key,handler){
        if(typeof handler === "string"){
            handler = vm[handler];
        }
        return vm.$watch(key,handler)
    }
    function initStateMixin(Vue){
        Vue.prototype.$nextTick = nextTick;
        Vue.prototype.$watch = function (exprOrFn,cb,options = {}){
            new Watcher(this,exprOrFn,{user:true},cb);
        };
    }

    function initMinxin(Vue) {
        // debugger
        Vue.prototype._init = function (options) {
            const vm = this;
            vm.$options = options;
            initState(vm);

            if(options.el){
                vm.$mount(options.el);
            }
        };

        Vue.prototype.$mount = function (el) {
            const vm = this;
            el = document.querySelector(el);
            let ops = vm.$options;
            if(!ops.render){
                let template;
                if(!ops.template && el){
                    template = el.outerHTML;
                } else {
                    if(el){
                        template = ops.template;
                    }
                }
                if(template){
                    const render = compileToFunction(template);
                    ops.render = render;
                }
                //console.log(template);
            }
            mountComponent(vm,el);
        };
    }

    function Vue (options) {
        this._init(options);

    }
    initStateMixin(Vue);
    initMinxin(Vue);
    initLifecycle(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
