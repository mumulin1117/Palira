import assert from 'node:assert/strict'
// Run against local Vite with an isolated account store and a mocked native recorder.
const {chromium}=await import(process.env.PALIRO_PLAYWRIGHT_MODULE || 'playwright')
const browser=await chromium.launch({channel:'chrome',headless:true})
try {for(const [width,height] of [[320,568],[375,812],[430,932]]) {
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'})
 await page.addInitScript(()=>{
  localStorage.setItem('paliro.eulaAccepted','true');localStorage.setItem('paliro.firstLaunch.v1','shown');localStorage.setItem('paliro.boxRulesSeen',JSON.stringify({'paliro-test-user':true}))
  window.voiceCalls=[];window.voicePending=false;let start=0
  window.PaliroNative={platform:'ios',addListener:async()=>({remove:async()=>{}}),convertFileSrc:s=>s,request:async(service,method)=>{
   if(service!=='PaliroVoiceRecorder') return {}
   window.voiceCalls.push(method)
   if(method==='start') {if(window.voicePending) await new Promise(r=>window.resolveVoice=r);start=performance.now()}
   if(method==='stop')return {fileUri:'file:///voice.m4a',durationSeconds:(performance.now()-start)/1000}
   if(method==='cancel')window.resolveVoice?.()
   return {}
  }}
 })
 await page.goto('http://127.0.0.1:5173')
 await page.waitForFunction(()=>document.querySelector('#app')?.__vue_app__?._instance?.setupState)
 await page.evaluate(async()=>{const s=await import('/src/services/paliroLocalStore.js');const app=document.querySelector('#app').__vue_app__._instance.setupState;app.enterMain(s.paliroLogin('paliro@gmail.com','67896789').session);const social=s.paliroGetSocialState('paliro-test-user');const friend=social.following.find(f=>social.followers.some(x=>x.id===f.id));s.paliroGetOrCreateConversation('paliro-test-user',friend);app.openConversation(friend.id)})
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message))
 const state=()=>page.evaluate(()=>document.querySelector('#app').__vue_app__._instance.setupState.voiceRecording.state)
 const count=()=>page.locator('.paliro-audio-message').count()
 await page.locator('.paliro-composer-voice-trigger').click()
 await page.locator('.paliro-record-mic').waitFor()
 assert.deepEqual(await page.evaluate(()=>voiceCalls),[])
 assert.equal(await state(),'idle')
 const imageDrag=await page.locator('.paliro-record-mic img').evaluate(img=>{
  const drag=new Event('dragstart',{bubbles:true,cancelable:true});img.dispatchEvent(drag)
  return {draggable:img.draggable,prevented:drag.defaultPrevented,hit:getComputedStyle(img).pointerEvents}
 })
 assert.deepEqual(imageDrag,{draggable:false,prevented:true,hit:'none'})
 await page.screenshot({path:`/tmp/paliro-voice-sheet-${width}.png`})
 const rect=await page.locator('.paliro-record-mic').boundingBox();assert.ok(rect.y>0 && rect.y+rect.height<height)
 const press=async()=>{const r=await page.locator('.paliro-record-mic').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down()}
 await press();await page.waitForFunction(()=>document.querySelector('#app').__vue_app__._instance.setupState.voiceRecording.state==='recording');await page.mouse.up()
 await page.waitForFunction(()=>document.querySelector('#app').__vue_app__._instance.setupState.voiceRecording.state==='idle')
 assert.match(await page.locator('.paliro-voice-recording [role=alert]').innerText(),/1|one/)
 const before=await count()
 await press();await page.waitForTimeout(1200);await page.mouse.up();await page.locator('.paliro-composer-voice-trigger').waitFor()
 assert.equal(await count(),before+1)
 for(let attempt=0;attempt<3;attempt++) {
  await page.locator('.paliro-composer-voice-trigger').click();await press();await page.waitForTimeout(700)
  await page.mouse.move(rect.x-70,rect.y+28,{steps:12})
  assert.equal(await page.locator('.paliro-voice-recording.is-cancelling').count(),1)
  const dragged=await page.locator('.paliro-record-mic').boundingBox()
  assert.ok(Math.abs(dragged.x-rect.x)<1 && Math.abs(dragged.y-rect.y)<1)
  await page.mouse.up();await page.locator('.paliro-composer-voice-trigger').waitFor();assert.equal(await count(),before+1)
 }
 await page.locator('.paliro-composer-voice-trigger').click();await page.evaluate(()=>voicePending=true);await press();await page.waitForFunction(()=>document.querySelector('#app').__vue_app__._instance.setupState.voiceRecording.state==='starting');await page.mouse.up();await page.waitForFunction(()=>document.querySelector('#app').__vue_app__._instance.setupState.voiceRecording.state==='idle');assert.equal(await count(),before+1)
 assert.deepEqual(pageErrors,[])
 console.log('PASS idle opening, short discard, hold/release send, swipe cancel, pending permission release',width)
 await page.close()
}}finally{await browser.close()}
