import toArray from 'lodash.toarray';
import map from 'lodash.map';

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
  // 类名
  const regExp = new RegExp(
    `(${styleNamespace}[A-Z|a-z|0-9|-|_]+)|(${styleNamespace})`,
    "g"
  );
  // 样式
  const styleExp = /(style=\{(.|\n)+?\}\})|(style=".+?")/g;
  if (!tag) {
    return "";
  }
  tag = tag.filter(v => v.includes("class"));

  // 提取标签中的类和样式
  tag.map(v => {
    const tagClass: string = toArray(v.match(regExp))[0];
    const tagCss: string = toArray(v.match(styleExp))[0];

    const css = (tagCss || "")
      .replace("style={", "")
      .replace("style=", "")
      .replace("{", "")
      .replace(/}/g, "")
      .replace(/"/g, "");

    if (tagClass) {
      data[tagClass] = css;
    }
  });

  let cssString = "";
  // 使用 /* block */ 占位，防止空class不编译出来
  if (type === "sass") {
    cssString = map(data, (css, className) => {
      if (className === styleNamespace) {
        return `${css}\n`;
      }
      return `  ${className.replace(
        styleNamespace,
        "&"
      )} { ${blockString} ${css} }\n`;
    }).join("\n");
    cssString = `.${styleNamespace} { ${blockString} ${cssString} }\n`;
  } else {
    cssString = map(data, (cssData, className) => {
      return `.${className} { ${blockString} ${cssData} }\n`;
    }).join("\n");
    cssString = `.${styleNamespace} { ${blockString} }\n${cssString}\n`;
  }

  // 美化
  return cssString;
}
