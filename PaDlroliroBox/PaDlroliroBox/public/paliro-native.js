(() => {
  if (!window.webkit?.messageHandlers?.paliro || window.top !== window) return
  const pending = new Map(), listeners = new Map()
  const page = `${Date.now()}-${Math.random()}`
  let sequence = 0
  const request = (service, method, options = {}) => new Promise((resolve, reject) => {
    const id = `${page}-${++sequence}`
    pending.set(id, { resolve, reject })
    try { window.webkit.messageHandlers.paliro.postMessage({ id, service, method, options }) }
    catch (error) { pending.delete(id); reject(error) }
  })
  window.PaliroNative = Object.freeze({
    platform: 'ios',
    request,
    receive(message) {
      const callback = pending.get(message.id)
      if (!callback) return
      pending.delete(message.id)
      message.error ? callback.reject(Object.assign(new Error(message.error.message), { code: message.error.code })) : callback.resolve(message.value)
    },
    emit(service, event, value) {
      for (const listener of listeners.get(`${service}:${event}`) ?? []) {
        try { listener(value) } catch { /* One subscriber must not block the others. */ }
      }
    },
    async addListener(service, event, listener) {
      const key = `${service}:${event}`
      const group = listeners.get(key) ?? new Set()
      group.add(listener)
      listeners.set(key, group)
      try { await request(service, '__listen', { event }) }
      catch (error) { group.delete(listener); throw error }
      return { remove: async () => {
        group.delete(listener)
        if (!group.size) { listeners.delete(key); await request(service, '__unlisten', { event }) }
      } }
    },
    convertFileSrc(source) {
      if (typeof source !== 'string' || !source.startsWith('file://')) return source
      return `${location.protocol}//${location.host}/_paliro_file_${new URL(source).pathname}`
    },
  })
})()
