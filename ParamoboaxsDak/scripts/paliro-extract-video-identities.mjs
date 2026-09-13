import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { paliroVideoIdentityFixtures } from '../src/services/paliroVideoIdentityFixtures.js'

const { chromium } = await import(process.env.PALIRO_PLAYWRIGHT_MODULE || 'playwright')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const previewURL = process.env.PALIRO_PREVIEW_URL || 'http://127.0.0.1:4173/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage()
  await page.goto(previewURL)
  for (const fixture of paliroVideoIdentityFixtures) {
    const images = await page.evaluate(async (fixture) => {
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'
      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve
        video.onerror = () => reject(new Error(`Cannot decode ${fixture.source}`))
        video.src = fixture.source
      })
      if (fixture.seconds >= video.duration) throw new Error('Selected frame exceeds video duration')
      await new Promise((resolve) => { video.onseeked = resolve; video.currentTime = fixture.seconds })
      const frame = document.createElement('canvas')
      frame.width = fixture.rotation ? video.videoHeight : video.videoWidth
      frame.height = fixture.rotation ? video.videoWidth : video.videoHeight
      const ctx = frame.getContext('2d')
      ctx.translate(frame.width / 2, frame.height / 2)
      ctx.rotate(fixture.rotation * Math.PI / 180)
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2)
      const result = {}
      for (const [key, crop, width, height] of [['avatar', fixture.avatarCrop, 512, 512], ['profileBackground', fixture.heroCrop, 768, 960]]) {
        const [x, y, w, h] = crop
        if (x < 0 || y < 0 || x + w > 1.00001 || y + h > 1.00001) throw new Error(`Invalid crop: ${fixture.ownerID}`)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.imageSmoothingQuality = 'high'
        context.drawImage(frame, x * frame.width, y * frame.height, w * frame.width, h * frame.height, 0, 0, width, height)
        result[key] = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]
      }
      video.removeAttribute('src')
      video.load()
      return result
    }, fixture)
    for (const key of ['avatar', 'profileBackground']) {
      const destination = path.join(root, 'public', fixture[key])
      await mkdir(path.dirname(destination), { recursive: true })
      await writeFile(destination, Buffer.from(images[key], 'base64'))
    }
    console.log(`${fixture.ownerID}: ${fixture.source} @ ${fixture.seconds}s`)
  }
} finally {
  await browser.close()
}
