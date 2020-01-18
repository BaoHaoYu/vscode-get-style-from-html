import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import {
    nestedData,
    CssData,
    getStyleDataFromHtml,
    deleteStyle,
    deepSassBlock,
    deepCssBlock,
} from '../../util'

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.')
    let htmlString = `
    <div class="App" del style="background: black">
        <div class="App-head" del style="height: 60px">
            <i class="App-head-icon" del style="height: 20px;width:20px"></i>
            <div class="App-head-text" del style="font-size: 20px">
                Title
            </div>
        </div>
        <div class="App-footer" del style="height: 60px">
            <div class="App-footer-about">
                <a href="./about.html">about</a>
            </div>
        </div>
        <div class="info" del style="color: blue">
            info
        </div>
    </div>`
    let cssData: CssData = [
        { class: 'app', style: '' },
        { class: 'app-head-title', style: '' },
        { class: 'app-head', style: '' },
        { class: 'app-foot', style: '' },
    ]
    test('Test function deleteStyle', () => {
        let newHtmlString = deleteStyle(htmlString)
        assert.equal(/style=".+?"/g.test(newHtmlString), false)
    })

    test('Test function getStyleDataFromHtml', () => {
        let data1 = getStyleDataFromHtml('', htmlString)
        let data2 = getStyleDataFromHtml('App', htmlString)

        assert.equal(data1.length, 7)
        assert.equal(data1[0].class, 'App')
        assert.equal(data1[0].style, 'background: black')
        assert.equal(data1[1].class, 'App-head')
        assert.equal(data1[data1.length - 1].class, 'info')
        assert.equal(data1[data1.length - 1].style, 'color: blue')

        assert.equal(data2.length, 6)
        assert.equal(data2[0].class, 'App')
        assert.equal(data2[0].style, 'background: black')
        assert.equal(data2[1].class, 'App-head')
        assert.equal(data2[data2.length - 1].class, 'App-footer-about')
        assert.equal(data2[data2.length - 1].style, '')
    })

    test('Test function nestedData', () => {
        let ndata = nestedData(cssData)
        let rootData = ndata[0]

        assert.equal(ndata.length, 1)
        assert.equal(!!rootData.children, true)
        assert.equal(rootData.children!.length, 2)

        let appHead = rootData.children!.filter(
            (v) => v.class === 'app-head'
        )[0]
        assert.equal(!!appHead.children, true)
        assert.equal(appHead.children![0].class, 'app-head-title')
    })

    test('Test function deepSassBlock', () => {
        let ndata = nestedData(cssData)
        let sass = deepSassBlock(ndata)

        assert.equal(/app\s{/.test(sass), true)
        assert.equal(/&\-head\s{/.test(sass), true)
        assert.equal(/&\-title\s{/.test(sass), true)
        assert.equal(/&\-foot\s{/.test(sass), true)
    })

    test('Test function deepCssBlock', () => {
        let ndata = nestedData(cssData)
        let css = deepCssBlock(ndata)

        assert.equal(/app\s{/.test(css), true)
        assert.equal(/app\-head\s{/.test(css), true)
        assert.equal(/app\-head\-title\s{/.test(css), true)
        assert.equal(/app\-foot\s{/.test(css), true)
    })
})
