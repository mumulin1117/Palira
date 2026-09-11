const PALIRO_USERS_KEY = 'paliro.localUsers'
const PALIRO_SESSION_KEY = 'paliro.session'
const PALIRO_EULA_KEY = 'paliro.eulaAccepted'
const PALIRO_BOX_USAGE_KEY = 'paliro.boxUsage'
const PALIRO_OPENED_MATCHES_KEY = 'paliro.openedMatchMembers'
const PALIRO_BOX_RULES_KEY = 'paliro.boxRulesSeen'
const PALIRO_TEST_KEY = 'paliro.topicDiscoveryTest'
const PALIRO_IAP_TRANSACTIONS_KEY = 'paliro.iapTransactions'
const PALIRO_FRIEND_REQUESTS_KEY = 'paliro.friendRequests'
const PALIRO_INCOMING_FRIEND_REQUESTS_KEY = 'paliro.incomingFriendRequests'
const PALIRO_MESSAGES_KEY = 'paliro.conversations'
const PALIRO_PROFILE_META_KEY = 'paliro.profileMeta'
const PALIRO_SOCIAL_STATE_KEY = 'paliro.socialState'
const PALIRO_BLOCKED_USERS_KEY = 'paliro.blockedUsers'
const PALIRO_REPORTS_KEY = 'paliro.reports'
const PALIRO_VIDEO_STATE_KEY = 'paliro.videoState'
const PALIRO_LANGUAGE_KEY = 'paliro.languagePreference.v2'
const PALIRO_PUSH_PREFERENCE_KEY = 'paliro.pushPreference'

export const PALIRO_DAILY_BOX_LIMIT = 3
export const PALIRO_BOX_ACTION_COST = 200
// Local-only test switch. Set to false before a production release.
export const PALIRO_DEBUG_MODE = true
export const PALIRO_COIN_PACKS = [
  { productID: 'bbdiylyghcvmvmts', coins: 100, fallbackPrice: '$0.99' },
  { productID: 'iyksmadvinojrplp', coins: 200, fallbackPrice: '$1.99' },
  { productID: 'hkczppvsoegefpcg', coins: 600, fallbackPrice: '$4.99', bestValue: true },
  { productID: 'frpbjkpqdhvdzali', coins: 1500, fallbackPrice: '$9.99' },
  { productID: 'rebfnabjzseqvpgz', coins: 3500, fallbackPrice: '$19.99' },
  { productID: 'povdflzdkrvkiwdq', coins: 9500, fallbackPrice: '$49.99' },
  { productID: 'jxioxpaoekomsnqs', coins: 20050, fallbackPrice: '$99.99' },
]

function createPaliroMockMember({ id, userID, name, language, age, gender, mood, avatar, bio, interests, followerCount, followingCount, likes, videoIndexes, videoTitles }) {
  return {
    id,
    userID,
    name,
    language,
    age,
    gender,
    mood,
    avatar,
    bio,
    about: bio,
    interests,
    stats: { followers: followerCount, following: followingCount, likes },
    boxPosts: [{
      id: `${id}-box-1`,
      type: 'box',
      theme: language === 'ko' ? '공통 관심사' : 'Shared Interests',
      title: language === 'ko' ? '오늘의 관심사 상자' : 'A shared interest Box',
      description: bio,
      interests: interests.slice(0, 3),
      images: [`/assets/paliro-mock-${language}-video-${String(videoIndexes[0]).padStart(2, '0')}.png`],
      createdAt: '2026-09-08T12:00:00.000Z',
    }],
    videoPosts: videoIndexes.map((index, videoIndex) => ({
      id: `${id}-video-${videoIndex + 1}`,
      type: 'video',
      thumbnail: `/assets/paliro-mock-${language}-video-${String(index).padStart(2, '0')}.png`,
      source: `/assets/paliro-feed-${language}-${String(((index - 1) % 3) + 1).padStart(2, '0')}.mp4`,
      title: videoTitles[videoIndex],
      interests: interests.slice(0, 2),
      likes: Math.min(14, Math.max(1, likes - videoIndex * 2)),
      createdAt: `2026-09-${String(9 - videoIndex).padStart(2, '0')}T${String(10 + videoIndex).padStart(2, '0')}:30:00.000Z`,
    })),
  }
}

const PALIRO_MOCK_MEMBERS_BY_LANGUAGE = {
  ko: [
    createPaliroMockMember({ id: 'paliro-member-haneul', userID: 'PAL-KR-1001', name: '하늘_별빛', language: 'ko', age: 24, gender: 'Female', mood: 'Feeling Happy', avatar: '/assets/paliro-mock-ko-avatar-01.png', bio: '책과 음악, 그리고 오늘의 작은 발견을 좋아해요.', interests: ['Music', 'Reading', 'Coffee'], followerCount: 9, followingCount: 7, likes: 13, videoIndexes: [1, 2], videoTitles: ['오늘의 책상과 음악', '조용한 오후의 산책'] }),
    createPaliroMockMember({ id: 'paliro-member-minji', userID: 'PAL-KR-1002', name: '민지_코스모', language: 'ko', age: 26, gender: 'Female', mood: 'Want to Chat', avatar: '/assets/paliro-mock-ko-avatar-02.png', bio: '게임과 여행 이야기를 주제로 친근하게 소통해요.', interests: ['Gaming', 'Travel', 'Technology'], followerCount: 11, followingCount: 8, likes: 12, videoIndexes: [2, 3], videoTitles: ['레트로 게임 이야기', '주말 여행 메모'] }),
    createPaliroMockMember({ id: 'paliro-member-seoyun', userID: 'PAL-KR-1003', name: '서윤_파동', language: 'ko', age: 23, gender: 'Female', mood: 'A Little Shy', avatar: '/assets/paliro-mock-ko-avatar-03.png', bio: '사진과 자연을 기록하며 새로운 주제를 발견하고 있어요.', interests: ['Photography', 'Nature', 'Art'], followerCount: 8, followingCount: 6, likes: 10, videoIndexes: [3, 4], videoTitles: ['빛이 좋은 날', '작은 전시 기록'] }),
    createPaliroMockMember({ id: 'paliro-member-jia', userID: 'PAL-KR-1004', name: '지아_루프', language: 'ko', age: 28, gender: 'Other', mood: 'Feeling Chill', avatar: '/assets/paliro-mock-ko-avatar-04.png', bio: '차분한 대화와 영화, 요리 주제를 나누는 것을 좋아해요.', interests: ['Movies', 'Cooking', 'Coffee'], followerCount: 7, followingCount: 9, likes: 11, videoIndexes: [4, 5], videoTitles: ['영화 한 장면', '저녁 레시피 노트'] }),
    createPaliroMockMember({ id: 'paliro-member-soyeon', userID: 'PAL-KR-1005', name: '소연_플래닛', language: 'ko', age: 25, gender: 'Female', mood: 'Ready for Fun', avatar: '/assets/paliro-mock-ko-avatar-05.png', bio: '패션, 댄스, 그리고 가벼운 창작 아이디어를 모아요.', interests: ['Fashion', 'Dancing', 'Art'], followerCount: 12, followingCount: 10, likes: 14, videoIndexes: [5, 1], videoTitles: ['색으로 남긴 하루', '리듬과 아이디어'] }),
  ],
  en: [
    createPaliroMockMember({ id: 'paliro-member-maya', userID: 'PAL-EN-2001', name: 'Maya_Orion', language: 'en', age: 24, gender: 'Female', mood: 'Feeling Happy', avatar: '/assets/paliro-mock-en-avatar-01.png', bio: 'Collecting reading notes, playlists, and kind conversation prompts.', interests: ['Music', 'Reading', 'Coffee'], followerCount: 9, followingCount: 7, likes: 13, videoIndexes: [1, 2], videoTitles: ['Reading nook playlist', 'A calm coffee note'] }),
    createPaliroMockMember({ id: 'paliro-member-luna', userID: 'PAL-EN-2002', name: 'Luna_Star', language: 'en', age: 26, gender: 'Female', mood: 'Want to Chat', avatar: '/assets/paliro-mock-en-avatar-02.png', bio: 'Sharing playful game topics and short travel stories.', interests: ['Gaming', 'Travel', 'Technology'], followerCount: 11, followingCount: 8, likes: 12, videoIndexes: [2, 3], videoTitles: ['Retro arcade finds', 'Weekend map notes'] }),
    createPaliroMockMember({ id: 'paliro-member-nova', userID: 'PAL-EN-2003', name: 'Nova_Drift', language: 'en', age: 23, gender: 'Female', mood: 'A Little Shy', avatar: '/assets/paliro-mock-en-avatar-03.png', bio: 'Documenting quiet outdoor moments and small creative projects.', interests: ['Photography', 'Nature', 'Art'], followerCount: 8, followingCount: 6, likes: 10, videoIndexes: [3, 4], videoTitles: ['Light through the window', 'Small gallery day'] }),
    createPaliroMockMember({ id: 'paliro-member-iris', userID: 'PAL-EN-2004', name: 'Iris_Atlas', language: 'en', age: 28, gender: 'Other', mood: 'Feeling Chill', avatar: '/assets/paliro-mock-en-avatar-04.png', bio: 'Here for movies, cooking ideas, and thoughtful shared topics.', interests: ['Movies', 'Cooking', 'Coffee'], followerCount: 7, followingCount: 9, likes: 11, videoIndexes: [4, 5], videoTitles: ['A favorite film frame', 'Weeknight recipe notes'] }),
    createPaliroMockMember({ id: 'paliro-member-ava', userID: 'PAL-EN-2005', name: 'Ava_Nebula', language: 'en', age: 25, gender: 'Female', mood: 'Ready for Fun', avatar: '/assets/paliro-mock-en-avatar-05.png', bio: 'Gathering fashion references, dance clips, and creative sparks.', interests: ['Fashion', 'Dancing', 'Art'], followerCount: 12, followingCount: 10, likes: 14, videoIndexes: [5, 1], videoTitles: ['Color study of the day', 'Rhythm and ideas'] }),
  ],
}

