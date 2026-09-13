export const paliroPrimaryTabs = [
  { route: 'home', label: 'home', icon: 'home' },
  { route: 'videos', label: 'video', icon: 'video' },
  { route: 'messages', label: 'message', icon: 'message' },
  { route: 'me', label: 'me', icon: 'profile' },
]

export function paliroRouteTransition(from, to) {
  const isPrimary = (route) => paliroPrimaryTabs.some((tab) => tab.route === route)
  const primary = from !== to && isPrimary(from) && isPrimary(to)
  // Profile entrances share the standard motion; returning still reveals the retained player immediately.
  const opensProfile = to === 'friend-profile'
  return { primary, skipVideo: !primary && !opensProfile && (from === 'videos' || to === 'videos') }
}
