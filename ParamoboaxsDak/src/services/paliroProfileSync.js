const fields = ['nickname', 'avatar', 'birthday', 'bio', 'interests', 'mood', 'gender']

// Only changed, server-supported fields are sent. Local photo data and app preferences stay local.
export function paliroProfilePatch(profile, baseline) {
  return Object.fromEntries(fields.flatMap(key => {
    if (profile[key] === undefined) return []
    const value = ['nickname', 'bio'].includes(key) ? profile[key].trim() : profile[key]
    return JSON.stringify(value) === JSON.stringify(baseline?.[key]) ? [] : [[key, value]]
  }))
}

export function paliroMergeRemoteProfile(local, remote) {
  return { ...local, ...Object.fromEntries(fields.filter(key => remote[key] !== undefined).map(key => [key, remote[key]])) }
}
