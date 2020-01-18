import * as vscode from 'vscode'
import { copy } from 'copy-paste'
import { getStyleStringFromHtml } from './util'

export function activate(context: vscode.ExtensionContext) {
    let lastInput1: string
    let lastInput2: string =
        vscode.workspace
            .getConfiguration()
            .get('get.style.from.html.cssStyle') || 'sass'
    const startString = `Congratulations, your extension "get-style-from-html" is now active!`
    console.log(startString)

    let getSytleFromHtml = vscode.commands.registerCommand(
        'extension.get.style.from.html',
        async () => {
            if (!vscode.window.activeTextEditor) return

            vscode.window.activeTextEditor.edit(async (editBuilder) => {
                if (!vscode.window.activeTextEditor) return
                let activeTextEditor = vscode.window.activeTextEditor
                let selectRange = activeTextEditor.selection
                if (selectRange.isEmpty) return

                let selectText = activeTextEditor.document.getText(selectRange)

                // 样式
                let styleNamespace = await vscode.window.showInputBox({
                    prompt: 'Enter style namespace.',
                    value: lastInput1,
                })

                lastInput1 = styleNamespace || ''

                // sass或者css
                let sassOrCss: any = await vscode.window.showInputBox({
                    prompt: 'Enter sass or css.',
                    value: lastInput2,
                })
                lastInput2 = sassOrCss

                let styleString = getStyleStringFromHtml(
                    styleNamespace || '',
                    selectText,
                    sassOrCss
                )
                let copySuccess = () => {
                    vscode.window.showInformationMessage(
                        'Code has copy to clipboard!'
                    )
                }
                copy(styleString, copySuccess)
            })
        }
    )

    context.subscriptions.push(getSytleFromHtml)
}

export function deactivate() {}