function createPaliroVideoFixture({ id, member, source, caption, title, likes, comments }) {
  return {
    id,
    member: clonePaliroMember(member),
    source,
    caption,
    title,
    baseLikes: likes,
    baseComments: comments,
    createdAt: '2026-09-10T10:00:00.000Z',
  }
}

const PALIRO_VIDEO_FIXTURES_BY_LANGUAGE = {
  ko: [
    createPaliroVideoFixture({ id: 'paliro-feed-ko-01', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[0], source: '/assets/paliro-feed-ko-01.mp4', title: '오늘의 작은 발견', caption: '책과 음악 사이에서 만난 조용한 영감이에요.', likes: 13, comments: [{ id: 'paliro-comment-ko-01', authorName: '민지_코스모', authorAvatar: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[1].avatar, body: '분위기가 정말 좋아요.', baseLikes: 14, createdAt: '2026-09-10T09:20:00.000Z' }] }),
    createPaliroVideoFixture({ id: 'paliro-feed-ko-02', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[1], source: '/assets/paliro-feed-ko-02.mp4', title: '함께 듣는 리듬', caption: '오늘의 플레이리스트에서 가장 마음에 든 한 곡을 나눠요.', likes: 12, comments: [{ id: 'paliro-comment-ko-02', authorName: '하늘_별빛', authorAvatar: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[0].avatar, body: '다음 곡도 궁금해요.', baseLikes: 9, createdAt: '2026-09-10T09:05:00.000Z' }] }),
    createPaliroVideoFixture({ id: 'paliro-feed-ko-03', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[2], source: '/assets/paliro-feed-ko-03.mp4', title: '빛이 머문 순간', caption: '사진과 자연에서 찾은 오늘의 색을 기록했어요.', likes: 10, comments: [{ id: 'paliro-comment-ko-03', authorName: '서윤_파동', authorAvatar: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[2].avatar, body: '이 장면의 빛이 인상적이에요.', baseLikes: 11, createdAt: '2026-09-10T08:44:00.000Z' }] }),
  ],
  en: [
    createPaliroVideoFixture({ id: 'paliro-feed-en-01', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[0], source: '/assets/paliro-feed-en-01.mp4', title: 'A bright little note', caption: 'A small moment from a day of reading, music, and shared curiosity.', likes: 13, comments: [{ id: 'paliro-comment-en-01', authorName: 'Luna_Star', authorAvatar: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[1].avatar, body: 'This has such a thoughtful mood.', baseLikes: 14, createdAt: '2026-09-10T09:20:00.000Z' }] }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-02', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[1], source: '/assets/paliro-feed-en-02.mp4', title: 'A song worth sharing', caption: 'One sound from today that feels right for a calm topic Box.', likes: 12, comments: [{ id: 'paliro-comment-en-02', authorName: 'Maya_Orion', authorAvatar: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[0].avatar, body: 'Adding this to my playlist.', baseLikes: 9, createdAt: '2026-09-10T09:05:00.000Z' }] }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-03', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[2], source: '/assets/paliro-feed-en-03.mp4', title: 'A new perspective', caption: 'A short visual note from an outdoor walk and a creative afternoon.', likes: 10, comments: [{ id: 'paliro-comment-en-03', authorName: 'Nova_Drift', authorAvatar: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[2].avatar, body: 'The light here is beautiful.', baseLikes: 11, createdAt: '2026-09-10T08:44:00.000Z' }] }),
  ],
}

export const PALIRO_MATCHED_FRIEND = {
  ...PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[3],
  nickname: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[3].name,
}

const PALIRO_TEST_MUTUAL_FRIENDS = PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko.slice(0, 3)

const PALIRO_TEST_ACCOUNT_SOCIAL_STATE = {
  followers: PALIRO_TEST_MUTUAL_FRIENDS,
  following: PALIRO_TEST_MUTUAL_FRIENDS,
  posts: [
    { id: 'paliro-demo-box-quiet-moments', theme: 'Quiet Moments', title: 'A small Box for slow weekend ideas', description: 'A Box shaped around music, travel, and an easy conversation prompt.', interests: ['Music', 'Travel'], createdAt: '2026-09-08T09:30:00.000Z' },
    { id: 'paliro-demo-box-creative-sparks', theme: 'Creative Sparks', title: 'Books, sketches, and shared curiosity', description: 'A Box for discovering thoughtful hobbies through shared topics.', interests: ['Reading', 'Art'], createdAt: '2026-09-05T14:15:00.000Z' },
  ],
}

