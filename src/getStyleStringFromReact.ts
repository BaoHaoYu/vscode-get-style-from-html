import toArray from 'lodash.toarray'
import last from 'lodash.last'
import dropright from 'lodash.dropright'
import trim from 'lodash.trim'
import { CssData } from './getStyleStringFromHtml'
// @ts-ignore
import { slug } from 'to-case'
export function getStyleDataFromReact(
    styleNamespace: string,
    stringSelect: string
) {
    // 所有标签
    let tags = stringSelect.match(/<(.|\n|\r)+?>/g)
    let data: CssData = []
    let classRegExp: RegExp
    // 类名
    if (styleNamespace.length === 0) {
        classRegExp = /className=(".+?"|{.+?})/g
    } else {
        let regExpString = `className="(${styleNamespace}[A-Z|a-z|0-9|\\-|_]+|${styleNamespace})"`
        classRegExp = new RegExp(regExpString, 'g')
    }

    // 样式
    let styleRegExp = /style={{(.+|\n|\r)+?}}/g
    if (!tags) {
        return data
    }
    tags = tags.filter((v) => v.includes('class'))

    // 提取标签中的类和样式
    tags.map((tag) => {
        // className="XXXXX" | className={'XXXXX'} | className={"XXXXX"} |  className={xx.xxxx}
        let tagClass: string = toArray(tag.match(classRegExp))[0]
        // style="{{XXXXX}}"
        let tagStyle: string = toArray(tag.match(styleRegExp))[0]

        tagClass = (tagClass || '')
            .replace('className=', '')
            .replace(/}/, '')
            .replace(/{/, '')
            .replace(/'|"|.+?\./g, '')

        tagStyle = (tagStyle || '')
            .replace('style=', '')
            .replace(/{|}|\n|\r/g, '')
            .replace(/[a-z|A-Z]+/g, (sub) => slug(sub))

        tagStyle = trim(tagStyle)

        let cssPropsBlock = (
            tagStyle.match(/([a-z|A-Z|-]+?:\s+?)(".+?"|'.+?'|.+?,|.+)/g) || []
        ).map((block) => {
            if (last(block) === ',') {
                block = dropright(block).join('')
            }
            block = block.replace(/:\s+(.+)/, (cssv) => {
                cssv = cssv.replace(/:\s+/, '')
                if (cssv[0] === "'" || cssv[0] === '"') {
                    cssv = cssv.slice(1, cssv.length - 1)
                }
                if (/^\d+$/.test(cssv)) {
                    cssv = cssv + 'px'
                }
                return ': ' + cssv
            })
            return block
        })

        if (tagClass) {
            data.push({ class: tagClass, style: cssPropsBlock.join('; ') })
        }
    })

    return data
}
