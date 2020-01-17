import toArray from "lodash.toarray";
import remove from "lodash.remove";
import findIndex from "lodash.findindex";
import repeat from "lodash.repeat";
import uniqBy from "lodash.uniqby";

type Item = { class: string; style: string; children?: CssData };

type CssData = Item[];

/**
 * 把平行数据转化为嵌套数据··
 * @param list 数据列表
 */
export function nestedData(list: CssData) {
  function deepList(list: CssData) {
    list.map((item, index) => {
      const indexL: number[] = [];
      const copyItem = { ...item };
      for (let i = index; i < list.length; i++) {
        if (
          i + 1 < list.length &&
          list[i + 1].class.indexOf(item.class) === 0
        ) {
          if (!copyItem.children) {
            copyItem.children = [];
          }
          indexL.push(i + 1);
          copyItem.children.push(list[i + 1]);
          list[i] = copyItem;
        }
      }
      remove(list, (v, i) => {
        return findIndex(indexL, v => v === i) !== -1;
      });

      if (copyItem.children) {
        copyItem.children = deepList(copyItem.children);
      }
      return copyItem;
    });

    return list;
  }

  return deepList([...list]);
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
  let tags = stringSelect.match(/<(.|\n|\r)+?>/g);
  const data: CssData = [];
  let classRegExp: RegExp;
  // 类名
  if (styleNamespace.length === 0) {
    classRegExp = /class=".+?"/g;
  } else {
    classRegExp = new RegExp(
      `class="(${styleNamespace}[A-Z|a-z|0-9|-|_]+|${styleNamespace})"`,
      "g"
    );
  }

  // 样式
  const styleRegExp = /style=".+?"/g;
  if (!tags) {
    return data;
  }
  tags = tags.filter(v => v.includes("class"));

  // 提取标签中的类和样式
  tags.map(tag => {
    // class="XXXXX"
    let tagClass: string = toArray(tag.match(classRegExp))[0];
    // style="XXXXX"
    let tagCss: string = toArray(tag.match(styleRegExp))[0];

    tagClass = (tagClass || "")
      .replace("class=", "")
      .replace("{", "")
      .replace(/}/g, "")
      .replace(/"/g, "");

    tagCss = (tagCss || "")
      .replace("style=", "")
      .replace("{", "")
      .replace(/}/g, "")
      .replace(/"/g, "");

    if (tagClass) {
      data.push({ class: tagClass, style: tagCss });
    }
  });

  return data;
}

/**
 * 处理样式
 * @param style 样式
 */
function getStyle(style: string) {
  style = style
    .split(";")
    .filter(v => v.length !== 0)
    .join(";");
  if (style.length === 0) {
    style = "";
  } else {
    style = style + ";";
  }
  return style;
}

/**
 * 生成sass
 * @param data 数据
 * @param deep 深度
 * @param parent 父数据
 */
export function deepSassBlock(data: CssData, deep: number = 0, parent?: Item) {
  // 占位
  const blockString = "/* - */";
  let sassStyle: string = "";

  data.map((v, i) => {
    let childrenBlock = "";
    const spaceClass = repeat("  ", deep);
    const spaceStyle = repeat("  ", deep) + "  ";

    if (v.children) {
      childrenBlock = deepSassBlock(v.children, deep + 1, v);
    }
    let className = parent ? v.class.replace(parent.class, "&") : "." + v.class;
    let style = getStyle(v.style);
    let block = `${spaceClass}${className} {\n${spaceStyle}${blockString}\n${spaceStyle}${style}\n${childrenBlock}${spaceClass}}\n`;
    if (deep !== 0 || i !== 0) {
      block = "\n" + block;
    }
    sassStyle += block;
  });
  return sassStyle;
}
/**
 * 生成sass
 * @param data 数据
 * @param deep 深度
 * @param parent 父数据
 */
export function deepCssBlock(data: CssData) {
  const styleBlock: string[] = [];

  function _deepCssBlock(data: CssData, parent?: Item) {
    // 占位
    const blockString = "/* - */";

    data.map((v, i) => {
      const spaceClass = repeat("  ", 0);
      const spaceStyle = "  ";
      if (v.children) {
        _deepCssBlock(v.children, v);
      }
      let className = "." + v.class;
      let style = getStyle(v.style);
      let block = `${className} {\n${spaceStyle}${blockString}\n${spaceStyle}${style};\n${spaceClass}}\n`;
      block = "\n" + block;
      styleBlock.push(block);
    });
    return styleBlock.join("");
  }

  return _deepCssBlock(data);
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
  type: "sass" | "css" = "sass"
) {
  const data = getStyleDataFromHtml(styleNamespace, stringSelect);
  const uniqData = uniqBy(data, v => v.class);
  const nData = nestedData(uniqData);
  if (type === "sass") {
    return deepSassBlock(nData);
  } else {
    return deepCssBlock(nData);
  }
}
