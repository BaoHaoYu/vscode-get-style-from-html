import toArray from 'lodash.toarray'
import remove from 'lodash.remove'
import findIndex from 'lodash.findindex'
import repeat from 'lodash.repeat'
import uniqBy from 'lodash.uniqby'

export type Item = { class: string; style: string; children?: CssData }

export type CssData = Item[]

/**
 * 把平行数据转化为嵌套数据··
 * @param list 数据列表
 */
export function nestedData(list: CssData) {
    function deepList(list: CssData) {
        //参考数据
        let refer1 = [...list]
        let refer2 = [...list]
        // 移除的元素下标
        let removeIndex: number[] = []
        let index = 0
        while (refer1.length > 0) {
            // 当前
            const curItem = { ...refer1[0] }
            // 所有对比list[i]，看看list[i]是否是curItem子元素
            for (let i = 0; i < refer2.length; i++) {
                if (curItem.class !== refer2[i].class) {
                    if (refer2[i].class.indexOf(curItem.class) === 0) {
                        removeIndex.push(i)
                        list[index] = curItem
                        if (!list[index].children) {
                            list[index].children = []
                        }
                        list[index].children!.push(refer2[i])
                    }
                }
            }

            refer1.shift()
            index++
        }

        remove(list, (v, i) => {
            return findIndex(removeIndex, (v) => v === i) !== -1
        })

        for (let i = 0; i < list.length; i++) {
            list[i].children = deepList(list[i].children || [])
        }

        return list
    }

    return deepList([...list])
}

/**
 * 通过html代码获得样式
 * @param styleNamespace 命名口空间
 * @param stringSelect 选中的文本
 * @param type 类型
 */
export function getStyleDataFromHtml(
    styleNamespace: string,
    stringSelect: string
) {
    // 所有标签
    let tags = stringSelect.match(/<(.|\n|\r)+?>/g)
    const data: CssData = []
    let classRegExp: RegExp
    // 类名
    if (styleNamespace.length === 0) {
        classRegExp = /class=".+?"/g
    } else {
        let regExpString = `class="(${styleNamespace}[A-Z|a-z|0-9|\\-|_]+|${styleNamespace})"`
        classRegExp = new RegExp(regExpString, 'g')
    }

    // 样式
    const styleRegExp = /style=".+?"/g
    if (!tags) {
        return data
    }
    tags = tags.filter((v) => v.includes('class'))

    // 提取标签中的类和样式
    tags.map((tag) => {
        // class="XXXXX"
        let tagClass: string = toArray(tag.match(classRegExp))[0]
        // style="XXXXX"
        let tagStyle: string = toArray(tag.match(styleRegExp))[0]

        tagClass = (tagClass || '')
            .replace('class=', '')
            .replace('{', '')
            .replace(/}/g, '')
            .replace(/"/g, '')

        tagStyle = (tagStyle || '')
            .replace('style=', '')
            .replace('{', '')
            .replace(/}/g, '')
            .replace(/"/g, '')

        if (tagClass) {
            data.push({ class: tagClass, style: tagStyle })
        }
    })

    return data
}

/**
 * 处理样式
 * @param style 样式
 */
function getStyle(style: string) {
    style = style
        .split(';')
        .filter((v) => v.length !== 0)
        .join(';')
    if (style.length === 0) {
        style = ''
    } else {
        style = style + ';'
    }
    return style
}

/**
 * 生成sass
 * @param data 数据
 * @param deep 深度
 * @param parent 父数据
 */
export function deepSassBlock(data: CssData, deep: number = 0, parent?: Item) {
    // 占位
    const blockString = '/* - */'
    let sassStyle: string = ''

    data.map((v, i) => {
        let childrenBlock = ''
        const spaceClass = repeat('  ', deep)
        const spaceStyle = repeat('  ', deep) + '  '

        if (v.children) {
            childrenBlock = deepSassBlock(v.children, deep + 1, v)
        }
        let className = parent
            ? v.class.replace(parent.class, '&')
            : '.' + v.class
        let style = getStyle(v.style)
        let block = `${spaceClass}${className} {\n${spaceStyle}${blockString}\n${spaceStyle}${style}\n${childrenBlock}${spaceClass}}\n`
        if (deep !== 0 || i !== 0) {
            block = '\n' + block
        }
        sassStyle += block
    })
    return sassStyle
}
/**
 * 生成sass
 * @param data 数据
 * @param deep 深度
 * @param parent 父数据
 */
export function deepCssBlock(data: CssData) {
    const styleBlock: string[] = []

    function _deepCssBlock(data: CssData, parent?: Item) {
        // 占位
        const blockString = '/* - */'

        data.map((v, i) => {
            const spaceClass = repeat('  ', 0)
            const spaceStyle = '  '
            let className = '.' + v.class
            let style = getStyle(v.style)
            let block = `${className} {\n${spaceStyle}${blockString}\n${spaceStyle}${style}\n${spaceClass}}\n`
            block = '\n' + block
            styleBlock.push(block)
            if (v.children) {
                _deepCssBlock(v.children, v)
            }
        })
        return styleBlock.join('')
    }

    return _deepCssBlock(data)
}

/**
 * 清除style
 * @param html html代码
 */
export function deleteStyle(html: string) {
    return html.replace(/(data\-)?del(.|\n|\r)+?style="(.|\n|\r)+?"/g, '')
}

/**
 * 总体逻辑
 * @param styleNamespace 命名口空间
 * @param stringSelect 选中的文本
 * @param type 类型
 */
export function getStyleStringFromHtml(
    styleNamespace: string,
    stringSelect: string,
    type: 'sass' | 'css' = 'sass'
) {
    const data = getStyleDataFromHtml(styleNamespace, stringSelect)
    const uniqData = uniqBy(data, (v) => v.class)
    const nData = nestedData(uniqData)
    if (type === 'sass') {
        return deepSassBlock(nData)
    } else {
        return deepCssBlock(nData)
    }
}
