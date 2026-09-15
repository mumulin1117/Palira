import assert from 'node:assert/strict'
// Run against local Vite. Seed an isolated browser session; no account API is called.
const { chromium } = await import(process.env.PALIRO_PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({channel:'chrome',headless:true})
const errors=[]
try {
 for (const [width,height,reduced] of [[320,568,false],[430,932,false],[390,844,true]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'})
  page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>{localStorage.setItem('paliro.eulaAccepted','true');localStorage.setItem('paliro.firstLaunch.v1','shown');localStorage.setItem('paliro.boxRulesSeen',JSON.stringify({'paliro-test-user':true}));localStorage.setItem('paliro.languagePreference.v2',JSON.stringify({'paliro-test-user':'en'}))})
  await page.goto('http://127.0.0.1:5173')
  await page.locator('.paliro-welcome').waitFor()
  await page.evaluate(async()=>{const store=await import('/src/services/paliroLocalStore.js');document.querySelector('#app').__vue_app__._instance.setupState.enterMain(store.paliroLogin('paliro@gmail.com','67896789').session)})
  await page.locator('.paliro-home').waitFor()
  if(!reduced) {
   await page.locator('.paliro-magic-chest.is-spinning').waitFor()
   assert.equal(await page.locator('.paliro-floating-box-target.is-vacant').count(),6)
   await page.locator('.paliro-home-ejected-box').first().waitFor()
   assert.equal(await page.locator('.paliro-home-ejected-box').count(),6)
   await page.screenshot({path:`/tmp/paliro-home-emitting-${width}.png`})
  }
  await page.waitForFunction(()=>!document.querySelector('.paliro-home-take')?.disabled)
  await page.screenshot({path:`/tmp/paliro-home-new-${width}.png`})
  assert.equal(await page.locator('.paliro-floating-box-target:not(.is-vacant)').count(),6)
  await page.locator('.paliro-floating-box-target').nth(4).click()
  await page.locator('.paliro-home-take').click()
  await page.locator('.paliro-match-result').waitFor()
  assert.equal(await page.locator('.paliro-floating-box-target.is-vacant').count(),1)
  await page.locator('.paliro-match-result-actions button').first().click()
  if(!reduced) {
   await page.locator('.paliro-home-ejected-box').waitFor()
   assert.equal(await page.locator('.paliro-home-ejected-box').count(),1)
   assert.equal(await page.locator('.paliro-home-ejected-box').evaluate(el=>el.style.getPropertyValue('--paliro-slot-x')),'8%')
   await page.locator('.paliro-home-shuffling-box').first().waitFor()
   assert.equal(await page.locator('.paliro-home-shuffling-box').count(),6)
   assert.equal(await page.locator('.paliro-floating-box-target.is-vacant').count(),6)
   assert.equal(await page.locator('.paliro-home-take').isDisabled(),true)
   await page.waitForTimeout(600)
   await page.screenshot({path:`/tmp/paliro-home-shuffle-${width}.png`})
  }
  await page.waitForFunction(()=>!document.querySelector('.paliro-home-take')?.disabled)
  assert.equal(await page.locator('.paliro-floating-box-target:not(.is-vacant)').count(),6)
  // Supply the draft through Vue's existing form state; publication still uses the real button and store.
  await page.locator('.paliro-home-make').click()
  await page.locator('.paliro-composer-message textarea').fill('A new box from my afternoon walk.')
  await page.evaluate(()=>{const app=document.querySelector('#app').__vue_app__._instance.setupState;app.composerImages=['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jMZkAAAAASUVORK5CYII=']})
  await page.locator('.paliro-composer-post').click()
  if(!reduced) {
   await page.locator('.paliro-home-receiving-box.is-flying').waitFor()
   assert.equal(await page.locator('.paliro-home-central-chest.is-open').count(),1)
   await page.screenshot({path:`/tmp/paliro-home-receiving-${width}.png`})
  }
  await page.waitForFunction(()=>!document.querySelector('.paliro-home-make')?.disabled)
  const data=await page.evaluate(async()=>{const store=await import('/src/services/paliroLocalStore.js');return {posts:store.paliroGetSocialState('paliro-test-user').posts.length,used:store.paliroGetBoxState('paliro-test-user').freeActionsUsed,overflow:document.documentElement.scrollWidth>innerWidth}})
  assert.deepEqual(data,{posts:1,used:2,overflow:false})
  await page.locator('.paliro-home-tab').nth(2).click()
  await page.locator('.paliro-home-tab').first().click()
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.paliro-magic-chest.is-spinning').count(),0)
  console.log('PASS',width,height,{reduced,...data})
  await page.close()
 }
 assert.deepEqual(errors,[])
} finally {await browser.close()}
