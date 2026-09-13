// Crops use normalized coordinates after rotation: [left, top, width, height].
// Frame choices were reviewed locally; demographic fields are not inferred from video.
const paliroSceneVideoOwners = new Set([
  'paliro-member-haneul',
  'paliro-member-minji',
  'paliro-member-seoyun',
  'paliro-member-nova',
])

export const paliroVideoIdentityFixtures = [
  { ownerID: 'paliro-member-haneul', language: 'ko', index: 1, seconds: 0.5, rotation: 0, avatarCrop: [0.1, 0.25, 0.78, 0.43875], heroCrop: [0.16, 0.25, 0.6, 0.421875], bio: '소박한 식사와 책, 하루의 작은 즐거움을 나누고 싶어요.', interests: ['Cooking', 'Reading'], title: '소박한 한 끼', caption: '여러 가지 반찬을 조금씩 담은 한 끼예요.' },
  { ownerID: 'paliro-member-minji', language: 'ko', index: 2, seconds: 3, rotation: 0, avatarCrop: [0.04, 0.25, 0.92, 0.5175], heroCrop: [0, 0.16, 1, 0.703125], bio: '바다가 보이는 여행지와 여유로운 시간을 좋아해요.', interests: ['Travel', 'Nature'], title: '창밖의 파란 바다', caption: '창가에 앉아 파란 바다를 바라보는 시간이에요.' },
  { ownerID: 'paliro-member-seoyun', language: 'ko', index: 3, seconds: 3, rotation: 0, avatarCrop: [0.1, 0.56, 0.75, 0.421875], heroCrop: [0.16, 0.56, 0.6, 0.421875], bio: '조용한 카페와 일상의 분위기를 사진으로 기록해요.', interests: ['Photography', 'Coffee'], title: '조용한 카페 한쪽', caption: '차분한 빛이 들어오는 카페의 한 장면을 담았어요.' },
  { ownerID: 'paliro-member-maya', language: 'en', index: 1, seconds: 1.5, rotation: -90, avatarCrop: [0.18, 0, 0.5, 0.888888889], heroCrop: [0.2, 0, 0.45, 1], bio: 'Sharing playful everyday moments, personal style, and quiet breaks outdoors.', interests: ['Fashion', 'Nature'], title: 'A playful pair of shades', caption: 'Sunglasses on, taking a little break from the day.' },
  { ownerID: 'paliro-member-luna', language: 'en', index: 2, seconds: 0.5, rotation: 0, avatarCrop: [0.2, 0.12, 0.65, 0.4875], heroCrop: [0.05, 0.04, 0.9, 0.84375], bio: 'Collecting sunny moments, outfit ideas, and places with a little greenery.', interests: ['Fashion', 'Nature', 'Travel'], title: 'Sunlight through the palms', caption: 'A bright moment beneath the palm leaves.' },
  { ownerID: 'paliro-member-nova', language: 'en', index: 3, seconds: 1.5, rotation: 0, avatarCrop: [0.08, 0, 0.84, 0.4725], heroCrop: [0.14, 0, 0.7, 0.4921875], bio: 'Keeping little visual notes of the sky, the sea, and changing light.', interests: ['Photography', 'Nature'], title: 'The sky before nightfall', caption: 'Clouds glow above the water as the evening settles in.' },
  { ownerID: 'paliro-member-iris', language: 'en', index: 4, seconds: 3, rotation: 0, avatarCrop: [0.18, 0.13, 0.76, 0.4275], heroCrop: [0, 0, 1, 0.703125], bio: 'Here for candid moments, easy conversation, and a little everyday humor.', interests: ['Movies', 'Nature'], title: 'A cheerful hello', caption: 'A candid little moment from a relaxed evening.' },
  { ownerID: 'paliro-member-ava', language: 'en', index: 5, seconds: 0.5, rotation: 0, avatarCrop: [0.29, 0.14, 0.69, 0.388125], heroCrop: [0, 0.08, 1, 0.703125], bio: 'Saving outfit details, casual clips, and small moments between plans.', interests: ['Fashion', 'Photography'], title: 'A moment between plans', caption: 'Keeping a casual little clip from the day.' },
  { ownerID: 'paliro-member-en-06', language: 'en', index: 6, seconds: 0.5, rotation: 0, avatarCrop: [0.08, 0.07, 0.76, 0.4275], heroCrop: [0.1, 0.01, 0.64, 0.45], bio: 'Enjoying expressive performances, favorite songs, and spontaneous moments.', interests: ['Music', 'Art'], title: 'A little performance', caption: 'An expressive moment with plenty of personality.' },
].map((fixture) => {
  const stem = `paliro-video-identity-${fixture.language}-${String(fixture.index).padStart(2, '0')}`
  return {
    ...fixture,
    avatarFromVideo: !paliroSceneVideoOwners.has(fixture.ownerID),
    source: `/assets/paliro-feed-${fixture.language}-${String(fixture.index).padStart(2, '0')}.mp4`,
    avatar: `/assets/${stem}-avatar.jpg`,
    profileBackground: `/assets/${stem}-hero.jpg`,
  }
})
