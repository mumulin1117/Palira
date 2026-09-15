import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PALIRO_PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  await page.goto('http://127.0.0.1:5173')
  await page.waitForFunction(() => document.querySelector('#app')?.__vue_app__)
  // Mount new nodes after startup to verify the guards also cover dynamic Vue pages.
  await page.evaluate(() => {
    const fixture = document.createElement('section')
    fixture.id = 'paliro-guard-fixture'
    fixture.style = 'position:fixed;inset:0;z-index:99999;background:white;overflow:auto'
    fixture.innerHTML = '<p>Selectable page copy</p><img draggable="true" src="/assets/paliro-chat-mic@2x.png"><a href="#test">Link</a><input value="hello"><textarea>hello</textarea><div contenteditable="true"><span>hello</span></div><button>Tap</button><div style="height:1500px"></div>'
    document.body.append(fixture)
    fixture.querySelector('button').onclick = () => fixture.dataset.clicked = 'yes'
  })
  for (const selector of ['p', 'img', 'a', 'button', 'input', 'textarea', '[contenteditable] span']) {
    const editable = ['input', 'textarea', '[contenteditable] span'].includes(selector)
    const result = await page.locator(`#paliro-guard-fixture ${selector}`).evaluate(el => {
      const cancelled = type => !el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }))
      return { drag: cancelled('dragstart'), selection: cancelled('selectstart'), menu: cancelled('contextmenu'), css: getComputedStyle(el).userSelect }
    })
    assert.deepEqual(result, { drag: true, selection: !editable, menu: !editable, css: editable ? 'text' : 'none' })
  }
  for (const selector of ['input', 'textarea', '[contenteditable]']) {
    const editor = page.locator(`#paliro-guard-fixture ${selector}`)
    await editor.fill('hello world')
    await editor.press('Home')
    await editor.press('Shift+End')
    await editor.press('Backspace')
    await editor.fill('edited text')
    assert.equal(await editor.evaluate(el => el.value ?? el.textContent), 'edited text')
  }
  await page.locator('#paliro-guard-fixture button').click()
  assert.equal(await page.locator('#paliro-guard-fixture').getAttribute('data-clicked'), 'yes')
  await page.mouse.wheel(0, 400)
  await page.waitForFunction(() => document.querySelector('#paliro-guard-fixture').scrollTop > 0)
  console.log('PASS dynamic drag/callout/selection guards, input editing, clicks and scrolling')
} finally { await browser.close() }
