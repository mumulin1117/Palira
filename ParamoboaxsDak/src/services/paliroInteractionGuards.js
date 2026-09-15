// Keep WebKit's native drag/selection UI out of app gestures, while allowing editing.
export function installPaliroInteractionGuards(root = document) {
  const isEditable = (event) => {
    const element = event.target?.nodeType === 3 ? event.target.parentElement : event.target
    return Boolean(element?.closest?.('input, textarea') || element?.isContentEditable)
  }
  const preventDrag = (event) => event.preventDefault()
  const preventOutsideEditor = (event) => {
    if (!isEditable(event)) event.preventDefault()
  }
  root.addEventListener('dragstart', preventDrag, true)
  root.addEventListener('selectstart', preventOutsideEditor, true)
  root.addEventListener('contextmenu', preventOutsideEditor, true)
  return () => {
    root.removeEventListener('dragstart', preventDrag, true)
    root.removeEventListener('selectstart', preventOutsideEditor, true)
    root.removeEventListener('contextmenu', preventOutsideEditor, true)
  }
}
