export function paliroNativeService(name) {
  const bridge = globalThis.window?.PaliroNative
  if (bridge?.platform !== 'ios') return null
  return new Proxy({}, { get: (_, method) => {
    if (method === 'then') return undefined
    if (method === 'addListener') return (event, callback) => bridge.addListener(name, event, callback)
    return options => bridge.request(name, method, options)
  } })
}

export function paliroNativeFileSource(source) {
  return globalThis.window?.PaliroNative?.convertFileSrc(source) ?? source
}
