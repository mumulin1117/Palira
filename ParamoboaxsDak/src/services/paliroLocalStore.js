import { paliroGetMockBoxContent } from './paliroMockBoxContent.js'
import { paliroVideoIdentityFixtures } from './paliroVideoIdentityFixtures.js'
import { paliroMergeRemoteProfile } from './paliroProfileSync.js'

const paliroVideoIdentityByOwner = new Map(paliroVideoIdentityFixtures.map((fixture) => [fixture.ownerID, fixture]))

const PALIRO_USERS_KEY = 'paliro.localUsers'
const PALIRO_RETIRED_TEST_KEY = 'paliro.retiredTestSeed'
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
const PALIRO_PROFILE_AVATAR_SOURCES = {
  violet: '/assets/paliro-avatar-violet@2x.png',
  blue: '/assets/paliro-avatar-blue@2x.png',
  coral: '/assets/paliro-avatar-coral@2x.png',
  mint: '/assets/paliro-avatar-mint@2x.png',
  golden: '/assets/paliro-avatar-golden@2x.png',
}

const PALIRO_MOCK_MEMBER_PHOTO_COUNTS = { ko: 19, en: 20 }

function paliroMockMemberPhotoSource(language, userID) {
  const languageBase = language === 'ko' ? 1000 : 2000
  const sequence = Number(String(userID).split('-').at(-1)) - languageBase
  if (sequence < 1 || sequence > (PALIRO_MOCK_MEMBER_PHOTO_COUNTS[language] ?? 0)) return ''
  return `/assets/paliro-member-${language}-${String(sequence).padStart(2, '0')}-photo.png`
}

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

function createPaliroMockMember({ id, userID, name, language, age, gender, mood, avatar, profileBackground, bio, interests, followerCount, followingCount, likes, relationship, box }) {
  const ownedPhoto = paliroMockMemberPhotoSource(language, userID) || profileBackground || avatar || box.image
  const boxContent = paliroGetMockBoxContent(language, userID)
  const videoIdentity = paliroVideoIdentityByOwner.get(id)
  const memberInterests = [...new Set([...boxContent.interests, ...(videoIdentity?.interests ?? []), ...interests])].slice(0, 3)
  return {
    id,
    userID,
    name,
    nickname: name,
    language,
    age,
    gender,
    mood,
    tags: [mood],
    avatar: videoIdentity?.avatarFromVideo ? videoIdentity.avatar : ownedPhoto,
    profileBackground: videoIdentity?.avatarFromVideo ? videoIdentity.profileBackground : ownedPhoto,
    bio: videoIdentity?.bio ?? bio,
    about: videoIdentity?.bio ?? bio,
    interests: memberInterests,
    relationship,
    stats: { followers: followerCount, following: followingCount, likes, posts: 1 },
    boxPosts: [{
      id: `${id}-box-1`,
      ownerID: id,
      type: 'box',
      theme: boxContent.theme,
      title: boxContent.title,
      description: boxContent.description,
      interests: boxContent.interests,
      images: [boxContent.image],
      createdAt: box.createdAt,
    }],
    videoPosts: [],
  }
}

