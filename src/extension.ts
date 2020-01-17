import * as vscode from "vscode";
import { copy } from "copy-paste";
import { getStyleStringFromHtml } from "./util";

export function activate(context: vscode.ExtensionContext) {
  let lastInput1: string;
  let lastInput2: string =
    vscode.workspace.getConfiguration().get("get.style.from.html.cssStyle") ||
    "sass";

  console.log(
    'Congratulations, your extension "get-style-from-html" is now active!'
  );

  let getSytleFromHtml = vscode.commands.registerCommand(
    "extension.get.style.from.html",
    async () => {
      if (!vscode.window.activeTextEditor) return;

      vscode.window.activeTextEditor.edit(async editBuilder => {
        if (!vscode.window.activeTextEditor) return;
        const selectRange = vscode.window.activeTextEditor.selection;
        if (selectRange.isEmpty) return;

        const selectText = vscode.window.activeTextEditor.document.getText(
          selectRange
        );

        // 样式
        let styleNamespace =
          (await vscode.window.showInputBox({
            prompt: "Enter style namespace.",
            value: lastInput1
          })) || "";
        lastInput1 = styleNamespace;

        // sass或者css
        let sassOrCss: any = await vscode.window.showInputBox({
          prompt: "Enter sass or css.",
          value: lastInput2
        });
        lastInput2 = sassOrCss;

        const styleString = getStyleStringFromHtml(
          styleNamespace,
          selectText,
          sassOrCss
        );
        copy(styleString, () => {
          vscode.window.showInformationMessage("Code has copy to clipboard!");
        });
      });
    }
  );

  context.subscriptions.push(getSytleFromHtml);
}

export function deactivate() {}
