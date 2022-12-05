const ncname = `[a-zA-Z][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/
const startTagClose = /^\s*(\/?)>/
export function parseHTML(html){
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = []
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
        let node = creatASTElement(tagName,attrs)
        if(!root){
            root = node
        }
        if(currentParant){
            node.parent = currentParant
            currentParant.children.push(node)
        }
        stack.push(node)
        currentParant = node
    }
    function chars (text){
        text = text.trim()
        text && currentParant.children.push(
            {
                type:TEXT_TYPE,
                text,
                parent:currentParant
            }
        )
    }
    function end (tagName){
        stack.pop()
        currentParant = stack[stack.length-1]
    }
    //console.log(111);
    function advance(n){
        html = html.slice(n)
    }
    function parseStartTag(){
        const start = html.match(startTagOpen)
        if(start){
            const match = {
                tagName:start[1],
                attr:[]
            }
            advance(start[0].length)
            let attr,end;
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                advance(attr[0].length)
                match.attr.push({
                    name:attr[1],value:attr[3]||attr[4]||attr[5]
                })
            }
            if(end){
                advance(end[0].length)
            }
            return match
        }
        return false 
    }
    while(html){
        let textEnd = html.indexOf("<")
        if(textEnd == 0){
            const startTagMatch =  parseStartTag()
            if(startTagMatch){
                start(startTagMatch.tagName,startTagMatch.attr)
                continue
            }

            let endTagMatch = html.match(endTag)
            if(endTagMatch){
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
            // break
        }

        if(textEnd > 0){
            let text = html.substring(0,textEnd)
            if(text){
                chars(text)
                advance(text.length)
            }
        }
    }
    return root
}