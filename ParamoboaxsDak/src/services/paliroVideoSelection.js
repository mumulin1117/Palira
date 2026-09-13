export function paliroMediaErrorKey(error, fallback = 'videoPickerFailed') {
  if (error?.code === 'VIDEO_TOO_LARGE') return 'videoTooLarge'
  if (/PERMISSION_DENIED|not granted|NotAllowedError/i.test(`${error?.code} ${error?.message} ${error?.name}`)) return 'mediaPermissionDenied'
  if (error?.message === 'native-camera-required') return 'cameraNativeOnly'
  return fallback
}

export async function paliroSelectVideo({ source, nativePicker, browserPicker }) {
  const result = nativePicker
    ? await nativePicker.pick({ source, mediaType: 'video' })
    : source === 'camera' ? (() => { throw new Error('native-camera-required') })() : await browserPicker()
  if (!result || result.cancelled) return null
  if (!result.fileUri || !result.thumbnail?.startsWith('data:image/')) throw new Error('video-preview-unavailable')
  return { source: result.fileUri, thumbnail: result.thumbnail }
}

export function paliroBrowserVideoCover(source) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const finish = (error, image) => {
      clearTimeout(timer)
      video.onloadeddata = video.onerror = null
      video.removeAttribute('src')
      video.load()
      error ? reject(error) : resolve(image)
    }
    const timer = setTimeout(() => finish(new Error('video-preview-timeout')), 15000)
    video.onerror = () => finish(new Error('video-preview-unavailable'))
    video.onloadeddata = () => {
      try {
        if (!video.videoWidth || !video.videoHeight) throw new Error('invalid-video')
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight))
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        finish(null, canvas.toDataURL('image/jpeg', 0.75))
      } catch (error) { finish(error) }
    }
    video.src = source
    video.load()
  })
}