const PALIRO_MOCK_PROFILE_FIXTURE_VERSION = 4
const PALIRO_LEGACY_MOCK_MEMBER_IDS = new Set([
  'paliro-member-luna-star',
  'paliro-member-nebula',
  'paliro-member-nova-drift',
  ...Object.values(PALIRO_MOCK_MEMBERS_BY_LANGUAGE).flat().map((member) => member.id),
])

export function paliroGetMockMembers(language = 'ko') {
  const members = PALIRO_MOCK_MEMBERS_BY_LANGUAGE[language] ?? PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko
  return members.map(clonePaliroMember)
}

const PALIRO_TEST_INCOMING_REQUESTS = [
  { id: 'paliro-request-jia-loop', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[3], message: '영화와 요리 주제가 좋아 보여서 친구 요청을 보냈어요.', requestedAt: '2026-09-10T08:15:00.000Z', status: 'pending' },
  { id: 'paliro-request-soyeon-planet', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[4], message: '창작 아이디어를 함께 나누고 싶어요.', requestedAt: '2026-09-10T07:35:00.000Z', status: 'pending' },
]

const PALIRO_TEST_CONVERSATIONS = [
  { member: PALIRO_TEST_MUTUAL_FRIENDS[0], unreadCount: 2, messages: [{ id: 'paliro-message-haneul-1', sender: 'friend', body: '오늘의 음악 상자에 어울리는 곡을 하나 남겼어요.', sentAt: '2026-09-10T11:24:00.000Z' }] },
  { member: PALIRO_TEST_MUTUAL_FRIENDS[1], unreadCount: 0, messages: [{ id: 'paliro-message-minji-1', sender: 'friend', body: '다음 주제 상자에 레트로 게임 이야기를 넣어 볼까요?', sentAt: '2026-09-10T10:15:00.000Z' }] },
  { member: PALIRO_TEST_MUTUAL_FRIENDS[2], unreadCount: 0, messages: [{ id: 'paliro-message-seoyun-1', sender: 'friend', body: '자연 사진으로 만든 작은 영상 기록을 공유했어요.', sentAt: '2026-01-28T17:40:00.000Z' }] },
]
const PALIRO_DEBUG_LOGIN_COIN_BALANCE = 1000
const PALIRO_DEMO_COIN_BALANCE = PALIRO_DEBUG_MODE ? PALIRO_DEBUG_LOGIN_COIN_BALANCE : 600

const testUser = {
  id: 'paliro-test-user',
  email: 'paliro@gmail.com',
  password: '678678',
  profile: {
    avatar: 'violet',
    nickname: 'Cosmic Explorer',
    mood: 'Ready for Fun',
    bio: 'Opening a new box and seeing where it leads.',
    gender: 'Other',
    birthday: '1998-10-24',
    interests: ['Music', 'Travel', 'Gaming'],
  },
}

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function getLocalDayKey() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

function getBoxUsageByUser(userID) {
  const usageByUser = readJson(PALIRO_BOX_USAGE_KEY, {})
  const today = getLocalDayKey()
  const stored = usageByUser[userID]

  if (stored?.day === today) {
    return { usageByUser, state: stored }
  }

  const state = {
    day: today,
    freeActionsUsed: 0,
    bonusActions: stored?.bonusActions ?? 0,
    videoRewardDay: '',
    videoBonusActions: 0,
    coins: stored?.coins ?? PALIRO_DEMO_COIN_BALANCE,
  }
  usageByUser[userID] = state
  writeJson(PALIRO_BOX_USAGE_KEY, usageByUser)
  return { usageByUser, state }
}

function saveBoxUsage(userID, usageByUser, state) {
  usageByUser[userID] = state
  writeJson(PALIRO_BOX_USAGE_KEY, usageByUser)
  return state
}

function ensureDebugLoginBalance(userID) {
  if (!PALIRO_DEBUG_MODE || !userID) return

  const { usageByUser, state } = getBoxUsageByUser(userID)
  if (state.coins >= PALIRO_DEBUG_LOGIN_COIN_BALANCE) return

  saveBoxUsage(userID, usageByUser, {
    ...state,
    coins: PALIRO_DEBUG_LOGIN_COIN_BALANCE,
  })
}

export function paliroSeedUsers() {
  const users = readJson(PALIRO_USERS_KEY, [])
  const existingTestUser = users.find((user) => user.email === testUser.email)
  if (existingTestUser) {
    const profile = existingTestUser.profile
    if (profile && (!profile.nickname || profile.avatar === 'cosmic')) {
      existingTestUser.profile = {
        ...profile,
        nickname: profile.nickname || testUser.profile.nickname,
        avatar: profile.avatar === 'cosmic' ? testUser.profile.avatar : profile.avatar,
      }
      writeJson(PALIRO_USERS_KEY, users)
    }
    return users
  }
  const nextUsers = [...users, testUser]
  writeJson(PALIRO_USERS_KEY, nextUsers)
  return nextUsers
}

export function paliroGetEulaAccepted() {
  return window.localStorage.getItem(PALIRO_EULA_KEY) === 'true'
}

export function paliroSetEulaAccepted(accepted) {
  window.localStorage.setItem(PALIRO_EULA_KEY, String(accepted))
}

export function paliroGetSession() {
  const savedSession = readJson(PALIRO_SESSION_KEY, null)
  if (!savedSession?.userID) return null

  // Rebuild the session from the saved account so profile changes survive every launch.
  const user = paliroSeedUsers().find((item) => item.id === savedSession.userID)
  if (!user?.profile) {
    paliroSignOut()
    return null
  }
  ensureDebugLoginBalance(user.id)
  return createSession(user)
}

export function paliroSignOut() {
  window.localStorage.removeItem(PALIRO_SESSION_KEY)
}

function createSession(user) {
  const session = {
    userID: user.id,
    Token: `paliro-local-${user.id}`,
    email: user.email,
    profile: user.profile,
  }
  writeJson(PALIRO_SESSION_KEY, session)
  return session
}

function isAdultBirthday(birthday) {
  if (!birthday) return false
  const [year, month, day] = birthday.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)
    || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false
  }

  const today = new Date()
  let age = today.getFullYear() - year
  const hasHadBirthdayThisYear = today.getMonth() > month - 1
    || (today.getMonth() === month - 1 && today.getDate() >= day)
  if (!hasHadBirthdayThisYear) age -= 1
  return age >= 18
}

export function paliroLogin(email, password) {
  const users = paliroSeedUsers()
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (!user) return { type: 'new-user' }
  if (user.password !== password) return { type: 'invalid-password' }
  if (!user.profile) return { type: 'profile-incomplete', user }
  if (!isAdultBirthday(user.profile.birthday)) return { type: 'age-restricted' }
  ensureDebugLoginBalance(user.id)
  return { type: 'success', session: createSession(user) }
}

export function paliroCreateUser(email, password) {
  const users = paliroSeedUsers()
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return { type: 'existing-user' }
  }

  const user = {
    id: `paliro-${crypto.randomUUID()}`,
    email,
    password,
    profile: null,
  }
  writeJson(PALIRO_USERS_KEY, [...users, user])
  return { type: 'success', user }
}

export function paliroCompleteProfile(userId, profile) {
  const users = paliroSeedUsers()
  const user = users.find((item) => item.id === userId)
  if (!user) return null
  user.profile = profile
  writeJson(PALIRO_USERS_KEY, users)
  ensureDebugLoginBalance(user.id)
  return createSession(user)
}

