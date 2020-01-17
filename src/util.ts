import toArray from "lodash.toarray";
import map from "lodash.map";

/**
 * 通过html代码获得样式
 * @param styleNamespace 命名口空间
 * @param stringSelect 选中的文本
 * @param type 类型
 */
export function getCssFromText(
  styleNamespace: string,
  stringSelect: string,
  type?: "sass" | "css"
) {
  // 占位
  const blockString = "\n/* - */\n";
  // 所有标签
  let tag = stringSelect.match(/<(.|\n|\r)+?>/g);
  const data: any = {};
  let regExp: RegExp;
  // 类名
  if (styleNamespace.length === 0) {
    regExp = /class=".+?"/g;
  } else {
    regExp = new RegExp(
      `class="(${styleNamespace}[A-Z|a-z|0-9|-|_]+|${styleNamespace})"`,
      "g"
    );
  }

  // 样式
  const styleExp = /style=".+?"/g;
  if (!tag) {
    return "";
  }
  tag = tag.filter(v => v.includes("class"));

  // 提取标签中的类和样式
  tag.map(v => {
    let tagClass: string = toArray(v.match(regExp))[0];
    let tagCss: string = toArray(v.match(styleExp))[0];

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
      data[tagClass] = tagCss;
    }
  });

  let cssString = "";
  // 使用 /* block */ 占位，防止空class不编译出来
  if (type === "sass") {
    cssString = map(data, (css, className) => {
      if (className === styleNamespace) {
        return `${css}\n`;
      }
      let pre: string;
      if (styleNamespace.length === 0) {
        pre = "." + className;
      } else {
        pre = className.replace(styleNamespace, "&");
      }
      return `  ${pre} { ${blockString} ${css} }\n`;
    }).join("\n");
    if (styleNamespace.length !== 0) {
      cssString = `.${styleNamespace} { ${blockString} ${cssString} }\n`;
    }
  } else {
    cssString = map(data, (css, className) => {
      return `.${className} { ${blockString} ${css} }\n`;
    }).join("\n");
    cssString = `\n${cssString}\n`;
  }

  // 美化
  return cssString;
}