const PALIRO_MOCK_MEMBERS_BY_LANGUAGE = {
  ko: [
    createPaliroMockMember({ id: 'paliro-member-haneul', userID: 'PAL-KR-1001', name: '하늘_별빛', language: 'ko', age: 24, gender: 'Female', mood: 'Feeling Happy', avatar: '/assets/paliro-mock-ko-avatar-01.png', bio: '책과 음악, 그리고 오늘의 작은 발견을 좋아해요.', interests: ['Music', 'Reading', 'Coffee'], followerCount: 9, followingCount: 7, likes: 13, relationship: 'mutual', box: { createdAt: '2026-09-08T12:00:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-minji', userID: 'PAL-KR-1002', name: '민지_코스모', language: 'ko', age: 26, gender: 'Female', mood: 'Want to Chat', bio: '게임과 여행 이야기를 주제로 친근하게 소통해요.', interests: ['Gaming', 'Travel', 'Technology'], followerCount: 11, followingCount: 8, likes: 12, relationship: 'mutual', box: { createdAt: '2026-09-08T11:40:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-seoyun', userID: 'PAL-KR-1003', name: '서윤_파동', language: 'ko', age: 23, gender: 'Female', mood: 'A Little Shy', avatar: '/assets/paliro-mock-ko-avatar-03.png', bio: '사진과 자연을 기록하며 새로운 주제를 발견하고 있어요.', interests: ['Photography', 'Nature', 'Art'], followerCount: 8, followingCount: 6, likes: 10, relationship: 'following', box: { createdAt: '2026-09-08T11:20:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-jia', userID: 'PAL-KR-1004', name: '지아_루프', language: 'ko', age: 28, gender: 'Other', mood: 'Feeling Chill', avatar: '/assets/paliro-mock-ko-avatar-04.png', bio: '차분한 대화와 영화, 요리 주제를 나누는 것을 좋아해요.', interests: ['Movies', 'Cooking', 'Coffee'], followerCount: 7, followingCount: 9, likes: 11, relationship: 'incoming-request', box: { createdAt: '2026-09-08T11:00:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-soyeon', userID: 'PAL-KR-1005', name: '소연_플래닛', language: 'ko', age: 25, gender: 'Female', mood: 'Ready for Fun', avatar: '/assets/paliro-mock-ko-avatar-05.png', bio: '패션, 댄스, 그리고 가벼운 창작 아이디어를 모아요.', interests: ['Fashion', 'Dancing', 'Art'], followerCount: 12, followingCount: 10, likes: 14, relationship: 'none', box: { createdAt: '2026-09-08T10:40:00.000Z' } }),
  ],
  en: [
    createPaliroMockMember({ id: 'paliro-member-maya', userID: 'PAL-EN-2001', name: 'Maya_Orion', language: 'en', age: 24, gender: 'Female', mood: 'Feeling Happy', avatar: '/assets/paliro-mock-en-avatar-01.png', bio: 'Collecting reading notes, playlists, and kind conversation prompts.', interests: ['Music', 'Reading', 'Coffee'], followerCount: 9, followingCount: 7, likes: 13, relationship: 'mutual', box: { createdAt: '2026-09-08T12:00:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-luna', userID: 'PAL-EN-2002', name: 'Luna_Star', language: 'en', age: 26, gender: 'Female', mood: 'Want to Chat', avatar: '/assets/paliro-mock-en-avatar-02.png', bio: 'Sharing playful game topics and short travel stories.', interests: ['Gaming', 'Travel', 'Technology'], followerCount: 11, followingCount: 8, likes: 12, relationship: 'mutual', box: { createdAt: '2026-09-08T11:40:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-nova', userID: 'PAL-EN-2003', name: 'Nova_Drift', language: 'en', age: 23, gender: 'Female', mood: 'A Little Shy', avatar: '/assets/paliro-mock-en-avatar-03.png', bio: 'Documenting quiet outdoor moments and small creative projects.', interests: ['Photography', 'Nature', 'Art'], followerCount: 8, followingCount: 6, likes: 10, relationship: 'following', box: { createdAt: '2026-09-08T11:20:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-iris', userID: 'PAL-EN-2004', name: 'Iris_Atlas', language: 'en', age: 28, gender: 'Other', mood: 'Feeling Chill', avatar: '/assets/paliro-mock-en-avatar-04.png', bio: 'Here for movies, cooking ideas, and thoughtful shared topics.', interests: ['Movies', 'Cooking', 'Coffee'], followerCount: 7, followingCount: 9, likes: 11, relationship: 'incoming-request', box: { createdAt: '2026-09-08T11:00:00.000Z' } }),
    createPaliroMockMember({ id: 'paliro-member-ava', userID: 'PAL-EN-2005', name: 'Ava_Nebula', language: 'en', age: 25, gender: 'Female', mood: 'Ready for Fun', avatar: '/assets/paliro-mock-en-avatar-05.png', bio: 'Gathering fashion references, dance clips, and creative sparks.', interests: ['Fashion', 'Dancing', 'Art'], followerCount: 12, followingCount: 10, likes: 14, relationship: 'none', box: { createdAt: '2026-09-08T10:40:00.000Z' } }),
  ],
}

const PALIRO_ADDITIONAL_MEMBER_COPY = {
  ko: [
    { name: '유나_문빛', bio: '달빛 아래 듣기 좋은 음악과 따뜻한 대화를 좋아해요.', interests: ['Music', 'Nightlife', 'Coffee'] },
    { name: '다온_리듬', bio: '새로운 춤과 재미있는 리듬을 발견하면 바로 기록해요.', interests: ['Dancing', 'Music', 'Fitness'] },
    { name: '채원_모먼트', bio: '카메라로 평범한 하루의 반짝이는 순간을 모으고 있어요.', interests: ['Photography', 'Art', 'Nature'] },
    { name: '수아_오로라', bio: '여행 지도와 새로운 카페를 살펴보는 시간이 즐거워요.', interests: ['Travel', 'Coffee', 'Photography'] },
    { name: '나린_웨이브', bio: '바다와 산책, 천천히 이어지는 대화를 좋아해요.', interests: ['Nature', 'Travel', 'Photography'] },
    { name: '예린_노트', bio: '읽은 책에서 마음에 남은 문장과 생각을 기록합니다.', interests: ['Reading', 'Coffee', 'Music'] },
    { name: '아린_코멧', bio: '별과 우주, 상상력을 자극하는 이야기에 관심이 많아요.', interests: ['Technology', 'Nature', 'Movies'] },
    { name: '지우_메아리', bio: '좋은 목소리와 공연에서 받은 감동을 다른 사람과 나눠요.', interests: ['Music', 'Nightlife', 'Art'] },
    { name: '유진_스파크', bio: '작은 아이디어를 그림과 색으로 표현하는 것을 좋아해요.', interests: ['Art', 'Photography', 'Fashion'] },
    { name: '보라_드림', bio: '꿈같은 영화 장면과 상상 속 이야기를 수집하고 있어요.', interests: ['Movies', 'Art', 'Fashion'] },
    { name: '은서_클라우드', bio: '여유로운 주말과 직접 만든 디저트 이야기를 좋아해요.', interests: ['Cooking', 'Coffee', 'Reading'] },
    { name: '세아_픽셀', bio: '게임 속 세계와 재미있는 기술 아이디어를 탐험해요.', interests: ['Gaming', 'Technology', 'Anime'] },
    { name: '다희_멜로디', bio: '하루의 기분을 음악과 짧은 글로 남기는 편이에요.', interests: ['Music', 'Art', 'Nightlife'] },
    { name: '현아_브리즈', bio: '자연 속에서 쉬며 새로운 사람의 이야기를 듣고 싶어요.', interests: ['Nature', 'Photography', 'Travel'] },
    { name: '라온_캔버스', bio: '패션과 미술에서 찾은 색다른 조합을 즐겨 기록해요.', interests: ['Fashion', 'Art', 'Photography'] },
  ],
  en: [
    { name: 'Chloe_Pulse', bio: 'Saving upbeat playlists and small moments that make the day brighter.', interests: ['Music', 'Nightlife', 'Coffee'] },
    { name: 'Emma_Comet', bio: 'Curious about space, future ideas, and conversations that wander.', interests: ['Technology', 'Nature', 'Movies'] },
    { name: 'Zoe_Melody', bio: 'Turning everyday moods into playlists and short creative notes.', interests: ['Music', 'Art', 'Nightlife'] },
    { name: 'Lily_Canvas', bio: 'Collecting colors, sketches, and thoughtful ideas from ordinary places.', interests: ['Art', 'Photography', 'Fashion'] },
    { name: 'Nora_Breeze', bio: 'Happiest near the ocean, on a trail, or in a calm conversation.', interests: ['Nature', 'Travel', 'Photography'] },
    { name: 'Ella_Pixel', bio: 'Exploring game worlds, playful technology, and clever design details.', interests: ['Gaming', 'Technology', 'Anime'] },
    { name: 'Ruby_Moon', bio: 'Here for late-night music, gentle humor, and honest conversation.', interests: ['Music', 'Nightlife', 'Coffee'] },
    { name: 'Grace_Echo', bio: 'Remembering live performances and voices that stay with you.', interests: ['Music', 'Art', 'Nightlife'] },
    { name: 'Sophie_Rhythm', bio: 'Learning new dance steps and sharing the fun parts of practice.', interests: ['Dancing', 'Fitness', 'Music'] },
    { name: 'Aria_Cloud', bio: 'Planning slow weekends around coffee, books, and homemade desserts.', interests: ['Coffee', 'Cooking', 'Reading'] },
    { name: 'Hazel_Spark', bio: 'Gathering practical ideas that can turn into small creative projects.', interests: ['Art', 'Photography', 'Technology'] },
    { name: 'Mia_Wander', bio: 'Marking hidden streets, local food, and peaceful places on my map.', interests: ['Travel', 'Photography', 'Coffee'] },
    { name: 'Ivy_Page', bio: 'Writing down favorite lines from books and questions they leave behind.', interests: ['Reading', 'Coffee', 'Music'] },
    { name: 'Clara_Glow', bio: 'Photographing warm light and the details people usually pass by.', interests: ['Photography', 'Nature', 'Art'] },
    { name: 'Stella_Dream', bio: 'Saving memorable film scenes, fashion references, and dreamy ideas.', interests: ['Movies', 'Fashion', 'Art'] },
  ],
}

const PALIRO_ADDITIONAL_MOODS = ['Feeling Happy', 'Ready for Fun', 'A Little Shy', 'Want to Chat', 'Feeling Chill']

Object.entries(PALIRO_ADDITIONAL_MEMBER_COPY).forEach(([language, members]) => {
  members.slice(0, PALIRO_MOCK_MEMBER_PHOTO_COUNTS[language] - 5).forEach((copy, offset) => {
    const sequence = offset + 6
    PALIRO_MOCK_MEMBERS_BY_LANGUAGE[language].push(createPaliroMockMember({
      id: `paliro-member-${language}-${String(sequence).padStart(2, '0')}`,
      userID: `PAL-${language === 'ko' ? 'KR' : 'EN'}-${language === 'ko' ? 1000 + sequence : 2000 + sequence}`,
      name: copy.name,
      language,
      age: 20 + (offset % 15),
      gender: offset % 5 === 4 ? 'Other' : offset % 2 === 0 ? 'Female' : 'Male',
      mood: PALIRO_ADDITIONAL_MOODS[offset % PALIRO_ADDITIONAL_MOODS.length],
      bio: copy.bio,
      interests: copy.interests,
      followerCount: 5 + (offset % 10),
      followingCount: 4 + ((offset * 2) % 10),
      likes: 3 + ((offset * 3) % 12),
      relationship: 'none',
      box: {
        createdAt: `2026-09-${String(8 - Math.floor(offset / 8)).padStart(2, '0')}T${String(10 + (offset % 8)).padStart(2, '0')}:00:00.000Z`,
      },
    }))
  })
})

function assertPaliroMockMediaOwnership() {
  const mediaOwners = new Map()
  Object.values(PALIRO_MOCK_MEMBERS_BY_LANGUAGE).flat().forEach((member) => {
    if (member.boxPosts.length !== 1 || member.boxPosts[0].ownerID !== member.id) {
      throw new Error(`Invalid Paliro Box ownership: ${member.id}`)
    }
    const boxImage = member.boxPosts[0].images[0]
    if (boxImage === member.avatar || boxImage === member.profileBackground) {
      throw new Error(`Paliro Box image must not reuse profile media: ${member.id}`)
    }
    const sources = [member.avatar, member.profileBackground, ...member.boxPosts[0].images]
    sources.forEach((source) => {
      if (typeof source !== 'string' || !source) throw new Error(`Missing Paliro media: ${member.id}`)
      const existingOwnerID = mediaOwners.get(source)
      if (existingOwnerID && existingOwnerID !== member.id) {
        throw new Error(`Paliro media is shared by ${existingOwnerID} and ${member.id}`)
      }
      mediaOwners.set(source, member.id)
    })
  })
}

assertPaliroMockMediaOwnership()

const PALIRO_MOCK_MEMBER_BY_ID = new Map(Object.values(PALIRO_MOCK_MEMBERS_BY_LANGUAGE).flat().map((member) => [member.id, member]))
const PALIRO_BOUND_VIDEO_IDS = new Set()
const PALIRO_BOUND_VIDEO_SOURCES = new Set()
const PALIRO_BOUND_VIDEO_OWNER_IDS = new Set()

function createPaliroVideoFixture({ id, language, ownerID, index, likes, comments, createdAt }) {
  const member = PALIRO_MOCK_MEMBER_BY_ID.get(ownerID)
  const source = `/assets/paliro-feed-${language}-${String(index).padStart(2, '0')}.mp4`
  const identity = paliroVideoIdentityByOwner.get(ownerID)
  if (!identity || identity.language !== language || identity.source !== source) {
    throw new Error(`Paliro video identity does not match its owner: ${id}`)
  }
  if (!member || member.language !== language || PALIRO_BOUND_VIDEO_IDS.has(id) || PALIRO_BOUND_VIDEO_SOURCES.has(source) || PALIRO_BOUND_VIDEO_OWNER_IDS.has(ownerID)) {
    throw new Error(`Invalid Paliro video fixture binding: ${id}`)
  }
  PALIRO_BOUND_VIDEO_IDS.add(id)
  PALIRO_BOUND_VIDEO_SOURCES.add(source)
  PALIRO_BOUND_VIDEO_OWNER_IDS.add(ownerID)
  const baseComments = comments.map((comment) => {
    const author = PALIRO_MOCK_MEMBER_BY_ID.get(comment.authorID)
    return {
      ...comment,
      authorName: author.name,
      authorAvatar: author.avatar,
    }
  })
  return {
    id,
    ownerID,
    member: clonePaliroMember(member),
    source,
    thumbnail: `/assets/paliro-feed-${language}-${String(index).padStart(2, '0')}-cover.png`,
    caption: identity.caption,
    title: identity.title,
    baseLikes: likes,
    baseComments,
    language,
    createdAt,
  }
}

function paliroProfileAvatarSource(profile) {
  return profile?.photoDataUrl || PALIRO_PROFILE_AVATAR_SOURCES[profile?.avatar] || PALIRO_PROFILE_AVATAR_SOURCES.violet
}

const PALIRO_VIDEO_FIXTURES_BY_LANGUAGE = {
  ko: [
    createPaliroVideoFixture({ id: 'paliro-feed-ko-01', language: 'ko', ownerID: 'paliro-member-haneul', index: 1, likes: 13, comments: [{ id: 'paliro-comment-ko-01', authorID: 'paliro-member-minji', body: '분위기가 정말 좋아요.', baseLikes: 14, createdAt: '2026-09-10T09:20:00.000Z' }], createdAt: '2026-09-10T10:00:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-ko-02', language: 'ko', ownerID: 'paliro-member-minji', index: 2, likes: 12, comments: [{ id: 'paliro-comment-ko-02', authorID: 'paliro-member-seoyun', body: '다음 곡도 궁금해요.', baseLikes: 9, createdAt: '2026-09-10T09:05:00.000Z' }], createdAt: '2026-09-10T09:40:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-ko-03', language: 'ko', ownerID: 'paliro-member-seoyun', index: 3, likes: 10, comments: [{ id: 'paliro-comment-ko-03', authorID: 'paliro-member-haneul', body: '이 장면의 빛이 인상적이에요.', baseLikes: 11, createdAt: '2026-09-10T08:44:00.000Z' }], createdAt: '2026-09-10T09:20:00.000Z' }),
  ],
  en: [
    createPaliroVideoFixture({ id: 'paliro-feed-en-01', language: 'en', ownerID: 'paliro-member-maya', index: 1, likes: 13, comments: [{ id: 'paliro-comment-en-01', authorID: 'paliro-member-luna', body: 'This has such a thoughtful mood.', baseLikes: 14, createdAt: '2026-09-10T09:20:00.000Z' }], createdAt: '2026-09-10T10:00:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-02', language: 'en', ownerID: 'paliro-member-luna', index: 2, likes: 12, comments: [{ id: 'paliro-comment-en-02', authorID: 'paliro-member-nova', body: 'Adding this to my playlist.', baseLikes: 9, createdAt: '2026-09-10T09:05:00.000Z' }], createdAt: '2026-09-10T09:40:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-03', language: 'en', ownerID: 'paliro-member-nova', index: 3, likes: 10, comments: [{ id: 'paliro-comment-en-03', authorID: 'paliro-member-maya', body: 'The light here is beautiful.', baseLikes: 11, createdAt: '2026-09-10T08:44:00.000Z' }], createdAt: '2026-09-10T09:20:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-04', language: 'en', ownerID: 'paliro-member-iris', index: 4, likes: 9, comments: [{ id: 'paliro-comment-en-04', authorID: 'paliro-member-ava', body: 'This made me smile.', baseLikes: 8, createdAt: '2026-09-10T08:25:00.000Z' }], createdAt: '2026-09-10T09:00:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-05', language: 'en', ownerID: 'paliro-member-ava', index: 5, likes: 14, comments: [{ id: 'paliro-comment-en-05', authorID: 'paliro-member-iris', body: 'Such a fun energy.', baseLikes: 12, createdAt: '2026-09-10T08:02:00.000Z' }], createdAt: '2026-09-10T08:40:00.000Z' }),
    createPaliroVideoFixture({ id: 'paliro-feed-en-06', language: 'en', ownerID: 'paliro-member-en-06', index: 6, likes: 11, comments: [{ id: 'paliro-comment-en-06', authorID: 'paliro-member-nova', body: 'That voice is unforgettable.', baseLikes: 7, createdAt: '2026-09-10T07:41:00.000Z' }], createdAt: '2026-09-10T08:20:00.000Z' }),
  ],
}

Object.values(PALIRO_VIDEO_FIXTURES_BY_LANGUAGE).flat().forEach((video) => {
  const member = PALIRO_MOCK_MEMBER_BY_ID.get(video.ownerID)
  if (member.videoPosts.length) throw new Error(`Paliro member already has a video: ${member.id}`)
  member.videoPosts.push({
    id: video.id,
    ownerID: video.ownerID,
    type: 'video',
    thumbnail: video.thumbnail,
    source: video.source,
    title: video.title,
    caption: video.caption,
    interests: member.interests.slice(0, 2),
    likes: video.baseLikes,
    comments: video.baseComments.map((comment) => ({ ...comment })),
    createdAt: video.createdAt,
  })
  member.stats.posts = member.boxPosts.length + member.videoPosts.length
})

export const PALIRO_MATCHED_FRIEND = {
  ...PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[3],
  nickname: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[3].name,
}

const PALIRO_TEST_ACCOUNT_MEMBERS = Object.values(PALIRO_MOCK_MEMBERS_BY_LANGUAGE).flat()

const PALIRO_TEST_ACCOUNT_SOCIAL_STATE = {
  followers: PALIRO_TEST_ACCOUNT_MEMBERS.filter((member) => ['mutual', 'follower'].includes(member.relationship)),
  following: PALIRO_TEST_ACCOUNT_MEMBERS.filter((member) => ['mutual', 'following'].includes(member.relationship)),
  posts: [],
}

const PALIRO_LEGACY_DEMO_POST_IDS = new Set(['paliro-demo-box-quiet-moments', 'paliro-demo-box-creative-sparks'])

const PALIRO_MOCK_PROFILE_FIXTURE_VERSION = 6
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
  { id: 'paliro-request-iris-atlas', member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[3], message: 'Your movie and cooking topics caught my attention, so I sent a friend request.', requestedAt: '2026-09-10T08:05:00.000Z', status: 'pending' },
]

const PALIRO_TEST_CONVERSATIONS = [
  { member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[0], unreadCount: 2, messages: [{ id: 'paliro-message-haneul-1', sender: 'friend', body: '오늘의 음악 상자에 어울리는 곡을 하나 남겼어요.', sentAt: '2026-09-10T11:24:00.000Z' }] },
  { member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko[1], unreadCount: 0, messages: [{ id: 'paliro-message-minji-1', sender: 'friend', body: '다음 주제 상자에 레트로 게임 이야기를 넣어 볼까요?', sentAt: '2026-09-10T10:15:00.000Z' }] },
  { member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[0], unreadCount: 1, messages: [{ id: 'paliro-message-maya-1', sender: 'friend', body: 'I left a song that fits today’s reading Box.', sentAt: '2026-09-10T11:14:00.000Z' }] },
  { member: PALIRO_MOCK_MEMBERS_BY_LANGUAGE.en[1], unreadCount: 0, messages: [{ id: 'paliro-message-luna-1', sender: 'friend', body: 'Want to compare our favorite retro games for the next Box?', sentAt: '2026-09-10T10:05:00.000Z' }] },
]
const PALIRO_DEBUG_LOGIN_COIN_BALANCE = 1000
const PALIRO_DEMO_COIN_BALANCE = PALIRO_DEBUG_MODE ? PALIRO_DEBUG_LOGIN_COIN_BALANCE : 600

const testUser = {
  id: 'paliro-test-user',
  email: 'paliro@gmail.com',
  password: '67896789',
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
  if (window.localStorage.getItem(PALIRO_RETIRED_TEST_KEY) === 'true') return users
  const existingTestUser = users.find((user) => user.email === testUser.email)
  if (existingTestUser) {
    if (existingTestUser.id === testUser.id && !existingTestUser.serverUserID && existingTestUser.password !== testUser.password) {
      existingTestUser.password = testUser.password
      writeJson(PALIRO_USERS_KEY, users)
    }
    const profile = existingTestUser.profile
    if (profile && (!profile.nickname || !profile.avatar || profile.avatar === 'cosmic')) {
      existingTestUser.profile = {
        ...profile,
        nickname: profile.nickname || testUser.profile.nickname,
        avatar: !profile.avatar || profile.avatar === 'cosmic' ? testUser.profile.avatar : profile.avatar,
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

export function paliroDeleteLocalAccount(localID, serverID) {
  const users = readJson(PALIRO_USERS_KEY, [])
  const user = users.find(value => value.id === localID)
  if (user && user.serverUserID !== serverID) throw new Error('Account identity mismatch')
  const keys = [PALIRO_BOX_USAGE_KEY, PALIRO_OPENED_MATCHES_KEY, PALIRO_BOX_RULES_KEY,
    PALIRO_TEST_KEY, PALIRO_IAP_TRANSACTIONS_KEY, PALIRO_FRIEND_REQUESTS_KEY,
    PALIRO_INCOMING_FRIEND_REQUESTS_KEY, PALIRO_MESSAGES_KEY, PALIRO_PROFILE_META_KEY,
    PALIRO_SOCIAL_STATE_KEY, PALIRO_BLOCKED_USERS_KEY, PALIRO_REPORTS_KEY,
    PALIRO_VIDEO_STATE_KEY, PALIRO_LANGUAGE_KEY, PALIRO_PUSH_PREFERENCE_KEY]
  if (!localID || !serverID) throw new Error('Missing account identity')
  if (localID === testUser.id) window.localStorage.setItem(PALIRO_RETIRED_TEST_KEY, 'true')
  for (const key of keys) {
    const byUser = readJson(key, {})
    if (Object.hasOwn(byUser, localID)) {
      delete byUser[localID]
      writeJson(key, byUser)
    }
  }
  writeJson(PALIRO_USERS_KEY, users.filter(value => value.id !== localID))
  if (readJson(PALIRO_SESSION_KEY, null)?.userID === localID) paliroSignOut()
}

function createSession(user) {
  const session = {
    userID: user.id,
    Token: user.serverUserID ? 'paliro-server-session' : `paliro-local-${user.id}`,
    ...(user.serverUserID ? { serverUserID: user.serverUserID, authProvider: 'server' } : {}),
    email: user.email,
    profile: user.profile,
  }
  writeJson(PALIRO_SESSION_KEY, session)
  return session
}

// Preserve local business keys, but only associate the demo fixture with the server's reserved identity.
export function paliroAcceptServerUser(serverUser) {
  if (!serverUser?.id || !serverUser.email || !serverUser.profileComplete || !serverUser.profile) throw new Error('Invalid server user')
  const isTest = serverUser.isTestAccount === true && serverUser.id === '80962768-0000-4000-8000-000000000001'
  const localID = isTest ? testUser.id : serverUser.id
  const users = paliroSeedUsers()
  const previous = users.find((user) => user.id === localID && (isTest || user.serverUserID === serverUser.id))
  const serverProfile = { ...serverUser.profile }
  delete serverProfile.language
  const profile = { ...serverProfile, ...(previous?.profile ?? {}) }
  const user = { id: localID, serverUserID: serverUser.id, email: serverUser.email, profile }
  const index = users.findIndex((item) => item.id === localID)
  const next = [...users]
  if (index < 0) next.push(user)
  else next[index] = user
  writeJson(PALIRO_USERS_KEY, next)
  const languageByUser = readJson(PALIRO_LANGUAGE_KEY, {})
  if (!languageByUser[localID]) paliroSetLanguagePreference(localID, serverUser.profile.language)
  ensureDebugLoginBalance(localID)
  return createSession(user)
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

export function paliroCacheServerProfile(serverUser, localID) {
  const users = readJson(PALIRO_USERS_KEY, [])
  const user = users.find(item => item.id === localID && item.serverUserID === serverUser?.id)
  if (!user || !serverUser.profileComplete || !serverUser.profile) throw new Error('Profile identity mismatch')
  user.profile = paliroMergeRemoteProfile(user.profile, serverUser.profile)
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
  member = PALIRO_MOCK_MEMBER_BY_ID.get(member.id) ?? member
  return {
    ...member,
    tags: [...(member.tags ?? [])],
    interests: [...(member.interests ?? [])],
    stats: { ...(member.stats ?? {}) },
    boxPosts: (member.boxPosts ?? []).map((post) => ({ ...post, interests: [...(post.interests ?? [])], images: [...(post.images ?? [])] })),
    videoPosts: (member.videoPosts ?? []).map((video) => ({
      ...video,
      interests: [...(video.interests ?? [])],
      comments: (video.comments ?? []).map((comment) => ({ ...comment })),
    })),
  }
}

function clonePaliroConversation(conversation) {
  const member = PALIRO_MOCK_MEMBER_BY_ID.get(conversation.member?.id) ?? conversation.member
  return {
    ...conversation,
    member: clonePaliroMember(member),
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
    followers: [...PALIRO_TEST_ACCOUNT_SOCIAL_STATE.followers.map(clonePaliroMember), ...existingFollowers],
    following: [...PALIRO_TEST_ACCOUNT_SOCIAL_STATE.following.map(clonePaliroMember), ...existingFollowing],
    testMutualFriendSeeded: true,
    mockProfileFixtureVersion: PALIRO_MOCK_PROFILE_FIXTURE_VERSION,
  }
  socialByUser[userID] = nextState
  writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
  return nextState
}

function getSocialStateByUser(userID) {
  const socialByUser = readJson(PALIRO_SOCIAL_STATE_KEY, {})
  let savedState = socialByUser[userID]
  // Remove only the two retired demo posts, preserving all member-created content.
  if (userID === testUser.id && Array.isArray(savedState?.posts)) {
    const posts = savedState.posts.filter((post) => !PALIRO_LEGACY_DEMO_POST_IDS.has(post.id))
    if (posts.length !== savedState.posts.length) {
      savedState = { ...savedState, posts }
      socialByUser[userID] = savedState
      writeJson(PALIRO_SOCIAL_STATE_KEY, socialByUser)
    }
  }
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

export function paliroGetSocialState(userID, language = '') {
  if (!userID) return { followers: [], following: [], posts: [] }
  const { state } = getSocialStateByUser(userID)
  const hydrateMembers = (members) => members
    .map((member) => PALIRO_MOCK_MEMBER_BY_ID.get(member.id) ?? member)
    .filter((member) => !language || member.language === language)
    .map(clonePaliroMember)
  return {
    followers: hydrateMembers(state.followers),
    following: hydrateMembers(state.following),
    posts: state.posts.map((post) => ({ ...post, interests: [...(post.interests ?? [])], images: [...(post.images ?? [])] })),
  }
}

export function paliroGetMemberPosts(member) {
  if (!member) return []
  const sourceMember = PALIRO_MOCK_MEMBER_BY_ID.get(member.id) ?? member
  const boxPosts = (sourceMember.boxPosts ?? []).map((post) => ({
    ...post,
    contentType: 'box',
    thumbnail: post.images?.[0] || post.thumbnail || '/assets/paliro-make-box-flight@2x.png',
    interests: [...(post.interests ?? [])],
  }))
  const videoPosts = (sourceMember.videoPosts ?? []).map((video) => ({
    ...video,
    contentType: 'video',
    thumbnail: video.thumbnail || '/assets/paliro-make-box-flight@2x.png',
    interests: [...(video.interests ?? [])],
    comments: (video.comments ?? []).map((comment) => ({ ...comment })),
  }))
  return [...boxPosts, ...videoPosts].sort((left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? '')))
}

export function paliroGetSocialSummary(userID, language = '') {
  const state = paliroGetSocialState(userID, language)
  return { followers: state.followers.length, following: state.following.length, posts: state.posts.length + paliroGetPublishedVideos(userID).length }
}

export function paliroCreateBoxPost(userID, post) {
  if (!userID) return null
  const { socialByUser, state } = getSocialStateByUser(userID)
  const images = Array.isArray(post?.images)
    ? post.images.filter((image) => typeof image === 'string' && image.startsWith('data:image/') && image.length <= 1_200_000).slice(0, 3)
    : []
  if (!images.length) return null
  const nextPost = {
    id: `paliro-box-${crypto.randomUUID()}`,
    theme: String(post?.theme ?? 'Shared Interests').slice(0, 48),
    title: String(post?.title ?? 'A new topic Box').slice(0, 80),
    description: String(post?.description ?? '').slice(0, 150),
    interests: Array.isArray(post?.interests) ? post.interests.slice(0, 3) : [],
    images,
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
  return { type: 'success', state: paliroGetSocialState(userID, member.language) }
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
  return { type: 'success', following: !isFollowing, state: paliroGetSocialState(userID, member.language) }
}

function clonePaliroVideo(video) {
  const member = video.member ? PALIRO_MOCK_MEMBER_BY_ID.get(video.member.id) ?? video.member : null
  return {
    ...video,
    member: member ? clonePaliroMember(member) : null,
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
  const author = PALIRO_MOCK_MEMBER_BY_ID.get(comment.authorID)
  return {
    ...comment,
    ...(author ? { authorName: author.name, authorAvatar: author.avatar } : {}),
    liked,
    likes: Math.min(14, Math.max(0, Number(comment.baseLikes ?? comment.likes ?? 0) + (liked ? 1 : 0))),
  }
}

function videoWithInteraction(video, interaction) {
  const liked = interaction?.liked === true
  return {
    ...video,
    liked,
    likes: Math.min(14, Math.max(0, Number(video.baseLikes ?? video.likes ?? 0) + (liked ? 1 : 0))),
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
    authorAvatar: paliroProfileAvatarSource(author),
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
      avatar: paliroProfileAvatarSource(profile),
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
  return (readJson(PALIRO_BLOCKED_USERS_KEY, {})[userID] ?? []).map((entry) => {
    const member = PALIRO_MOCK_MEMBER_BY_ID.get(entry.id)
    return member ? { ...entry, name: member.name, avatar: member.avatar } : entry
  })
}

function getExcludedMatchMemberIDs(userID) {
  const blockedIDs = new Set(paliroGetBlockedUsers(userID).map((member) => member.id))
  const openedIDs = new Set(readJson(PALIRO_OPENED_MATCHES_KEY, {})[userID] ?? [])
  const { state: socialState } = getSocialStateByUser(userID)
  const followerIDs = new Set(socialState.followers.map((member) => member.id))
  const mutualFriendIDs = new Set(socialState.following
    .map((member) => member.id)
    .filter((memberID) => followerIDs.has(memberID)))

  return new Set([...blockedIDs, ...openedIDs, ...mutualFriendIDs])
}

export function paliroGetAvailableMatchMembers(userID, language = 'ko') {
  if (!userID) return []
  const excludedMemberIDs = getExcludedMatchMemberIDs(userID)
  const members = PALIRO_MOCK_MEMBERS_BY_LANGUAGE[language] ?? PALIRO_MOCK_MEMBERS_BY_LANGUAGE.ko
  return members.filter((member) => !excludedMemberIDs.has(member.id)).map(clonePaliroMember)
}

export function paliroRecordOpenedMatchMember(userID, memberID) {
  if (!userID || !memberID) return []
  const openedByUser = readJson(PALIRO_OPENED_MATCHES_KEY, {})
  const openedMemberIDs = Array.isArray(openedByUser[userID]) ? openedByUser[userID] : []
  openedByUser[userID] = [...new Set([...openedMemberIDs, memberID])]
  writeJson(PALIRO_OPENED_MATCHES_KEY, openedByUser)
  return openedByUser[userID]
}

export function paliroTakeAvailableMatchMember(userID, language = 'ko', randomValue = Math.random()) {
  const candidates = paliroGetAvailableMatchMembers(userID, language)
  if (!candidates.length) return null
  const normalizedRandom = Number.isFinite(randomValue) ? Math.abs(randomValue) % 1 : Math.random()
  const selectedIndex = Math.min(candidates.length - 1, Math.floor(normalizedRandom * candidates.length))
  const member = candidates[selectedIndex]
  paliroRecordOpenedMatchMember(userID, member.id)
  return member
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

export function paliroSendFriendRequest(userID, friendID, message = '', memberSnapshot = null) {
  if (!userID || !friendID) return { type: 'no-session' }
  if (paliroGetBlockedUsers(userID).some((member) => member.id === friendID)) return { type: 'blocked' }
  if (paliroCanChatWithMember(userID, friendID)) return { type: 'already-friends' }
  const member = PALIRO_MOCK_MEMBER_BY_ID.get(friendID) ?? (memberSnapshot?.id === friendID ? memberSnapshot : null)
  if (!member) return { type: 'invalid-member' }

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
      member: clonePaliroMember(member),
    },
  }
  writeJson(PALIRO_FRIEND_REQUESTS_KEY, requestsByUser)
  return { type: 'success', status: 'pending' }
}

function getIncomingFriendRequestsByUser(userID) {
  const requestsByUser = readJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, {})
  const savedRequests = Array.isArray(requestsByUser[userID]) ? requestsByUser[userID] : []
  if (userID === testUser.id) {
    const fixtureRequests = PALIRO_TEST_INCOMING_REQUESTS.map((request) => {
      const savedRequest = savedRequests.find((item) => item.id === request.id)
      return {
        ...request,
        ...savedRequest,
        member: clonePaliroMember(request.member),
      }
    })
    const customRequests = savedRequests.filter((request) => !PALIRO_LEGACY_MOCK_MEMBER_IDS.has(request.member?.id))
    requestsByUser[userID] = [...fixtureRequests, ...customRequests]
  } else {
    requestsByUser[userID] = savedRequests
  }
  writeJson(PALIRO_INCOMING_FRIEND_REQUESTS_KEY, requestsByUser)
  return { requestsByUser, requests: requestsByUser[userID] }
}

function getConversationStateByUser(userID) {
  const conversationsByUser = readJson(PALIRO_MESSAGES_KEY, {})
  const savedConversations = Array.isArray(conversationsByUser[userID]) ? conversationsByUser[userID] : []
  if (userID === testUser.id) {
    const withoutRetiredFixtures = savedConversations.filter((conversation) => !(conversation.messages ?? []).some((message) => message.id === 'paliro-message-seoyun-1'))
    const hydratedConversations = withoutRetiredFixtures.map(clonePaliroConversation)
    const missingFixtures = PALIRO_TEST_CONVERSATIONS
      .filter((fixture) => !hydratedConversations.some((conversation) => conversation.member.id === fixture.member.id))
      .map(clonePaliroConversation)
    conversationsByUser[userID] = [...hydratedConversations, ...missingFixtures]
  } else {
    conversationsByUser[userID] = savedConversations
  }
  // Derive missing request rows from the persisted request, including requests sent before this UI existed.
  const outgoingRequests = readJson(PALIRO_FRIEND_REQUESTS_KEY, {})[userID] ?? {}
  const blockedIDs = new Set(paliroGetBlockedUsers(userID).map((member) => member.id))
  for (const [memberID, request] of Object.entries(outgoingRequests)) {
    if (!['pending', 'accepted'].includes(request.status) || blockedIDs.has(memberID)) continue
    let conversation = conversationsByUser[userID].find((item) => item.member?.id === memberID)
    const member = PALIRO_MOCK_MEMBER_BY_ID.get(memberID) ?? request.member ?? conversation?.member
    if (!member || member.id !== memberID) continue
    if (!conversation) {
      conversation = { member: clonePaliroMember(member), unreadCount: 0, messages: [] }
      conversationsByUser[userID].push(conversation)
    }
    const messageID = `paliro-request-message-${memberID}-${request.requestedAt}`
    if (!conversation.messages.some((message) => message.id === messageID)) {
      conversation.messages.push({ id: messageID, sender: 'self', type: 'friend-request', body: request.message || '', sentAt: request.requestedAt })
      conversation.messages.sort((left, right) => String(left.sentAt ?? '').localeCompare(String(right.sentAt ?? '')))
    }
  }
  writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  return { conversationsByUser, conversations: conversationsByUser[userID] }
}

export function paliroGetIncomingFriendRequests(userID, language = '') {
  if (!userID) return []
  const { requests } = getIncomingFriendRequestsByUser(userID)
  return requests
    .filter((request) => request.status === 'pending' && (!language || request.member?.language === language))
    .map((request) => ({ ...request, member: clonePaliroMember(PALIRO_MOCK_MEMBER_BY_ID.get(request.member?.id) ?? request.member) }))
}

export function paliroCanChatWithMember(userID, memberID) {
  if (!userID || !memberID) return false
  const social = paliroGetSocialState(userID)
  return social.followers.some((member) => member.id === memberID)
    && social.following.some((member) => member.id === memberID)
    && !paliroGetBlockedUsers(userID).some((member) => member.id === memberID)
}

export function paliroGetConversations(userID, language = '') {
  if (!userID) return []
  const { conversations } = getConversationStateByUser(userID)
  const requests = readJson(PALIRO_FRIEND_REQUESTS_KEY, {})[userID] ?? {}
  const blockedIDs = new Set(paliroGetBlockedUsers(userID).map((member) => member.id))
  return conversations.filter((conversation) => (!language || conversation.member?.language === language)
    && !blockedIDs.has(conversation.member?.id)
    && (paliroCanChatWithMember(userID, conversation.member?.id) || requests[conversation.member?.id]?.status === 'pending'))
    .map((conversation) => {
      const isLocked = !paliroCanChatWithMember(userID, conversation.member.id)
      return { ...clonePaliroConversation(conversation), isLocked, unreadCount: isLocked ? 0 : conversation.unreadCount }
    }).sort((left, right) => {
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
  if (!paliroCanChatWithMember(userID, member.id)) return null

  const { conversationsByUser, conversations } = getConversationStateByUser(userID)
  const existingConversation = conversations.find((conversation) => conversation.member.id === member.id)
  if (existingConversation) return clonePaliroConversation(existingConversation)

  const nextConversation = {
    member: clonePaliroMember(member),
    unreadCount: 0,
    messages: [{
      id: `paliro-message-friend-${crypto.randomUUID()}`,
      sender: 'friend',
      body: member.language === 'ko'
        ? '관심사 상자를 통해 연결되어 반가워요. 서로의 이야기를 나눠요.'
        : 'Thanks for connecting through a shared topic Box. I am looking forward to exchanging ideas respectfully.',
      sentAt: new Date().toISOString(),
    }],
  }
  conversationsByUser[userID] = [nextConversation, ...conversations]
  writeJson(PALIRO_MESSAGES_KEY, conversationsByUser)
  return clonePaliroConversation(nextConversation)
}

export function paliroMarkConversationRead(userID, memberID) {
  if (!paliroCanChatWithMember(userID, memberID)) return null
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
  if (!paliroCanChatWithMember(userID, memberID)) return { type: 'not-friends' }

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
  if (!userID || !memberID || !source || source.startsWith('blob:') || !Number.isFinite(durationSeconds) || durationSeconds < 1 || durationSeconds > 300) {
    return { type: 'invalid-audio' }
  }

  if (!paliroCanChatWithMember(userID, memberID)) return { type: 'not-friends' }

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

  const outgoingRequests = readJson(PALIRO_FRIEND_REQUESTS_KEY, {})
  const outgoing = outgoingRequests[userID]?.[request.member.id]
  if (outgoing?.status === 'pending') {
    outgoingRequests[userID][request.member.id] = { ...outgoing, status: 'accepted', respondedAt: new Date().toISOString() }
    writeJson(PALIRO_FRIEND_REQUESTS_KEY, outgoingRequests)
  }

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