export function paliroUpdateProfile(userId, profile) {
  const users = paliroSeedUsers()
  const user = users.find((item) => item.id === userId)
  if (!user) return null

  user.profile = profile
  writeJson(PALIRO_USERS_KEY, users)
  return createSession(user)
}

export function paliroGetProfileMeta(userID) {
  if (!userID) return null
  const metaByUser = readJson(PALIRO_PROFILE_META_KEY, {})
  if (metaByUser[userID]) return metaByUser[userID]

  const state = {
    followers: 128,
    following: 86,
    posts: 12,
  }
  metaByUser[userID] = state
  writeJson(PALIRO_PROFILE_META_KEY, metaByUser)
  return state
}

function createInitialSocialState(userID) {
  const source = userID === testUser.id
    ? PALIRO_TEST_ACCOUNT_SOCIAL_STATE
    : { followers: [], following: [], posts: [] }

  return {
    followers: source.followers.map((member) => ({ ...member, interests: [...member.interests] })),
    following: source.following.map((member) => ({ ...member, interests: [...member.interests] })),
    posts: source.posts.map((post) => ({ ...post, interests: [...post.interests] })),
  }
}

function clonePaliroMember(member) {
  return {
    ...member,
    interests: [...(member.interests ?? [])],
    stats: { ...(member.stats ?? {}) },
    boxPosts: (member.boxPosts ?? []).map((post) => ({ ...post, interests: [...(post.interests ?? [])], images: [...(post.images ?? [])] })),
    videoPosts: (member.videoPosts ?? []).map((video) => ({ ...video, interests: [...(video.interests ?? [])] })),
  }
}

function clonePaliroConversation(conversation) {
  return {
    ...conversation,
    member: clonePaliroMember(conversation.member),
    messages: (conversation.messages ?? []).map((message) => ({ ...message })),
  }
}

function ensureTestAccountRelationships(userID, socialByUser, state) {
  if (userID !== testUser.id || state.mockProfileFixtureVersion === PALIRO_MOCK_PROFILE_FIXTURE_VERSION) return state
  const preserveMember = (member) => !PALIRO_LEGACY_MOCK_MEMBER_IDS.has(member.id)
  const existingFollowers = (state.followers ?? []).filter(preserveMember)
  const existingFollowing = (state.following ?? []).filter(preserveMember)
  const nextState = {
    ...state,
    // Replace only prior fixture contacts. Locally accepted or created members stay intact.
    followers: [...PALIRO_TEST_MUTUAL_FRIENDS.map(clonePaliroMember), ...existingFollowers],
    following: [...PALIRO_TEST_MUTUAL_FRIENDS.map(clonePaliroMember), ...existingFollowing],
    testMutualFriendSeeded: true,
    mockProfileFixtureVersion: PALIRO_MOCK_PROFILE_FIXTURE_VERSION,
  }
  socialByUser[userID] = nextState
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return nextState
}

function getSocialStateByUser(userID) {
  const socialByUser = readJson(PALIRO_SOCIAL_STATE_KEY, {})
  const savedState = socialByUser[userID]
  if (savedState) {
    const state = ensureTestAccountRelationships(userID, socialByUser, {
      followers: Array.isArray(savedState.followers) ? savedState.followers : [],
      following: Array.isArray(savedState.following) ? savedState.following : [],
      posts: Array.isArray(savedState.posts) ? savedState.posts : [],
      testMutualFriendSeeded: savedState.testMutualFriendSeeded === true,
      mockProfileFixtureVersion: Number(savedState.mockProfileFixtureVersion) || 0,
    })
    return {
      socialByUser,
      state,
    }
  }

  const state = ensureTestAccountRelationships(userID, socialByUser, {
    ...createInitialSocialState(userID),
    testMutualFriendSeeded: false,
    mockProfileFixtureVersion: 0,
  })
  if (!socialByUser[userID]) {
    socialByUser[userID] = state
    writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  }
  return { socialByUser, state }
}

export function paliroGetSocialState(userID) {
  if (!userID) return { followers: [], following: [], posts: [] }
  const { state } = getSocialStateByUser(userID)
  return {
    followers: state.followers.map((member) => ({ ...member, interests: [...(member.interests ?? [])] })),
    following: state.following.map((member) => ({ ...member, interests: [...(member.interests ?? [])] })),
    posts: state.posts.map((post) => ({ ...post, interests: [...(post.interests ?? [])], images: [...(post.images ?? [])] })),
  }
}

export function paliroGetMemberPosts(member) {
  if (!member) return []
  const boxPosts = (member.boxPosts ?? []).map((post) => ({
    ...post,
    contentType: 'box',
    thumbnail: post.images?.[0] || post.thumbnail || '/assets/paliro-make-box-flight@2x.png',
    interests: [...(post.interests ?? [])],
  }))
  const videoPosts = (member.videoPosts ?? []).map((video) => ({
    ...video,
    contentType: 'video',
    thumbnail: video.thumbnail || '/assets/paliro-make-box-flight@2x.png',
    interests: [...(video.interests ?? [])],
  }))
  return [...boxPosts, ...videoPosts].sort((left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? '')))
}

export function paliroGetSocialSummary(userID) {
  const state = paliroGetSocialState(userID)
  return { followers: state.followers.length, following: state.following.length, posts: state.posts.length + paliroGetPublishedVideos(userID).length }
}

export function paliroCreateBoxPost(userID, post) {
  if (!userID) return null
  const { socialByUser, state } = getSocialStateByUser(userID)
  const nextPost = {
    id: `paliro-box-${crypto.randomUUID()}`,
    theme: String(post?.theme ?? 'Shared Interests').slice(0, 48),
    title: String(post?.title ?? 'A new topic Box').slice(0, 80),
    description: String(post?.description ?? '').slice(0, 150),
    interests: Array.isArray(post?.interests) ? post.interests.slice(0, 3) : [],
    images: Array.isArray(post?.images)
      ? post.images.filter((image) => typeof image === 'string' && image.startsWith('data:image/') && image.length <= 1_200_000).slice(0, 3)
      : [],
    createdAt: new Date().toISOString(),
  }
  const nextState = { ...state, posts: [nextPost, ...state.posts].slice(0, 30) }
  socialByUser[userID] = nextState
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return nextPost
}

export function paliroDeleteBoxPost(userID, postID) {
  if (!userID || !postID) return { type: 'invalid-post' }
  const { socialByUser, state } = getSocialStateByUser(userID)
  if (!state.posts.some((post) => post.id === postID)) return { type: 'not-found' }
  socialByUser[userID] = { ...state, posts: state.posts.filter((post) => post.id !== postID) }
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return { type: 'success', state: paliroGetSocialState(userID) }
}

export function paliroFollowMember(userID, member) {
  if (!userID || !member?.id) return { type: 'invalid-member' }
  const { socialByUser, state } = getSocialStateByUser(userID)
  const isFollowing = state.following.some((item) => item.id === member.id)
  const nextState = isFollowing
    ? state
    : { ...state, following: [...state.following, clonePaliroMember(member)] }

  socialByUser[userID] = nextState
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return { type: 'success', state: paliroGetSocialState(userID) }
}

