export const paliroPrimaryTabs = [
  { route: 'home', label: 'home', icon: 'home' },
  { route: 'videos', label: 'video', icon: 'video' },
  { route: 'messages', label: 'message', icon: 'message' },
  { route: 'me', label: 'me', icon: 'profile' },
]

export function paliroRouteTransition(from, to) {
  const isPrimary = (route) => paliroPrimaryTabs.some((tab) => tab.route === route)
  const primary = from !== to && isPrimary(from) && isPrimary(to)
  return { primary, skipVideo: !primary && (from === 'videos' || to === 'videos') }
}
