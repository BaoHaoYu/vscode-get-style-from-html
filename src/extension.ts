import * as vscode from 'vscode'
import { copy } from 'copy-paste'
import { getStyleStringFromHtml, deleteStyle } from './util'

export function activate(context: vscode.ExtensionContext) {
    let cssStyle = vscode.workspace
        .getConfiguration()
        .get('get.style.from.html.cssStyle') as string

    let lastInputStyleNamespace: string
    let lastInputCssStyle: string = cssStyle || 'sass'

    const startString = `Congratulations, your extension "get-style-from-html" is now active!`
    console.log(startString)

    let getSytleFromHtml = vscode.commands.registerTextEditorCommand(
        'extension.get.style.from.html',
        async (
            editor: vscode.TextEditor,
            edit: vscode.TextEditorEdit,
            args: any[]
        ) => {
            let selectRange = editor.selection
            if (selectRange.isEmpty) return

            let selectText = editor.document.getText(selectRange)

            // 样式
            let styleNamespace = await vscode.window.showInputBox({
                prompt: 'Enter style namespace.',
                value: lastInputStyleNamespace,
            })

            lastInputStyleNamespace = styleNamespace || ''

            // sass或者css
            let sassOrCss: any = await vscode.window.showInputBox({
                prompt: 'Enter sass or css.',
                value: lastInputCssStyle,
            })
            lastInputCssStyle = sassOrCss

            let styleString = getStyleStringFromHtml(
                styleNamespace || '',
                selectText,
                sassOrCss
            )

            // 删除 del style="XXXXX"
            await editor.edit((e) => {
                let selectRange = editor.selection
                e.replace(selectRange, deleteStyle(selectText))
            })

            copy(styleString, () => {
                vscode.window.showInformationMessage(
                    'Code has copy to clipboard!'
                )
            })
        }
    )

    context.subscriptions.push(getSytleFromHtml)
}

export function deactivate() {}