export function paliroToggleFollowMember(userID, member) {
  if (!userID || !member?.id) return { type: 'invalid-member' }
  const { socialByUser, state } = getSocialStateByUser(userID)
  const isFollowing = state.following.some((item) => item.id === member.id)
  const nextState = isFollowing
    ? { ...state, following: state.following.filter((item) => item.id !== member.id) }
    : { ...state, following: [...state.following, clonePaliroMember(member)] }

  socialByUser[userID] = nextState
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return { type: 'success', following: !isFollowing, state: paliroGetSocialState(userID) }
}

function clonePaliroVideo(video) {
  return {
    ...video,
    member: video.member ? clonePaliroMember(video.member) : null,
    comments: (video.comments ?? []).map((comment) => ({ ...comment })),
  }
}

function getVideoStateByUser(userID) {
  const videoStateByUser = readJson(PALIRO_VIDEO_STATE_KEY, {})
  const savedState = videoStateByUser[userID]
  const state = {
    interactions: savedState?.interactions && typeof savedState.interactions === 'object' ? savedState.interactions : {},
    hiddenVideoIDs: Array.isArray(savedState?.hiddenVideoIDs) ? savedState.hiddenVideoIDs : [],
    published: Array.isArray(savedState?.published) ? savedState.published : [],
  }
  return { videoStateByUser, state }
}

function saveVideoState(userID, videoStateByUser, state) {
  videoStateByUser[userID] = state
  writeJson(PALIRO_VIDEO_STATE_KEY, videoStateByUser)
}

function commentWithInteraction(comment, interaction) {
  const liked = interaction?.commentLikes?.[comment.id] === true
  return {
    ...comment,
    liked,
    likes: Math.max(0, Number(comment.baseLikes ?? comment.likes ?? 0) + (liked ? 1 : 0)),
  }
}

function videoWithInteraction(video, interaction) {
  const liked = interaction?.liked === true
  return {
    ...video,
    liked,
    likes: Math.max(0, Number(video.baseLikes ?? video.likes ?? 0) + (liked ? 1 : 0)),
    comments: [...(video.baseComments ?? []), ...(interaction?.comments ?? [])].map((comment) => commentWithInteraction(comment, interaction)),
  }
}

export function paliroGetVideoFeed(userID, language = 'ko') {
  if (!userID) return []
  const { state } = getVideoStateByUser(userID)
  const blockedIDs = new Set(paliroGetBlockedUsers(userID).map((member) => member.id))
  const hiddenIDs = new Set(state.hiddenVideoIDs)
  const fixtures = PALIRO_VIDEO_FIXTURES_BY_LANGUAGE[language] ?? PALIRO_VIDEO_FIXTURES_BY_LANGUAGE.ko
  const published = state.published.filter((video) => video.language === language)
  return [...published, ...fixtures]
    .filter((video) => !hiddenIDs.has(video.id) && !blockedIDs.has(video.member?.id))
    .map((video) => clonePaliroVideo(videoWithInteraction(video, state.interactions[video.id])))
}

export function paliroGetPublishedVideos(userID) {
  if (!userID) return []
  const { state } = getVideoStateByUser(userID)
  return state.published.map((video) => clonePaliroVideo(videoWithInteraction(video, state.interactions[video.id])))
}

export function paliroDeletePublishedVideo(userID, videoID) {
  if (!userID || !videoID) return { type: 'invalid-video' }
  const { videoStateByUser, state } = getVideoStateByUser(userID)
  if (!state.published.some((video) => video.id === videoID)) return { type: 'not-found' }
  saveVideoState(userID, videoStateByUser, { ...state, published: state.published.filter((video) => video.id !== videoID) })
  return { type: 'success' }
}

export function paliroToggleVideoLike(userID, videoID) {
  if (!userID || !videoID) return { type: 'invalid-video' }
  const { videoStateByUser, state } = getVideoStateByUser(userID)
  const interaction = state.interactions[videoID] ?? {}
  const nextInteraction = { ...interaction, liked: interaction.liked !== true }
  const nextState = { ...state, interactions: { ...state.interactions, [videoID]: nextInteraction } }
  saveVideoState(userID, videoStateByUser, nextState)
  return { type: 'success', liked: nextInteraction.liked }
}

export function paliroToggleVideoCommentLike(userID, videoID, commentID) {
  if (!userID || !videoID || !commentID) return { type: 'invalid-comment' }
  const { videoStateByUser, state } = getVideoStateByUser(userID)
  const interaction = state.interactions[videoID] ?? {}
  const commentLikes = { ...(interaction.commentLikes ?? {}) }
  commentLikes[commentID] = commentLikes[commentID] !== true
  const nextInteraction = { ...interaction, commentLikes }
  const nextState = { ...state, interactions: { ...state.interactions, [videoID]: nextInteraction } }
  saveVideoState(userID, videoStateByUser, nextState)
  return { type: 'success', liked: commentLikes[commentID] }
}

export function paliroAddVideoComment(userID, videoID, body) {
  const text = String(body ?? '').trim().slice(0, 180)
  if (!userID || !videoID || !text) return { type: 'invalid-comment' }
  const author = paliroSeedUsers().find((user) => user.id === userID)?.profile
  if (!author) return { type: 'invalid-user' }
  const { videoStateByUser, state } = getVideoStateByUser(userID)
  const interaction = state.interactions[videoID] ?? {}
  const comment = {
    id: `paliro-video-comment-${crypto.randomUUID()}`,
    authorName: author.nickname || 'Paliro member',
    authorAvatar: author.photoDataUrl || '',
    body: text,
    createdAt: new Date().toISOString(),
  }
  const nextInteraction = { ...interaction, comments: [...(interaction.comments ?? []), comment].slice(-80) }
  const nextState = { ...state, interactions: { ...state.interactions, [videoID]: nextInteraction } }
  saveVideoState(userID, videoStateByUser, nextState)
  return { type: 'success', comment }
}

export function paliroHideVideo(userID, videoID) {
  if (!userID || !videoID) return []
  const { videoStateByUser, state } = getVideoStateByUser(userID)
  const hiddenVideoIDs = [...new Set([...state.hiddenVideoIDs, videoID])]
  saveVideoState(userID, videoStateByUser, { ...state, hiddenVideoIDs })
  return hiddenVideoIDs
}

export function paliroCreateVideoPost(userID, video) {
  const source = String(video?.source ?? '')
  const caption = String(video?.caption ?? '').trim().slice(0, 180)
  if (!userID || !source || !caption) return null
  const profile = paliroSeedUsers().find((user) => user.id === userID)?.profile
  if (!profile) return null

  const { videoStateByUser, state } = getVideoStateByUser(userID)
  const post = {
    id: `paliro-video-${crypto.randomUUID()}`,
    member: {
      id: `paliro-self-${userID}`,
      userID,
      name: profile.nickname || 'Paliro member',
      nickname: profile.nickname || 'Paliro member',
      avatar: profile.photoDataUrl || profile.avatar || '',
      language: video.language === 'en' ? 'en' : 'ko',
      age: 18,
      gender: profile.gender ?? 'Other',
      mood: profile.mood ?? 'Feeling Happy',
      bio: profile.bio ?? '',
      about: profile.bio ?? '',
      interests: [...(profile.interests ?? [])],
      stats: {},
      videoPosts: [],
    },
    source,
    title: String(video?.title ?? '').trim().slice(0, 64) || caption.slice(0, 64),
    caption,
    baseLikes: 0,
    baseComments: [],
    language: video.language === 'en' ? 'en' : 'ko',
    createdAt: new Date().toISOString(),
  }
  saveVideoState(userID, videoStateByUser, { ...state, published: [post, ...state.published].slice(0, 20) })
  return clonePaliroVideo(post)
}

