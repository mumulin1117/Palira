export const PALIRO_VOICE_MAX_SECONDS = 300

export function paliroVoiceDuration(result, fallback) {
  const seconds = Number(result?.durationSeconds ?? Number(result?.durationMilliseconds) / 1000)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : Math.max(0, fallback)
}

function readAudioBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

// Serialize microphone operations so cancellation also covers a pending permission prompt.
export function createPaliroVoiceSession({ nativeRecorder = null, mediaDevices = globalThis.navigator?.mediaDevices, Recorder = globalThis.MediaRecorder, readBlob = readAudioBlob, now = () => performance.now() } = {}) {
  let queue = Promise.resolve()
  let generation = 0
  let recorder = null
  let stream = null
  let chunks = []
  let elapsed = 0
  let startedAt = null
  let draft = null
  let state = 'idle'
  const run = (work) => {
    const result = queue.then(work)
    queue = result.catch(() => {})
    return result
  }
  const duration = () => elapsed + (startedAt === null ? 0 : (now() - startedAt) / 1000)
  const freezeTime = () => { elapsed = duration(); startedAt = null }
  const release = () => { stream?.getTracks().forEach((track) => track.stop()); stream = null }
  const stopBrowser = () => new Promise((resolve, reject) => {
    if (!recorder || recorder.state === 'inactive') { release(); resolve(null); return }
    const current = recorder
    current.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: current.mimeType || 'audio/webm' })
      recorder = null
      chunks = []
      release()
      resolve(blob)
    }, { once: true })
    current.addEventListener('error', (event) => { release(); reject(event.error || new Error('recording-failed')) }, { once: true })
    current.stop()
  })
  return {
    duration,
    start() {
      const revision = ++generation
      return run(async () => {
        if (revision !== generation) return false
        elapsed = 0
        draft = null
        try {
          if (nativeRecorder) await nativeRecorder.start()
          else {
            if (!mediaDevices?.getUserMedia || !Recorder) throw new Error('recorder-unavailable')
            stream = await mediaDevices.getUserMedia({ audio: true })
            if (revision !== generation) { release(); return false }
            const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => Recorder.isTypeSupported?.(type))
            recorder = new Recorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 })
            chunks = []
            recorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data) })
            recorder.start(250)
          }
          if (revision !== generation) return false
          startedAt = now()
          state = 'recording'
          return true
        } catch (error) { release(); state = 'idle'; throw error }
      })
    },
    pause() {
      return run(async () => {
        if (state !== 'recording') return
        if (nativeRecorder) await nativeRecorder.pause()
        else recorder.pause()
        freezeTime()
        state = 'paused'
      })
    },
    resume() {
      return run(async () => {
        if (state !== 'paused') return
        if (nativeRecorder) await nativeRecorder.resume()
        else recorder.resume()
        startedAt = now()
        state = 'recording'
      })
    },
    stop() {
      const revision = generation
      return run(async () => {
        if (draft) return draft
        if (!['recording', 'paused'].includes(state)) return null
        freezeTime()
        const result = nativeRecorder ? await nativeRecorder.stop() : null
        const blob = nativeRecorder ? null : await stopBrowser()
        const source = nativeRecorder ? result?.fileUri ?? result?.source : blob?.size ? await readBlob(blob) : ''
        draft = { source, durationSeconds: Math.min(PALIRO_VOICE_MAX_SECONDS, paliroVoiceDuration(result, elapsed)) }
        state = 'ready'
        if (revision !== generation) return null
        if (!source) throw new Error('empty-recording')
        return draft
      })
    },
    cancel() {
      ++generation
      return run(async () => {
        try {
          if (nativeRecorder) {
            if (draft?.source && nativeRecorder.discard) await nativeRecorder.discard({ fileUri: draft.source })
            await nativeRecorder.cancel()
          } else await stopBrowser()
        } finally {
          release()
          recorder = null
          chunks = []
          draft = null
          elapsed = 0
          startedAt = null
          state = 'idle'
        }
      })
    },
    commit() { draft = null; state = 'idle'; elapsed = 0; startedAt = null },
  }
}
