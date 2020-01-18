import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import { nestedData, CssData } from '../../util'

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.')

    test('nestedData', () => {
        let data: CssData = [
            { class: 'app', style: '' },
            { class: 'app-head-title', style: '' },
            { class: 'app-head', style: '' },
            { class: 'app-foot', style: '' },
        ]
        let ndata = nestedData(data)

        let rootData = ndata[0]

        assert.equal(ndata.length, 1)
        assert.equal(!!rootData.children, true)
        assert.equal(rootData.children!.length, 2)

        const appHead = rootData.children!.filter(
            (v) => v.class === 'app-head'
        )[0]
        assert.equal(!!appHead.children, true)
        assert.equal(appHead.children![0].class, 'app-head-title')
    })
})