export function paliroGetBlockedUsers(userID) {
  if (!userID) return []
  return readJson(PALIRO_BLOCKED_USERS_KEY, {})[userID] ?? []
}

export function paliroGetAvailableMatchMembers(userID, language = 'ko') {
  if (!userID) return []
  const blockedIDs = new Set(paliroGetBlockedUsers(userID).map((member) => member.id))
  const openedMemberIDs = new Set(readJson(PALIRO_OPENED_MATCHES_KEY, {})[userID] ?? [])
  const members = PALIRO_MOCK_MEMBERS_BY_LANGUAGE[language] ?? PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko
  return members.filter((member) => !blockedIDs.has(member.id) && !openedMemberIDs.has(member.id)).map(clonePaliroMember)
}

export function paliroRecordOpenedMatchMember(userID, memberID) {
  if (!userID || !memberID) return []
  const openedByUser = readJson(PALIRO_OPENED_MATCHES_KEY, {})
  const openedMemberIDs = Array.isArray(openedByUser[userID]) ? openedByUser[userID] : []
  openedByUser[userID] = [...new Set([...openedMemberIDs, memberID])]
  writeJson(PALIRO_OPENED_MATCHES_KEY, openedByUser)
  return openedByUser[userID]
}

export function paliroReportMember(userID, member, reason, details = '') {
  const memberID = String(member?.id ?? '')
  const reportReason = String(reason ?? '').trim().slice(0, 80)
  if (!userID || !memberID || !reportReason) return { type: 'invalid-report', blockedUsers: paliroGetBlockedUsers(userID) }

  const reportedAt = new Date().toISOString()
  const memberSnapshot = {
    id: memberID,
    userID: String(member?.userID ?? ''),
    name: String(member?.nickname ?? member?.name ?? '').slice(0, 64),
    avatar: String(member?.avatar ?? ''),
    reportedAt,
  }

  const reportsByUser = readJson(PALIRO_REPORTS_KEY, {})
  const previousReports = Array.isArray(reportsByUser[userID]) ? reportsByUser[userID] : []
  reportsByUser[userID] = [{
    memberID,
    reason: reportReason,
    details: String(details ?? '').trim().slice(0, 280),
    reportedAt,
  }, ...previousReports.filter((report) => report.memberID !== memberID)].slice(0, 50)
  writeJson(PALIRO_REPORTS_KEY, reportsByUser)

  const blockedByUser = readJson(PALIRO_BLOCKED_USERS_KEY, {})
  const previousBlocked = Array.isArray(blockedByUser[userID]) ? blockedByUser[userID] : []
  const nextBlockedUsers = [memberSnapshot, ...previousBlocked.filter((item) => item.id !== memberID)]
  blockedByUser[userID] = nextBlockedUsers
  writeJson(PALIRO_BLOCKED_USERS_KEY, blockedByUser)

  const requestsByUser = readJson(PALIRO_FRIEND_REQUESTS_KEY, {})
  if (requestsByUser[userID]?.[memberID]) {
    const { [memberID]: _removedRequest, ...remainingRequests } = requestsByUser[userID]
    requestsByUser[userID] = remainingRequests
    writeJson(PALIRO_FRIEND_REQUESTS_KEY, requestsByUser)
  }

  const incomingState = getIncomingFriendRequestsByUser(userID)
  incomingState.requestsByUser[userID] = incomingState.requests.filter((request) => request.member?.id !== memberID)
  writeJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, incomingState.requestsByUser)

  const conversationState = getConversationStateByUser(userID)
  conversationState.conversationsByUser[userID] = conversationState.conversations.filter((conversation) => conversation.member?.id !== memberID)
  writeJson(PALIRO_MESSAGES_KEY, conversationState.conversationsByUser)

  const { socialByUser, state } = getSocialStateByUser(userID)
  socialByUser[userID] = {
    ...state,
    followers: state.followers.filter((item) => item.id !== memberID),
    following: state.following.filter((item) => item.id !== memberID),
  }
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)

  return { type: 'success', blockedUsers: nextBlockedUsers }
}

export function paliroBlockMember(userID, member) {
  const memberID = String(member?.id ?? '')
  if (!userID || !memberID) return { type: 'invalid-member', blockedUsers: paliroGetBlockedUsers(userID) }

  const memberSnapshot = {
    id: memberID,
    userID: String(member?.userID ?? ''),
    name: String(member?.nickname ?? member?.name ?? '').slice(0, 64),
    avatar: String(member?.avatar ?? ''),
    blockedAt: new Date().toISOString(),
  }
  const blockedByUser = readJson(PALIRO_BLOCKED_USERS_KEY, {})
  const nextBlockedUsers = [memberSnapshot, ...(blockedByUser[userID] ?? []).filter((item) => item.id !== memberID)]
  blockedByUser[userID] = nextBlockedUsers
  writeJson(PALIRO_BLOCKED_USERS_KEY, blockedByUser)

  const requestsByUser = readJson(PALIRO_FRIEND_REQUESTS_KEY, {})
  if (requestsByUser[userID]?.[memberID]) {
    const { [memberID]: _removedRequest, ...remainingRequests } = requestsByUser[userID]
    requestsByUser[userID] = remainingRequests
    writeJson(PALIRO_FRIEND_REQUESTS_KEY, requestsByUser)
  }

  const incomingState = getIncomingFriendRequestsByUser(userID)
  incomingState.requestsByUser[userID] = incomingState.requests.filter((request) => request.member?.id !== memberID)
  writeJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, incomingState.requestsByUser)

  const conversationState = getConversationStateByUser(userID)
  conversationState.conversationsByUser[userID] = conversationState.conversations.filter((conversation) => conversation.member?.id !== memberID)
  writeJson(PALIRO_MESSAGES_KEY, conversationState.conversationsByUser)

  const { socialByUser, state } = getSocialStateByUser(userID)
  socialByUser[userID] = {
    ...state,
    followers: state.followers.filter((item) => item.id !== memberID),
    following: state.following.filter((item) => item.id !== memberID),
  }
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return { type: 'success', blockedUsers: nextBlockedUsers }
}

export function paliroUnblockUser(userID, blockedUserID) {
  if (!userID || !blockedUserID) return []
  const blockedByUser = readJson(PALIRO_BLOCKED_USERS_KEY, {})
  const nextBlockedUsers = (blockedByUser[userID] ?? []).filter((item) => item.id !== blockedUserID)
  blockedByUser[userID] = nextBlockedUsers
  writeJson(PALIRO_BLOCKED_USERS_KEY, blockedByUser)
  return nextBlockedUsers
}

export function paliroGetLanguagePreference(userID) {
  if (!userID) return 'ko'
  return readJson(PALIRO_LANGUAGE_KEY, {})[userID] ?? 'ko'
}

export function paliroSetLanguagePreference(userID, language) {
  if (!userID || !['en', 'ko'].includes(language)) return 'ko'
  const languageByUser = readJson(PALIRO_LANGUAGE_KEY, {})
  languageByUser[userID] = language
  writeJson(PALIRO_LANGUAGE_KEY, languageByUser)
  return language
}

