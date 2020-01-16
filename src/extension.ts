import * as vscode from "vscode";
import { copy } from "copy-paste";
import { getCssFromText } from "./util";

export function activate(context: vscode.ExtensionContext) {
  let lastInput1: string;
  let lastInput2: string = "sass";

  console.log(
    'Congratulations, your extension "vscode-extension-demo" is now active!'
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
        let styleNamespace = await vscode.window.showInputBox({
          prompt: "Enter style namespace.",
          value: lastInput1
        });
        if (styleNamespace === undefined || styleNamespace.length === 0) return;
        lastInput1 = styleNamespace;

        // sass或者css
        let sassOrCss: any = await vscode.window.showInputBox({
          prompt: "Enter sass or css.",
          value: lastInput2
        });
        lastInput2 = sassOrCss;

        const css = getCssFromText(styleNamespace, selectText, sassOrCss);
        copy(css, () => {
          vscode.window.showInformationMessage("Code has copy to clipboard!");
        });
      });
    }
  );

  context.subscriptions.push(getSytleFromHtml);
}

export function deactivate() {}
