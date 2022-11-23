(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    function compileToFunction(template) {

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
                    console.log("chufa");
                    inserted = args;
                    break;
                case "splice":
                    inserted = args.slice(2);
            }
            
            if(inserted){
                this.__ob__.observeArray(inserted);
            }
            return res
        };
    });

    class Observe{
        constructor(data){
            Object.defineProperty(data,"__ob__",{
                value:this,
                enumerable:false
            });
            if(Array.isArray(data)){
                
                data.__proto__ = newArrProto;
                this.observeArray(data);
                console.log(data);
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
        observe(value  );
        Object.defineProperty(target,key,{
            get(){
                console.log("huoqu");
                return value
            },
            set(newVal){
                if(newVal === value) return
                value = newVal;
            }
        });
     }
     
     function observe(data){
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
    }
    function proxy(vm,target,key){
        Object.defineProperty(vm,key,{
            get(){
                return vm[target][key]
            },
            set(newVal){
                vam[target][key]=newVal;
            }
        });
    }
     function initData(vm){
        let data = vm.$options.data;
        data = typeof data === "function" ? data.call(this):data;
        console.log(data);
        vm._data = data;
        observe(data);

        for(let key in data){
            proxy(vm,"_data",key);
        }
    }

    function initMinxin(Vue) {
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
                    const render = compileToFunction();
                    ops.render = render;
                }
                console.log(template);
            }
        };
    }

    function Vue (options) {
        this._init(options);

    }
    initMinxin(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