export function paliroGetPushPreference(userID) {
  if (!userID) return true
  const preferenceByUser = readJson(PALIRO_PUSH_PREFERENCE_KEY, {})
  return preferenceByUser[userID] !== false
}

export function paliroSetPushPreference(userID, enabled) {
  if (!userID) return true
  const preferenceByUser = readJson(PALIRO_PUSH_PREFERENCE_KEY, {})
  preferenceByUser[userID] = Boolean(enabled)
  writeJson(PALIRO_PUSH_PREFERENCE_KEY, preferenceByUser)
  return preferenceByUser[userID]
}

export function paliroGetBoxState(userID) {
  if (!userID) return null
  return getBoxUsageByUser(userID).state
}

export function paliroHasSeenBoxRules(userID) {
  if (!userID) return true
  return readJson(PALIRO_BOX_RULES_KEY, {})[userID] === true
}

export function paliroSetBoxRulesSeen(userID) {
  if (!userID) return
  const seenByUser = readJson(PALIRO_BOX_RULES_KEY, {})
  seenByUser[userID] = true
  writeJson(PALIRO_BOX_RULES_KEY, seenByUser)
}

export function paliroUseFreeBoxAction(userID) {
  if (!userID) return { type: 'no-session' }
  const { usageByUser, state } = getBoxUsageByUser(userID)
  const availableActions = PALIRO_DAILY_BOX_LIMIT + (state.bonusActions ?? 0) + (state.videoBonusActions ?? 0)
  if (state.freeActionsUsed >= availableActions) {
    return { type: 'coins-required', state }
  }

  const nextState = {
    ...state,
    freeActionsUsed: state.freeActionsUsed + 1,
  }
  return { type: 'success', state: saveBoxUsage(userID, usageByUser, nextState) }
}

export function paliroAwardVideoBoxAction(userID) {
  if (!userID) return { type: 'no-session' }
  const { usageByUser, state } = getBoxUsageByUser(userID)
  const today = getLocalDayKey()
  if (state.videoRewardDay === today) return { type: 'already-awarded', state }

  const nextState = saveBoxUsage(userID, usageByUser, {
    ...state,
    videoRewardDay: today,
    videoBonusActions: 1,
  })
  return { type: 'success', state: nextState }
}

export function paliroSpendBoxCoins(userID) {
  if (!userID) return { type: 'no-session' }
  const { usageByUser, state } = getBoxUsageByUser(userID)
  if (state.coins < PALIRO_BOX_ACTION_COST) {
    return { type: 'insufficient-coins', state }
  }

  const nextState = {
    ...state,
    coins: state.coins - PALIRO_BOX_ACTION_COST,
  }
  return { type: 'success', state: saveBoxUsage(userID, usageByUser, nextState) }
}

export function paliroGetFriendRequestStatus(userID, friendID) {
  if (!userID || !friendID) return 'none'
  return readJson(PALIRO_FRIEND_REQUESTS_KEY, {})[userID]?.[friendID]?.status ?? 'none'
}

export function paliroSendFriendRequest(userID, friendID, message = '') {
  if (!userID || !friendID) return { type: 'no-session' }

  const requestsByUser = readJson(PALIRO_FRIEND_REQUESTS_KEY, {})
  const userRequests = requestsByUser[userID] ?? {}
  if (userRequests[friendID]?.status === 'pending') {
    return { type: 'already-pending', status: 'pending' }
  }

  requestsByUser[userID] = {
    ...userRequests,
    [friendID]: {
      status: 'pending',
      // This local-only request stays limited to one message until accepted.
      message: String(message).trim().slice(0, 120),
      requestLimit: 1,
      requestedAt: new Date().toISOString(),
    },
  }
  writeJson(PALIRO_FRIEND_REQUESTS_KEY, requestsByUser)
  return { type: 'success', status: 'pending' }
}

function getIncomingFriendRequestsByUser(userID) {
  const requestsByUser = readJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, {})
  if (!Array.isArray(requestsByUser[userID])) {
    requestsByUser[userID] = userID === testUser.id
      ? PALIRO_TEST_INCOMING_REQUESTS.map((request) => ({ ...request, member: clonePaliroMember(request.member) }))
      : []
    writeJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, requestsByUser)
  }
  return { requestsByUser, requests: requestsByUser[userID] }
}

function getConversationStateByUser(userID) {
  const conversationsByUser = readJson(PALIRO_MESSAGES_KEY, {})
  if (!Array.isArray(conversationsByUser[userID])) {
    conversationsByUser[userID] = userID === testUser.id
      ? PALIRO_TEST_CONVERSATIONS.map(clonePaliroConversation)
      : []
    writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  }
  return { conversationsByUser, conversations: conversationsByUser[userID] }
}

export function paliroGetIncomingFriendRequests(userID) {
  if (!userID) return []
  const { requests } = getIncomingFriendRequestsByUser(userID)
  return requests.filter((request) => request.status === 'pending').map((request) => ({ ...request, member: clonePaliroMember(request.member) }))
}

export function paliroGetConversations(userID) {
  if (!userID) return []
  const { conversations } = getConversationStateByUser(userID)
  return conversations.map(clonePaliroConversation).sort((left, right) => {
    const leftTime = left.messages.at(-1)?.sentAt ?? ''
    const rightTime = right.messages.at(-1)?.sentAt ?? ''
    return rightTime.localeCompare(leftTime)
  })
}

export function paliroGetConversation(userID, memberID) {
  if (!userID || !memberID) return null
  const { conversations } = getConversationStateByUser(userID)
  const conversation = conversations.find((item) => item.member.id === memberID)
  return conversation ? clonePaliroConversation(conversation) : null
}

export function paliroGetOrCreateConversation(userID, member) {
  if (!userID || !member?.id) return null
  const social = paliroGetSocialState(userID)
  const isMutualFriend = social.followers.some((item) => item.id === member.id)
    && social.following.some((item) => item.id === member.id)
  if (!isMutualFriend) return null

  const { conversationsByUser, conversations } = getConversationStateByUser(userID)
  const existingConversation = conversations.find((conversation) => conversation.member.id === member.id)
  if (existingConversation) return clonePaliroConversation(existingConversation)

  const nextConversation = {
    member: clonePaliroMember(member),
    unreadCount: 0,
    messages: [{
      id: `paliro-message-friend-${crypto.randomUUID()}`,
      sender: 'friend',
      body: 'Thanks for connecting through a shared topic Box. I am looking forward to exchanging ideas respectfully.',
      sentAt: new Date().toISOString(),
    }],
  }
  conversationsByUser[userID] = [nextConversation, ...conversations]
  writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  return clonePaliroConversation(nextConversation)
}

export function paliroMarkConversationRead(userID, memberID) {
  if (!userID || !memberID) return null
  const { conversationsByUser, conversations } = getConversationStateByUser(userID)
  const nextConversations = conversations.map((conversation) => conversation.member.id === memberID
    ? { ...conversation, unreadCount: 0 }
    : conversation)
  conversationsByUser[userID] = nextConversations
  writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  return paliroGetConversation(userID, memberID)
}

