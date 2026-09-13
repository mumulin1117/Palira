import { ref } from 'vue'

export function usePaliroListRequest() {
  const ready = ref(false)
  const busy = ref(false)
  const failed = ref(false)
  let revision = 0
  let timer
  let finish

  function reset() {
    revision += 1
    clearTimeout(timer)
    finish?.()
    finish = null
    ready.value = false
    busy.value = false
    failed.value = false
  }

  async function run(commit) {
    if (busy.value) return false
    const requestRevision = ++revision
    busy.value = true
    failed.value = false
    await new Promise(resolve => {
      finish = resolve
      timer = setTimeout(resolve, 1000 + Math.floor(Math.random() * 1001))
    })
    if (requestRevision !== revision) return false
    finish = null
    try {
      await commit()
      if (requestRevision !== revision) return false
      ready.value = true
      return true
    } catch {
      if (requestRevision === revision) failed.value = true
      return false
    } finally {
      if (requestRevision === revision) busy.value = false
    }
  }

  return { ready, busy, failed, run, reset }
}
