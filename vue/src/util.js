const strats = {}
const LIFECYCLE = ['beforeCreate','created']

strats.components = function(parentVal, childVal){
    const res = Object.create(parentVal)
    if(childVal){
        for(let key in childVal){
            res[key] = childVal[key]
        }
    }
    return res
}
export function mergeOptions(parent, child){
    const options = {}
    // if(){

        for(let key in parent){
            key == 'components' &&  mergeField(key)
        }
        for(let key in child){
            if(!parent.hasOwnProperty(key)){
                key == 'components' &&  mergeField(key)
            }
        }
    // }


function mergeField (key) {
    // strats 是指合并策略集
    // strat 是指特定选项的合并策略，是一个函数
    const strat = strats[key]
    console.log(strat);
    // 使用这个合并策略对 parent 和 child 中指定的 key 进行合并
    options[key] = strat(parent[key], child[key], )
  }
  return options
}