export function paliroSendConversationMessage(userID, memberID, body) {
  const message = String(body ?? '').trim().slice(0, 280)
  if (!userID || !memberID || !message) return { type: 'invalid-message' }
  const social = paliroGetSocialState(userID)
  const isMutualFriend = social.followers.some((member) => member.id === memberID)
    && social.following.some((member) => member.id === memberID)
  if (!isMutualFriend) return { type: 'not-friends' }

  const { conversationsByUser, conversations } = getConversationStateByUser(userID)
  const index = conversations.findIndex((conversation) => conversation.member.id === memberID)
  if (index < 0) return { type: 'not-found' }
  const nextMessage = { id: `paliro-message-${crypto.randomUUID()}`, sender: 'self', body: message, sentAt: new Date().toISOString() }
  const nextConversation = { ...conversations[index], unreadCount: 0, messages: [...conversations[index].messages, nextMessage] }
  conversationsByUser[userID] = conversations.map((conversation, conversationIndex) => conversationIndex === index ? nextConversation : conversation)
  writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  return { type: 'success', conversation: clonePaliroConversation(nextConversation) }
}

export function paliroSendConversationAudioMessage(userID, memberID, audio) {
  const source = String(audio?.source ?? '')
  const durationSeconds = Number(audio?.durationSeconds ?? 0)
  if (!userID || !memberID || !source || !Number.isFinite(durationSeconds) || durationSeconds < 1) {
    return { type: 'invalid-audio' }
  }

  const social = paliroGetSocialState(userID)
  const isMutualFriend = social.followers.some((member) => member.id === memberID)
    && social.following.some((member) => member.id === memberID)
  if (!isMutualFriend) return { type: 'not-friends' }

  const { conversationsByUser, conversations } = getConversationStateByUser(userID)
  const index = conversations.findIndex((conversation) => conversation.member.id === memberID)
  if (index < 0) return { type: 'not-found' }

  const nextMessage = {
    id: `paliro-audio-message-${crypto.randomUUID()}`,
    sender: 'self',
    type: 'audio',
    source,
    durationSeconds: Math.min(300, Math.round(durationSeconds)),
    sentAt: new Date().toISOString(),
  }
  const nextConversation = { ...conversations[index], unreadCount: 0, messages: [...conversations[index].messages, nextMessage] }
  conversationsByUser[userID] = conversations.map((conversation, conversationIndex) => conversationIndex === index ? nextConversation : conversation)
  writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  return { type: 'success', conversation: clonePaliroConversation(nextConversation) }
}

export function paliroAcceptIncomingFriendRequest(userID, requestID) {
  if (!userID || !requestID) return { type: 'invalid-request' }
  const { requestsByUser, requests } = getIncomingFriendRequestsByUser(userID)
  const request = requests.find((item) => item.id === requestID && item.status === 'pending')
  if (!request) return { type: 'not-found' }

  const { socialByUser, state } = getSocialStateByUser(userID)
  const addMember = (members) => members.some((member) => member.id === request.member.id)
    ? members
    : [...members, clonePaliroMember(request.member)]
  socialByUser[userID] = {
    ...state,
    followers: addMember(state.followers),
    following: addMember(state.following),
  }
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)

  requestsByUser[userID] = requests.map((item) => item.id === requestID ? { ...item, status: 'accepted', respondedAt: new Date().toISOString() } : item)
  writeJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, requestsByUser)

  const { conversationsByUser, conversations } = getConversationStateByUser(userID)
  if (!conversations.some((conversation) => conversation.member.id === request.member.id)) {
    conversationsByUser[userID] = [{
      member: clonePaliroMember(request.member),
      unreadCount: 0,
      messages: [{ id: `paliro-message-friend-${crypto.randomUUID()}`, sender: 'friend', body: 'Thanks for connecting through a shared topic Box. I’m looking forward to exchanging ideas respectfully.', sentAt: new Date().toISOString() }],
    }, ...conversations]
    writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  }
  return { type: 'success', member: clonePaliroMember(request.member) }
}

export function paliroDeclineIncomingFriendRequest(userID, requestID) {
  if (!userID || !requestID) return { type: 'invalid-request' }
  const { requestsByUser, requests } = getIncomingFriendRequestsByUser(userID)
  if (!requests.some((item) => item.id === requestID && item.status === 'pending')) return { type: 'not-found' }
  requestsByUser[userID] = requests.map((request) => request.id === requestID ? { ...request, status: 'declined', respondedAt: new Date().toISOString() } : request)
  writeJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, requestsByUser)
  return { type: 'success' }
}

export function paliroCreditCoinsFromIap(userID, transaction) {
  if (!userID) return { type: 'no-session' }
  const product = PALIRO_COIN_PACKS.find((item) => item.productID === transaction?.productID)
  const transactionID = String(transaction?.transactionID ?? '')
  if (!product || !transactionID || Number(transaction?.coinAmount) !== product.coins) {
    return { type: 'invalid-transaction' }
  }

  const creditedTransactions = readJson(PALIRO_IAP_TRANSACTIONS_KEY, {})
  const userTransactions = creditedTransactions[userID] ?? {}
  const { usageByUser, state } = getBoxUsageByUser(userID)
  if (userTransactions[transactionID]) {
    return { type: 'already-credited', state }
  }

  const nextState = saveBoxUsage(userID, usageByUser, {
    ...state,
    coins: state.coins + product.coins,
  })
  creditedTransactions[userID] = {
    ...userTransactions,
    [transactionID]: {
      productID: product.productID,
      coins: product.coins,
      creditedAt: new Date().toISOString(),
    },
  }
  writeJson(PALIRO_IAP_TRANSACTIONS_KEY, creditedTransactions)
  return { type: 'success', state: nextState, coins: product.coins }
}

function getTopicTestByUser(userID) {
  const testsByUser = readJson(PALIRO_TEST_KEY, {})
  return {
    testsByUser,
    state: testsByUser[userID] ?? {
      answers: [],
      step: 0,
      completedAt: null,
      rewardGranted: false,
    },
  }
}

export function paliroGetTopicTestState(userID) {
  if (!userID) return null
  return getTopicTestByUser(userID).state
}

export function paliroSaveTopicTestProgress(userID, answers, step) {
  if (!userID) return null
  const { testsByUser, state } = getTopicTestByUser(userID)
  const nextState = {
    ...state,
    answers,
    step,
  }
  testsByUser[userID] = nextState
  writeJson(PALIRO_TEST_KEY, testsByUser)
  return nextState
}

export function paliroCompleteTopicTest(userID, answers) {
  if (!userID) return { type: 'no-session' }
  const { testsByUser, state } = getTopicTestByUser(userID)
  let boxState = paliroGetBoxState(userID)
  let awarded = false

  if (!state.rewardGranted) {
    const { usageByUser, state: currentBoxState } = getBoxUsageByUser(userID)
    boxState = saveBoxUsage(userID, usageByUser, {
      ...currentBoxState,
      bonusActions: (currentBoxState.bonusActions ?? 0) + 1,
    })
    awarded = true
  }

  const nextState = {
    ...state,
    answers,
    step: answers.length,
    completedAt: state.completedAt ?? new Date().toISOString(),
    rewardGranted: true,
  }
  testsByUser[userID] = nextState
  writeJson(PALIRO_TEST_KEY, testsByUser)
  return { type: 'success', state: nextState, boxState, awarded }
}
