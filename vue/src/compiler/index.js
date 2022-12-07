import {
    parseHTML
} from "./parse"
function genProps(attrs){
    let str = ""
    for(let i = 0;i<attrs.length;i++){
        let attr = attrs[i]
        if(attr.name=="style"){
            let obj = {}
            attr.value.split(";").forEach(item => {
                let [key,value] = item.split(":")
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}
const defaultTagRE=/\{\{((?:.|\r?\n)+?)\}\}/g
function gen(node){
    if(node.type===1){
        return codeGen(node)
    }else{
        let text = node.text
        text = text.replace(/\s/g,'')
        if(!defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})`
        }else{
            let tokens = []
            let match;
            let lastIndex = 0;
            defaultTagRE.lastIndex = 0
            while (match = defaultTagRE.exec(text)){
                let index = match.index
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)))

                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)))
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
    let children = genChildren(ast.children)
    let code = (`_c(${JSON.stringify(ast.tag)},${ast.attrs.length>0?genProps(ast.attrs):'null'}${ast.children.length?`,${children}`:''})`)
    return code
}

export function compileToFunction(template) {
    template = template.replace(/\n/g,'')
    // setTimeout(()=>{

        let ast = parseHTML(template)
    // })
    let code = codeGen(ast);
    // console.log(code,7);
    code = `with(this){return ${code}}`
    let render = new Function(code)
    return render
}