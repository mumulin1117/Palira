<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { paliroNativeService, paliroNativeFileSource } from './services/paliroNativeBridge'
import { paliroLaunchArtworkForLanguage } from './services/paliroLanguage'
import { createPaliroAccountApi, createPaliroCredentialStore, paliroAuthErrorKey } from './services/paliroAccountApi'
import { createPaliroServerSession } from './services/paliroServerSession'
import { paliroProfilePatch } from './services/paliroProfileSync'
import { createPaliroVoiceSession, PALIRO_VOICE_MAX_SECONDS } from './services/paliroVoiceSession'
import PaliroChatIcon from './components/PaliroChatIcon.vue'
import PaliroVideoCall from './components/PaliroVideoCall.vue'
import PaliroOverlayTransition from './components/PaliroOverlayTransition.vue'
import PaliroStateFeedback from './components/PaliroStateFeedback.vue'
import PaliroPullRefresh from './components/PaliroPullRefresh.vue'
import PaliroFirstLaunch from './components/PaliroFirstLaunch.vue'
import { claimPaliroFirstLaunch } from './services/paliroFirstLaunch'
import { usePaliroListRequest } from './services/paliroListRequest'
import { PALIRO_BOX_OPENING_MOTION } from './services/paliroBrandMotion'
import { paliroRequestCallPermissions } from './services/paliroVideoCall'
import { paliroBrowserVideoCover, paliroMediaErrorKey, paliroSelectVideo } from './services/paliroVideoSelection'
import { paliroPrimaryTabs, paliroRouteTransition } from './services/paliroNavigation'
import {
  PALIRO_BOX_ACTION_COST,
  PALIRO_COIN_PACKS,
  PALIRO_DAILY_BOX_LIMIT,
  PALIRO_MATCHED_FRIEND,
  paliroAcceptIncomingFriendRequest,
  paliroAddVideoComment,
  paliroAwardVideoBoxAction,
  paliroBlockMember,
  paliroCanChatWithMember,
  paliroAcceptServerUser,
  paliroCacheServerProfile,
  paliroDeleteLocalAccount,
  paliroCompleteTopicTest,
  paliroCreditCoinsFromIap,
  paliroCreateBoxPost,
  paliroCreateVideoPost,
  paliroDeleteBoxPost,
  paliroDeletePublishedVideo,
  paliroDeclineIncomingFriendRequest,
  paliroGetBlockedUsers,
  paliroGetBoxState,
  paliroGetAvailableMatchMembers,
  paliroGetEulaAccepted,
  paliroGetFriendRequestStatus,
  paliroGetConversation,
  paliroGetConversations,
  paliroGetIncomingFriendRequests,
  paliroGetOrCreateConversation,
  paliroGetPublishedVideos,
  paliroGetLanguagePreference,
  paliroGetMemberPosts,
  paliroGetPushPreference,
  paliroGetSocialState,
  paliroGetSocialSummary,
  paliroHasSeenBoxRules,
  paliroGetTopicTestState,
  paliroGetVideoFeed,
  paliroMarkConversationRead,
  paliroFollowMember,
  paliroHideVideo,
  paliroSeedUsers,
  paliroSetEulaAccepted,
  paliroSetBoxRulesSeen,
  paliroSetLanguagePreference,
  paliroSetPushPreference,
  paliroSignOut,
  paliroSaveTopicTestProgress,
  paliroSendFriendRequest,
  paliroSendConversationAudioMessage,
  paliroSendConversationMessage,
  paliroReportMember,
  paliroTakeAvailableMatchMember,
  paliroSpendBoxCoins,
  paliroToggleFollowMember,
  paliroToggleVideoCommentLike,
  paliroToggleVideoLike,
  paliroUnblockUser,
  paliroUseFreeBoxAction,
  paliroUpdateProfile,
} from './services/paliroLocalStore'
import { PALIRO_LOCALES, paliroGetLegalCopy, paliroTranslate, paliroTranslateMood } from './services/paliroI18n'

// Keep the WebView visually neutral until local launch state selects a screen.
const route = ref('boot')
const showFirstLaunch = ref(claimPaliroFirstLaunch(window.localStorage))
const launchArtwork = computed(() => paliroLaunchArtworkForLanguage(languagePreference.value))
const errorMessage = ref('')
const showEula = ref(false)
const hasAgreed = ref(false)
const session = ref(null)
const videoListRequest = usePaliroListRequest()
const messageListRequest = usePaliroListRequest()
const messageListScroll = ref(null)
const videoEmptyScroll = ref(null)
const authForm = ref({ email: '', password: '', confirmPassword: '' })
const authBusy = ref(false)
let authController = null
let registrationDraft = null
let incompleteAuth = null
const accountApi = createPaliroAccountApi()
const nativeLaunchScreen = paliroNativeService('PaliroLaunchScreen')
function syncNativeLaunchLanguage(language) {
  paliroSetLanguagePreference(null, language)
  void nativeLaunchScreen?.setLanguage({ language }).catch(() => {})
}
const serverSession = createPaliroServerSession({
  api: accountApi,
  credentials: createPaliroCredentialStore({ nativeStore: paliroNativeService('PaliroAuthStorage') }),
  acceptUser: paliroAcceptServerUser,
  clearLocalSession: paliroSignOut,
})
const showAuthPassword = ref(false)
const showConfirmPassword = ref(false)
const signupUser = ref(null)
const profileStep = ref(1)
const setupOrigin = ref('signup')
const setupScroll = ref(null)
const policyScroll = ref(null)
const policyOrigin = ref('welcome')
const boxState = ref(null)
const selectedBox = ref(null)
const boxSelectionAnimating = ref(null)
const showBoxRules = ref(false)
const homePageReady = ref(false)
const showCoinPrompt = ref(false)
const showBoxComposer = ref(false)
const showMediaSourcePicker = ref(false)
const composerImages = ref([])
const composerText = ref('')
const composerError = ref('')
const resumeComposerAfterWallet = ref(false)
const walletOrigin = ref('home')
const editableProfile = ref(null)
const editProfileError = ref('')
const editProfileNotice = ref('')
const profileLoading = ref(false)
const profileSaving = ref(false)
const profileReadNotice = ref('')
const profileSessionExpired = ref(false)
let profileController = null
let profileEditBase = null
const showProfilePhotoSourcePicker = ref(false)
const pushNotificationsEnabled = ref(true)
const showAccountDeletionNotice = ref(false)
const accountDeletionPassword = ref('')
const accountDeletionError = ref('')
const accountDeletionBusy = ref(false)
const accountDeletionExpired = ref(false)
const accountNotice = ref('')
const accountDeletionInput = ref(null)
const accountDeletionDialog = ref(null)
const pendingBoxAction = ref(null)
const coinPromptError = ref('')
const homeNotice = ref('')
const boxSelectionHintPulse = ref(0)
const boxSelectionAlertActive = ref(false)
let paliroBoxSelectionAlertTimer = null
const boxOpeningStage = ref('idle')
const boxOpeningKey = ref(0)
const makeBoxFlightStage = ref('idle')
const friendRequestStatus = ref('none')
const showFriendRequestModal = ref(false)
const friendRequestMessage = ref('')
const friendRequestSending = ref(false)
const friendRequestError = ref('')
const friendRequestDialog = ref(null)
const friendRequestTextarea = ref(null)
const matchPrimaryButton = ref(null)
const matchResultDialog = ref(null)
const matchedFriend = ref(PALIRO_MATCHED_FRIEND)
const reportReason = ref('')
const reportDetails = ref('')
const reportError = ref('')
const reportSubmitting = ref(false)
const reportOrigin = ref('home')
const profileReminder = ref('')
const profileReminderConfirm = ref(null)
watch(profileReminder, (value) => {
  if (value) nextTick(() => profileReminderConfirm.value?.focus({ preventScroll: true }))
})
const videoCallMember = ref(null)
const videoCallOrigin = ref('conversation')
const videoCallStarting = ref(false)
const friendProfileOrigin = ref('box')
const showFriendProfileActions = ref(false)
const showFriendProfileBlockConfirm = ref(false)
const friendProfileBlockDialog = ref(null)
const friendProfileBlockConfirm = ref(null)
watch(showFriendProfileBlockConfirm, (value) => {
  if (value) nextTick(() => friendProfileBlockConfirm.value?.focus({ preventScroll: true }))
})
const selectedWalletProductID = ref('')
const walletPurchaseLoading = ref(false)
const walletSelectionRequired = ref(false)
const walletDialogMessage = ref('')
const testStage = ref('intro')
const testStep = ref(0)
const testAnswers = ref([])
const testCompletionAwarded = ref(false)
const testAgeMin = ref(22)
const testAgeMax = ref(30)
const profileMeta = ref({ followers: 0, following: 0, posts: 0 })
const socialState = ref({ followers: [], following: [], posts: [] })
const socialDetail = ref('followers')
const socialSearch = ref('')
const conversations = ref([])
const incomingFriendRequests = ref([])
const activeConversation = ref(null)
const messageSearch = ref('')
const conversationDraft = ref('')
const conversationScroll = ref(null)
const conversationInput = ref(null)
const conversationError = ref('')
const conversationOrigin = ref('messages')
const conversationReturnProfileOrigin = ref('box')
const chatViewport = ref({ height: 0, top: 0, keyboard: false })
const voicePlaybackProgress = ref(0)
const voiceGestureCancelled = ref(false)
const voiceRecording = ref({ state: 'idle', durationSeconds: 0, source: '', error: '' })
const voiceRecordingBusy = ref(false)
const playingVoiceMessageID = ref('')
const acceptedFriend = ref(null)
const showFriendshipCelebration = ref(false)
const topicTestState = ref(null)
const blockedUsers = ref([])
const languagePreference = ref(paliroGetLanguagePreference())
const videoFeed = ref([])
const activeVideoIndex = ref(0)
const videoFeedScroll = ref(null)
const videoFeedPlayback = ref({})
const friendProfileVideoPlayback = ref({})
const videoReturnState = ref({ videoID: '', index: 0, scrollTop: 0 })
const isVideoFeedRestoring = ref(false)
const hasOpenedVideoFeed = ref(false)
const skipVideoRouteAnimation = ref(false)
const isPrimaryTabTransition = ref(false)
const userPausedVideoID = ref('')
const selectedVideo = ref(null)
const showVideoComments = ref(false)
const showVideoActions = ref(false)
const showVideoPublish = ref(false)
const showVideoReport = ref(false)
const videoCommentDraft = ref('')
const videoCommentError = ref('')
const videoReportReason = ref('')
const videoReportDetails = ref('')
const videoReportError = ref('')
const videoPublishDraft = ref({ source: '', title: '', caption: '' })
const videoPublishSource = ref('library')
const videoPublishError = ref('')
const videoPublishLoading = ref(false)
const videoSelectionBusy = ref(false)
const showVideoPublishReward = ref(false)
const videoRewardPending = ref(false)
const videoElements = new Map()
const friendProfileVideoElements = new Map()
let videoFeedObserver = null
let videoPlaybackRevision = 0

watch(route, (nextRoute, previousRoute) => {
  if (showAccountDeletionNotice.value && nextRoute !== 'settings') closeAccountDeletion()
  profileController?.abort()
  profileLoading.value = false
  if (nextRoute === 'me' || nextRoute === 'edit-profile') void refreshCurrentProfile(nextRoute)
  homePageReady.value = false
  if (nextRoute !== 'home') boxSelectionAnimating.value = null
  if (previousRoute === 'video-call' && nextRoute !== 'video-call') videoCallMember.value = null
  if (previousRoute === 'conversation' && nextRoute !== 'conversation') {
    stopVoicePlayback()
    void cancelVoiceRecording()
    dismissConversationKeyboard()
  }
  if (nextRoute === 'conversation') nextTick(() => { updateChatViewport(); scrollConversationToEnd(false) })
  const transition = paliroRouteTransition(previousRoute, nextRoute)
  skipVideoRouteAnimation.value = transition.skipVideo
  isPrimaryTabTransition.value = transition.primary
  if (previousRoute === 'friend-profile') clearFriendProfileVideoPlayback()
  if (nextRoute !== 'videos') return
  hasOpenedVideoFeed.value = true
  isVideoFeedRestoring.value = true
  nextTick(restoreVideoFeedViewport)
}, { flush: 'sync' })

watch(session, (nextSession, previousSession) => {
  if (nextSession?.userID === previousSession?.userID) return
  videoListRequest.reset()
  messageListRequest.reset()
  videoRewardPending.value = false
  showVideoPublishReward.value = false
  clearVideoFeedPlayback()
  hasOpenedVideoFeed.value = false
  videoFeed.value = []
  videoFeedPlayback.value = {}
  userPausedVideoID.value = ''
  videoReturnState.value = { videoID: '', index: 0, scrollTop: 0 }
}, { flush: 'sync' })

const avatars = [
  { key: 'violet', label: 'Violet', src: '/assets/paliro-avatar-violet@2x.png' },
  { key: 'blue', label: 'Blue', src: '/assets/paliro-avatar-blue@2x.png' },
  { key: 'coral', label: 'Coral', src: '/assets/paliro-avatar-coral@2x.png' },
  { key: 'mint', label: 'Mint', src: '/assets/paliro-avatar-mint@2x.png' },
  { key: 'golden', label: 'Golden', src: '/assets/paliro-avatar-golden@2x.png' },
]
const moods = [
  { label: 'Want to Chat', icon: '😊' },
  { label: 'Feeling Happy', icon: '🙂' },
  { label: 'A Little Shy', icon: '😆' },
  { label: 'Feeling Chill', icon: '😎' },
  { label: 'Ready for Fun', icon: '😄' },
  { label: 'A Little Lonely', icon: '😔' },
]
const interests = ['Gaming', 'Music', 'Travel', 'Fitness', 'Movies', 'Reading', 'Photography', 'Cooking', 'Art', 'Technology', 'Fashion', 'Sports', 'Anime', 'Dancing', 'Pets', 'Nature', 'Coffee', 'Nightlife']
const boxThemes = ['Curiosity', 'Shared Hobbies', 'Creative Sparks', 'Quiet Moments', 'New Perspectives', 'Playful Ideas']
const testQuestions = [
  { titleKey: 'testQuestionGender', options: ['Male', 'Female', 'Non-binary', 'Everyone'] },
  { titleKey: 'testQuestionAge', type: 'age' },
  { titleKey: 'testQuestionStyle', options: ['Text Lover - I enjoy long conversations', 'Voice Notes - I prefer talking', 'Video Calls - Face to face is best', 'Memes & GIFs - Keep it fun'] },
  {
    titleKey: 'testQuestionConnection',
    options: ['Shared interests', 'Emotional depth', 'Sense of humor', 'Ambition & goals'],
    optionIcons: {
      'Shared interests': 'shared-interests',
      'Emotional depth': 'emotional-depth',
      'Sense of humor': 'sense-of-humor',
      'Ambition & goals': 'ambition',
    },
  },
  {
    titleKey: 'testQuestionEnergy',
    options: ['Night owl', 'Early bird', 'Spontaneous explorer', 'Calm planner'],
    optionIcons: {
      'Night owl': 'night-owl',
      'Early bird': 'early-bird',
      'Spontaneous explorer': 'spontaneous-explorer',
      'Calm planner': 'calm-planner',
    },
  },
]
const paliroRoutes = new Set(['welcome', 'login', 'signup', 'setup', 'edit-profile', 'privacy', 'terms', 'home', 'videos', 'messages', 'conversation', 'video-call', 'friend-requests', 'wallet', 'test', 'friend-profile', 'report-user', 'me', 'my-videos', 'blocked-users', 'language', 'settings', 'social-detail'])
let paliroIapListener
let paliroOpeningPreviousFocus = null
const paliroOpeningTimers = new Set()
let voiceDurationTimer = null
let activeVoiceAudio = null
let voiceSession = null
let voiceRevision = 0
let voicePointer = null
let voiceStartPromise = null
let voiceSending = false
const nativeVoiceRecorder = paliroNativeService('PaliroVoiceRecorder')
const nativeCallPermissions = paliroNativeService('PaliroCallPermissions')
const nativeMediaPicker = paliroNativeService('PaliroMediaPicker')
let paliroVideoRestorePending = false

function createDefaultProfile() {
  return {
    avatar: avatars[0].key,
    nickname: '',
    mood: 'Want to Chat',
    bio: '',
    gender: 'Other',
    birthday: '',
    interests: [],
  }
}

const profile = ref(createDefaultProfile())
function avatarForProfile(memberProfile) {
  const fallback = avatars.find((avatar) => avatar.key === memberProfile?.avatar) ?? avatars[0]
  return memberProfile?.photoDataUrl ? { ...fallback, src: memberProfile.photoDataUrl } : fallback
}

const currentAvatar = computed(() => avatarForProfile(profile.value))
const currentMemberProfile = computed(() => ({ ...createDefaultProfile(), ...(session.value?.profile ?? {}) }))
const currentMemberAvatar = computed(() => avatarForProfile(currentMemberProfile.value))
const currentMemberAvatarSource = computed(() => currentMemberAvatar.value.src)
const birthdayIssue = computed(() => getBirthdayIssue(profile.value.birthday))
const boxActionLimit = computed(() => PALIRO_DAILY_BOX_LIMIT + (boxState.value?.bonusActions ?? 0) + (boxState.value?.videoBonusActions ?? 0))
const freeBoxActionsLeft = computed(() => Math.max(0, boxActionLimit.value - (boxState.value?.freeActionsUsed ?? 0)))
const makeBoxFreeCountLabel = computed(() => t('timeRemaining').replace('{count}', freeBoxActionsLeft.value))
const boxProgressStyle = computed(() => ({ width: `${(freeBoxActionsLeft.value / boxActionLimit.value) * 100}%` }))
const boxCoinBalance = computed(() => boxState.value?.coins ?? 0)
const pendingBoxActionLabel = computed(() => pendingBoxAction.value === 'make' ? t('createBoxAction') : t('openBoxAction'))
const isOpeningBox = computed(() => boxOpeningStage.value !== 'idle')
const isCreatingBox = computed(() => makeBoxFlightStage.value !== 'idle')
const isBoxActionLocked = computed(() => isOpeningBox.value || isCreatingBox.value)
const friendRequestButtonLabel = computed(() => friendRequestStatus.value === 'pending' ? t('requestSent') : t('addFriend'))
const isMatchedFollowing = computed(() => socialState.value.following.some((member) => member.id === matchedFriend.value.id))
const isMatchedFollower = computed(() => socialState.value.followers.some((member) => member.id === matchedFriend.value.id))
const isMatchedMutualFriend = computed(() => {
  void socialState.value
  void blockedUsers.value
  return paliroCanChatWithMember(session.value?.userID, matchedFriend.value.id)
})
const isMatchedBlocked = computed(() => blockedUsers.value.some((member) => member.id === matchedFriend.value.id))
const blockMemberDialogTitle = computed(() => {
  const handle = String(matchedFriend.value?.nickname || matchedFriend.value?.name || t('appName')).replace(/^@+/, '')
  return t('blockMemberTitle').replace('{name}', handle)
})
const matchedAbout = computed(() => matchedFriend.value.about || matchedFriend.value.bio)
const matchedMemberPosts = computed(() => paliroGetMemberPosts(matchedFriend.value))
const matchedBoxPost = computed(() => matchedMemberPosts.value.find((post) => post.contentType === 'box') ?? null)
const activeVideo = computed(() => videoFeed.value[activeVideoIndex.value] ?? null)
const selectedVideoComments = computed(() => selectedVideo.value?.comments ?? [])
const videoRewardAvailable = computed(() => boxState.value?.videoRewardDay !== currentLocalDayKey())
const publishedVideos = computed(() => {
  void videoFeed.value.length
  return paliroGetPublishedVideos(session.value?.userID)
})
const socialDetailTitle = computed(() => t(`${socialDetail.value}Title`))
const profilePosts = computed(() => [
  ...publishedVideos.value.map((video) => ({ ...video, contentType: 'video' })),
  ...(socialState.value.posts ?? []).map((post) => ({ ...post, contentType: 'box', coverImage: post.images?.[0] ?? '' })),
].sort((left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? ''))))
const socialDetailItems = computed(() => socialDetail.value === 'posts' ? profilePosts.value : socialState.value[socialDetail.value] ?? [])
const filteredSocialDetailItems = computed(() => {
  if (socialDetail.value === 'posts') return socialDetailItems.value
  const query = socialSearch.value.trim().toLocaleLowerCase()
  if (!query) return socialDetailItems.value
  return socialDetailItems.value.filter((member) => `${member.name ?? ''} ${member.userID ?? ''}`.toLocaleLowerCase().includes(query))
})
const socialDetailEmptyTitle = computed(() => t(`${socialDetail.value}EmptyTitle`))
const socialDetailEmptyCopy = computed(() => t(`${socialDetail.value}EmptyCopy`))
const currentMemberName = computed(() => currentMemberProfile.value.nickname || t('defaultNickname'))
const filteredConversations = computed(() => {
  const query = messageSearch.value.trim().toLocaleLowerCase()
  if (!query) return conversations.value
  return conversations.value.filter((conversation) => conversation.member.name.toLocaleLowerCase().includes(query)
    || messagePreview(conversation.messages.at(-1)).toLocaleLowerCase().includes(query))
})
const unreadConversationCount = computed(() => conversations.value.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0))
const canSendConversation = computed(() => {
  void socialState.value
  void blockedUsers.value
  return paliroCanChatWithMember(session.value?.userID, activeConversation.value?.member?.id)
})
const activePolicyCopy = computed(() => paliroGetLegalCopy(languagePreference.value, route.value === 'privacy' ? 'privacy' : 'terms'))
const activeEulaCopy = computed(() => paliroGetLegalCopy(languagePreference.value, 'eula'))
const walletCoinPacks = computed(() => PALIRO_COIN_PACKS.map((pack) => ({
  ...pack,
  displayPrice: pack.fallbackPrice,
})))
const selectedWalletPack = computed(() => walletCoinPacks.value.find((pack) => pack.productID === selectedWalletProductID.value) ?? null)
const testQuestion = computed(() => testQuestions[testStep.value])
const languageOptions = PALIRO_LOCALES
const meMenuItems = [
  { key: 'edit', labelKey: 'editProfile', icon: 'edit' },
  { key: 'wallet', labelKey: 'wallet', icon: 'wallet' },
  { key: 'videos', labelKey: 'myVideos', icon: 'videos' },
  { key: 'blocked', labelKey: 'blockedUsers', icon: 'blocked' },
  { key: 'language', labelKey: 'language', icon: 'language' },
  { key: 'settings', labelKey: 'settings', icon: 'settings' },
]
const reportReasons = ['reportReasonHarassment', 'reportReasonSpam', 'reportReasonInappropriate', 'reportReasonFakeProfile', 'reportReasonUnderage', 'reportReasonOther']

async function revealWebContent() {
  await nextTick()
  const bootImage = document.querySelector('.paliro-boot > img')
  if (bootImage?.decode) {
    await Promise.race([bootImage.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 800))])
  }
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      void nativeLaunchScreen?.hide().catch(() => {})
    })
  })
}

function finishFirstLaunch() {
  showFirstLaunch.value = false
  if (!authBusy.value && route.value === 'welcome' && !hasAgreed.value) showEula.value = true
}

const pageTitle = computed(() => ({
  login: t('welcomeBack'),
  signup: t('createYourBox'),
  setup: t('setupProfile'),
  privacy: t('privacyPolicy'),
  terms: t('terms'),
}[route.value] ?? ''))

onMounted(() => {
  paliroSeedUsers()
  hasAgreed.value = paliroGetEulaAccepted()
  syncNativeLaunchLanguage(languagePreference.value)
  void restoreServerSession()
  void revealWebContent()
  applyLocale()
  void setupNativeIapBridge()
  window.addEventListener('popstate', syncRouteFromLocation)
  document.addEventListener('visibilitychange', handleDocumentVisibilityChange)
  window.visualViewport?.addEventListener('resize', updateChatViewport)
  window.visualViewport?.addEventListener('scroll', updateChatViewport)
  window.addEventListener('resize', updateChatViewport)
})

onBeforeUnmount(() => {
  videoListRequest.reset()
  messageListRequest.reset()
  profileController?.abort()
  authController?.abort()
  window.removeEventListener('popstate', syncRouteFromLocation)
  document.removeEventListener('visibilitychange', handleDocumentVisibilityChange)
  window.visualViewport?.removeEventListener('resize', updateChatViewport)
  window.visualViewport?.removeEventListener('scroll', updateChatViewport)
  window.removeEventListener('resize', updateChatViewport)
  if (paliroBoxSelectionAlertTimer) window.clearTimeout(paliroBoxSelectionAlertTimer)
  paliroIapListener?.remove?.()
  clearOpeningTimers()
  clearVideoFeedPlayback()
  clearFriendProfileVideoPlayback()
  stopVoicePlayback()
  void cancelVoiceRecording()
})

function syncRouteFromLocation() {
  if (authBusy.value || profileSaving.value || accountDeletionBusy.value) {
    window.history.replaceState({ route: route.value }, '', `#/${route.value}`)
    return
  }
  let nextRoute = window.location.hash.replace(/^#\//, '')
  if (!session.value && !['welcome', 'login', 'signup', 'privacy', 'terms'].includes(nextRoute)) nextRoute = 'welcome'
  if (nextRoute === 'video-call' && !videoCallMember.value) nextRoute = session.value ? 'messages' : 'welcome'
  if (nextRoute === 'conversation' && !paliroCanChatWithMember(session.value?.userID, activeConversation.value?.member?.id)) nextRoute = session.value ? 'messages' : 'welcome'
  if (route.value === 'videos' && nextRoute !== 'videos') {
    captureVideoFeedState()
    clearVideoFeedPlayback()
  }
  route.value = paliroRoutes.has(nextRoute) ? nextRoute : 'welcome'
  if (route.value === 'videos' && session.value) {
    loadVideoFeed(videoReturnState.value.videoID)
    paliroVideoRestorePending = Boolean(videoReturnState.value.videoID)
    isVideoFeedRestoring.value = paliroVideoRestorePending
  }
  scheduleScrollReset()
}

function openRoute(nextRoute) {
  if (authBusy.value || profileSaving.value || accountDeletionBusy.value) return
  if (!session.value && !['welcome', 'login', 'signup', 'privacy', 'terms', 'setup'].includes(nextRoute)) nextRoute = 'welcome'
  if (nextRoute === 'conversation' && !paliroCanChatWithMember(session.value?.userID, activeConversation.value?.member?.id)) nextRoute = 'messages'
  errorMessage.value = ''
  if (route.value === 'videos' && nextRoute !== 'videos') {
    captureVideoFeedState()
    clearVideoFeedPlayback()
  }
  route.value = nextRoute
  window.history.pushState({ route: nextRoute }, '', `#/${nextRoute}`)
  scheduleScrollReset()
}

function openPrimaryTab(nextRoute) {
  if (nextRoute === route.value) return
  if (nextRoute === 'videos') openVideoFeed()
  else if (nextRoute === 'messages') openMessages()
  else if (nextRoute === 'me') openMe()
  else if (nextRoute === 'home') openRoute('home')
}

function t(key) {
  return paliroTranslate(languagePreference.value, key)
}

function currentLocalDayKey() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function localizedMood(mood) {
  return paliroTranslateMood(languagePreference.value, mood)
}

function localizedTestOption(option) {
  return t(`testOption${option.replace(/[^a-zA-Z0-9]/g, '')}`)
}

function localizedGender(option) {
  return t(`gender${option}`)
}

function memberAvatarSource(member) {
  if (member?.photoDataUrl) return member.photoDataUrl
  const preset = avatars.find((avatar) => avatar.key === member?.avatar)
  return preset?.src || member?.avatar || avatars[0].src
}

function commentAvatarSource(comment) {
  if (comment?.authorAvatar) return memberAvatarSource({ avatar: comment.authorAvatar })
  return comment?.authorName === currentMemberName.value ? currentMemberAvatarSource.value : ''
}

function applyLocale() {
  const isKorean = languagePreference.value === 'ko'
  document.documentElement.lang = isKorean ? 'ko' : 'en'
  document.title = isKorean ? '팔리로: 미스터리 박스' : 'Paliro: Mystery Box, Meet People'
  const artwork = launchArtwork.value
  document.documentElement.style.setProperty('--paliro-launch-image', isKorean
    ? `image-set(url("${artwork.src}") 2x, url("/assets/paliro-launch-screen-ko@3x.png") 3x)`
    : `url("${artwork.src}")`)
}

function openPolicy(policyRoute, origin = 'welcome') {
  policyOrigin.value = origin
  openRoute(policyRoute)
}

function resetPageScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.body.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  setupScroll.value?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  policyScroll.value?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

function scheduleScrollReset() {
  requestAnimationFrame(resetPageScroll)
}

function saveAgreement(value) {
  hasAgreed.value = value
  paliroSetEulaAccepted(value)
}

function agreeToEula() {
  saveAgreement(true)
  showEula.value = false
}

function cancelEula() {
  showEula.value = false
}

function validateAuth() {
  if (!authForm.value.email.trim() || !authForm.value.password) {
    errorMessage.value = t('authMissingFields')
    return false
  }
  if (!/^\S+@\S+\.\S+$/.test(authForm.value.email)) {
    errorMessage.value = t('authInvalidEmail')
    return false
  }
  return true
}

function enterMain(localSession, nextRoute = 'home') {
  accountNotice.value = ''
  session.value = localSession
  registrationDraft = null
  incompleteAuth = null
  authForm.value = { email: '', password: '', confirmPassword: '' }
  route.value = nextRoute
  window.history.replaceState({ route: nextRoute }, '', `#/${nextRoute}`)
  loadBoxState()
  loadMeState()
  loadMessageState()
}

async function restoreServerSession() {
  authBusy.value = true
  authController = new AbortController()
  try {
    const restored = await serverSession.restore(authController.signal)
    if (restored) enterMain(restored)
    else route.value = 'welcome'
  } catch (error) {
    if (error.code !== 'CANCELLED') {
      route.value = 'welcome'
      errorMessage.value = t(paliroAuthErrorKey(error))
    }
  } finally {
    authBusy.value = false
    showEula.value = !showFirstLaunch.value && route.value === 'welcome' && !hasAgreed.value
  }
}

async function submitLogin() {
  if (authBusy.value || !validateAuth()) return
  authBusy.value = true
  errorMessage.value = ''
  authController = new AbortController()
  try {
    const result = await accountApi.login(authForm.value.email, authForm.value.password, authController.signal)
    if (!result.user.profileComplete) {
      incompleteAuth = result
      authBusy.value = false
      beginProfileSetup(result.user, 'login')
      return
    }
    enterMain(await serverSession.accept(result, authController.signal))
  } catch (error) {
    if (error.code !== 'CANCELLED') errorMessage.value = t(paliroAuthErrorKey(error))
  } finally { authBusy.value = false }
}

function submitSignup() {
  if (authBusy.value || !validateAuth()) return
  if (authForm.value.password.length < 8) {
    errorMessage.value = t('authPasswordMinLength')
    return
  }
  if (authForm.value.password !== authForm.value.confirmPassword) {
    errorMessage.value = t('authPasswordsMismatch')
    return
  }
  registrationDraft = { email: authForm.value.email.trim(), password: authForm.value.password }
  beginProfileSetup(null, 'signup')
}

function beginProfileSetup(user, origin) {
  signupUser.value = user
  setupOrigin.value = origin
  profile.value = { ...createDefaultProfile(), ...(user?.profile ?? {}) }
  profileStep.value = 1
  openRoute('setup')
}

function goBackFromProfile() {
  if (authBusy.value) return
  errorMessage.value = ''
  if (profileStep.value > 1) {
    profileStep.value -= 1
    scheduleScrollReset()
    return
  }
  openRoute(setupOrigin.value)
}

function toggleInterest(interest) {
  if (authBusy.value) return
  const selected = profile.value.interests
  if (selected.includes(interest)) {
    profile.value.interests = selected.filter((item) => item !== interest)
  } else if (selected.length < 20) {
    profile.value.interests = [...selected, interest]
  }
}

function getBirthdayIssue(birthday) {
  if (!birthday) return ''

  const [year, month, day] = birthday.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)
    || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return t('birthdayInvalid')
  }

  const today = new Date()
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (date > currentDate) return t('birthdayPast')

  let age = today.getFullYear() - year
  const hasHadBirthdayThisYear = today.getMonth() > month - 1
    || (today.getMonth() === month - 1 && today.getDate() >= day)
  if (!hasHadBirthdayThisYear) age -= 1

  return age < 18
    ? t('signupAdultOnly')
    : ''
}

async function nextProfileStep() {
  if (authBusy.value) return
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  if (profileStep.value === 1 && !profile.value.nickname.trim()) {
    errorMessage.value = t('nicknameRequired')
    return
  }
  if (profileStep.value === 2) {
    if (!profile.value.bio.trim() || !profile.value.birthday) {
      errorMessage.value = t('profileRequired')
      return
    }
    if (birthdayIssue.value) {
      errorMessage.value = birthdayIssue.value
      return
    }
  }
  if (profileStep.value === 3) {
    if (profile.value.interests.length < 3) {
      errorMessage.value = t('interestsRequired')
      return
    }
    if (setupOrigin.value === 'me') {
      enterMain(paliroUpdateProfile(signupUser.value.id, profile.value), 'me')
      return
    }
    if (!hasAgreed.value) { errorMessage.value = t('authTermsRequired'); return }
    authBusy.value = true
    errorMessage.value = ''
    authController = new AbortController()
    try {
      const result = setupOrigin.value === 'login' && incompleteAuth
        ? { ...incompleteAuth, user: await accountApi.updateProfile(incompleteAuth.accessToken, { ...profile.value, language: languagePreference.value }, authController.signal) }
        : await accountApi.register(registrationDraft, profile.value, languagePreference.value, hasAgreed.value, authController.signal)
      enterMain(await serverSession.accept(result, authController.signal))
    } catch (error) {
      if (error.code !== 'CANCELLED') errorMessage.value = t(paliroAuthErrorKey(error))
    } finally { authBusy.value = false }
    return
  }
  errorMessage.value = ''
  profileStep.value += 1
  scheduleScrollReset()
}

async function leaveHome() {
  if (authBusy.value || profileSaving.value || accountDeletionBusy.value) return
  closeAccountDeletion()
  profileController?.abort()
  authBusy.value = true
  session.value = null
  registrationDraft = null
  incompleteAuth = null
  authForm.value = { email: '', password: '', confirmPassword: '' }
  showBoxRules.value = false
  route.value = 'welcome'
  window.history.replaceState({ route: 'welcome' }, '', '#/welcome')
  try { await serverSession.logout() }
  catch (error) { errorMessage.value = t(paliroAuthErrorKey(error)) }
  finally { authBusy.value = false }
}

function loadBoxState() {
  boxState.value = paliroGetBoxState(session.value?.userID)
  friendRequestStatus.value = paliroGetFriendRequestStatus(session.value?.userID, matchedFriend.value.id)
  if (!paliroHasSeenBoxRules(session.value?.userID)) {
    showBoxRules.value = true
  }
}

function loadMeState() {
  const userID = session.value?.userID
  languagePreference.value = paliroGetLanguagePreference(userID)
  syncNativeLaunchLanguage(languagePreference.value)
  socialState.value = paliroGetSocialState(userID, languagePreference.value)
  profileMeta.value = paliroGetSocialSummary(userID, languagePreference.value)
  topicTestState.value = paliroGetTopicTestState(userID)
  blockedUsers.value = paliroGetBlockedUsers(userID)
  pushNotificationsEnabled.value = paliroGetPushPreference(userID)
}

function loadMessageState() {
  const userID = session.value?.userID
  conversations.value = paliroGetConversations(userID, languagePreference.value)
  incomingFriendRequests.value = paliroGetIncomingFriendRequests(userID, languagePreference.value)
}

function openMessages() {
  messageSearch.value = ''
  activeConversation.value = null
  loadMessageState()
  openRoute('messages')
  if (!messageListRequest.ready.value) void requestMessageList()
}

async function requestMessageList() {
  await messageListRequest.run(() => loadMessageState())
}

async function requestVideoList() {
  const loaded = await videoListRequest.run(() => loadVideoFeed(activeVideo.value?.id || videoReturnState.value.videoID))
  if (loaded && route.value === 'videos') {
    await nextTick()
    setupVideoFeedPlayback()
  }
}

function videoSource(source) {
  if (!source?.startsWith?.('file://')) return source
  return paliroNativeFileSource(source)
}

function loadVideoFeed(preferredVideoID = activeVideo.value?.id) {
  const nextFeed = paliroGetVideoFeed(session.value?.userID, languagePreference.value)
  const nextIndex = Math.max(0, nextFeed.findIndex((video) => video.id === preferredVideoID))
  videoFeed.value = nextFeed
  activeVideoIndex.value = nextIndex
  if (selectedVideo.value) selectedVideo.value = nextFeed.find((video) => video.id === selectedVideo.value.id) ?? null
}

function setVideoElement(videoID, element) {
  if (element) videoElements.set(videoID, element)
  else videoElements.delete(videoID)
}

function clearVideoFeedPlayback() {
  videoPlaybackRevision += 1
  videoFeedObserver?.disconnect()
  videoFeedObserver = null
  videoElements.forEach((element) => element.pause())
}

function captureVideoFeedState(preferredVideoID = activeVideo.value?.id) {
  const matchedIndex = videoFeed.value.findIndex((video) => video.id === preferredVideoID)
  videoReturnState.value = {
    videoID: preferredVideoID || '',
    index: matchedIndex >= 0 ? matchedIndex : activeVideoIndex.value,
    scrollTop: videoFeedScroll.value?.scrollTop ?? 0,
  }
}

function setVideoFeedPlayback(videoID, isPlaying) {
  if (isPlaying && (route.value !== 'videos' || document.hidden || activeVideo.value?.id !== videoID)) {
    videoElements.get(videoID)?.pause()
    return
  }
  videoFeedPlayback.value = { ...videoFeedPlayback.value, [videoID]: isPlaying }
}

function setFriendProfileVideoElement(postID, element) {
  if (element) {
    friendProfileVideoElements.set(postID, element)
  } else {
    friendProfileVideoElements.delete(postID)
  }
}

function setFriendProfileVideoPlayback(postID, isPlaying) {
  friendProfileVideoPlayback.value = { ...friendProfileVideoPlayback.value, [postID]: isPlaying }
}

function toggleFriendProfileVideo(post) {
  const element = friendProfileVideoElements.get(post?.id)
  if (!element) return
  if (element.paused) {
    element.play().catch(() => setFriendProfileVideoPlayback(post.id, false))
  } else {
    element.pause()
  }
}

function clearFriendProfileVideoPlayback() {
  friendProfileVideoElements.forEach((element) => element.pause())
  friendProfileVideoPlayback.value = {}
}

function playActiveVideo(index) {
  if (route.value !== 'videos' || document.hidden) return
  activeVideoIndex.value = index
  const activeID = videoFeed.value[index]?.id
  videoElements.forEach((element, videoID) => {
    if (videoID !== activeID) element.pause()
  })
  const activeElement = videoElements.get(activeID)
  if (!activeElement) return
  userPausedVideoID.value = ''
  const revision = ++videoPlaybackRevision
  activeElement.play().catch(() => {
    if (revision !== videoPlaybackRevision || route.value !== 'videos' || document.hidden) return
    userPausedVideoID.value = activeID
    setVideoFeedPlayback(activeID, false)
  })
}

function setupVideoFeedPlayback() {
  videoFeedObserver?.disconnect()
  const setupRevision = ++videoPlaybackRevision
  nextTick(() => {
    const root = videoFeedScroll.value
    if (!root || route.value !== 'videos' || document.hidden || setupRevision !== videoPlaybackRevision) return
    const observer = new IntersectionObserver((entries) => {
      if (videoFeedObserver !== observer || route.value !== 'videos' || document.hidden || isVideoFeedRestoring.value) return
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]
      if (!visibleEntry) return
      const index = Number(visibleEntry.target.dataset.videoIndex)
      if (Number.isInteger(index) && index !== activeVideoIndex.value) playActiveVideo(index)
    }, { root, threshold: [0.56, 0.78, 0.95] })
    videoFeedObserver = observer
    videoElements.forEach((element) => {
      const slide = element.closest('.paliro-video-slide')
      if (slide) videoFeedObserver?.observe(slide)
    })
    playActiveVideo(activeVideoIndex.value)
  })
}

function positionVideoFeedViewport(root = videoFeedScroll.value) {
  if (!root || route.value !== 'videos') return false
  const matchedIndex = videoFeed.value.findIndex((video) => video.id === videoReturnState.value.videoID)
  const index = matchedIndex >= 0
    ? matchedIndex
    : Math.min(videoReturnState.value.index, Math.max(0, videoFeed.value.length - 1))
  if (paliroVideoRestorePending) {
    activeVideoIndex.value = index
    const slide = root.querySelector(`[data-video-index="${index}"]`)
    const top = slide?.offsetTop ?? videoReturnState.value.scrollTop
    // A retained player already at its slide needs no new scroll/compositor update.
    if (Math.abs(root.scrollTop - top) > 1) root.scrollTo({ top, left: 0, behavior: 'auto' })
    paliroVideoRestorePending = false
  }
  return true
}

function restoreVideoFeedViewport() {
  if (route.value !== 'videos') return
  positionVideoFeedViewport()
  userPausedVideoID.value = ''
  isVideoFeedRestoring.value = false
  setupVideoFeedPlayback()
}

function handleDocumentVisibilityChange() {
  if (document.hidden) {
    stopVoicePlayback()
    if (voiceRecording.value.state === 'recording') void pauseVoiceRecording()
    else if (voiceRecording.value.state === 'starting') void cancelVoiceRecording()
    if (route.value === 'videos') captureVideoFeedState()
    clearVideoFeedPlayback()
    return
  }
  if (route.value === 'videos') {
    paliroVideoRestorePending = true
    restoreVideoFeedViewport()
  }
}

function openVideoFeed() {
  loadMeState()
  if (videoListRequest.ready.value) loadVideoFeed(videoReturnState.value.videoID || activeVideo.value?.id)
  paliroVideoRestorePending = Boolean(videoReturnState.value.videoID)
  isVideoFeedRestoring.value = paliroVideoRestorePending
  openRoute('videos')
  if (!videoListRequest.ready.value) void requestVideoList()
}

function restoreVideoFeed({ refresh = false } = {}) {
  const preferredVideoID = videoReturnState.value.videoID
  loadMeState()
  if (refresh || !videoFeed.value.length) loadVideoFeed(preferredVideoID)
  paliroVideoRestorePending = true
  isVideoFeedRestoring.value = true
  openRoute('videos')
}

function toggleVideoPlayback(video = activeVideo.value) {
  const element = videoElements.get(video?.id)
  if (!element) return
  if (element.paused) playActiveVideo(videoFeed.value.findIndex((item) => item.id === video.id))
  else {
    videoPlaybackRevision += 1
    userPausedVideoID.value = video.id
    element.pause()
  }
}

function isFollowingVideoMember(video) {
  return Boolean(video?.member?.id) && socialState.value.following.some((member) => member.id === video.member.id)
}

function isOwnVideo(video) {
  return video?.member?.userID === session.value?.userID
}

function toggleVideoFollow(video) {
  if (!video?.member || isOwnVideo(video)) return
  const result = paliroToggleFollowMember(session.value?.userID, video.member)
  if (result.type === 'success') {
    socialState.value = result.state
    profileMeta.value = paliroGetSocialSummary(session.value?.userID)
  }
}

function toggleVideoLike(video) {
  if (!video) return
  if (paliroToggleVideoLike(session.value?.userID, video.id).type === 'success') loadVideoFeed(video.id)
}

function openVideoComments(video) {
  selectedVideo.value = video
  videoCommentDraft.value = ''
  videoCommentError.value = ''
  showVideoComments.value = true
}

function submitVideoComment() {
  if (!selectedVideo.value) return
  const result = paliroAddVideoComment(session.value?.userID, selectedVideo.value.id, videoCommentDraft.value)
  if (result.type !== 'success') {
    videoCommentError.value = t('videoCommentRequired')
    return
  }
  videoCommentDraft.value = ''
  videoCommentError.value = ''
  loadVideoFeed(selectedVideo.value.id)
}

function toggleVideoCommentLike(comment) {
  if (!selectedVideo.value || !comment) return
  if (paliroToggleVideoCommentLike(session.value?.userID, selectedVideo.value.id, comment.id).type === 'success') {
    loadVideoFeed(selectedVideo.value.id)
  }
}

function openVideoActions(video) {
  selectedVideo.value = video
  showVideoActions.value = true
}

function hideSelectedVideo() {
  if (selectedVideo.value) paliroHideVideo(session.value?.userID, selectedVideo.value.id)
  showVideoActions.value = false
  loadVideoFeed()
}

function openVideoReport() {
  showVideoActions.value = false
  videoReportReason.value = ''
  videoReportDetails.value = ''
  videoReportError.value = ''
  showVideoReport.value = true
}

function submitVideoReport() {
  if (!selectedVideo.value || !videoReportReason.value) {
    videoReportError.value = t('reportReasonRequired')
    return
  }
  const result = paliroReportMember(
    session.value?.userID,
    selectedVideo.value.member,
    t(videoReportReason.value),
    videoReportDetails.value,
  )
  if (result.type !== 'success') {
    videoReportError.value = t('reportReasonRequired')
    return
  }
  blockedUsers.value = result.blockedUsers
  showVideoReport.value = false
  selectedVideo.value = null
  loadMeState()
  loadMessageState()
  loadVideoFeed()
}

function blockSelectedVideoMember() {
  if (!selectedVideo.value) return
  const result = paliroBlockMember(
    session.value?.userID,
    selectedVideo.value.member,
  )
  if (result.type === 'success') {
    blockedUsers.value = result.blockedUsers
    loadMeState()
    loadMessageState()
  }
  showVideoActions.value = false
  selectedVideo.value = null
  loadVideoFeed()
}

function openVideoMemberProfile(video) {
  if (isOwnVideo(video)) { openMe(); return }
  clearFriendProfileVideoPlayback()
  const index = videoFeed.value.findIndex((item) => item.id === video.id)
  if (index >= 0) activeVideoIndex.value = index
  captureVideoFeedState(video.id)
  matchedFriend.value = video.member
  friendRequestStatus.value = paliroGetFriendRequestStatus(session.value?.userID, video.member.id)
  friendProfileOrigin.value = 'videos'
  loadMeState()
  openRoute('friend-profile')
}

function openVideoPublish() {
  videoPublishDraft.value = { source: '', thumbnail: '', title: '', caption: '' }
  videoPublishSource.value = 'library'
  videoPublishError.value = ''
  showVideoPublishReward.value = false
  showVideoPublish.value = true
}

function selectVideoPublishSource(source) {
  if (videoSelectionBusy.value) return
  videoPublishSource.value = source
  videoPublishError.value = ''
}

function beginVideoSelection() {
  pickVideoForPublish(videoPublishSource.value)
}

function pickBrowserVideo() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.oncancel = () => resolve(null)
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      if (file.size > 32 * 1024 * 1024) { reject({ code: 'VIDEO_TOO_LARGE' }); return }
      const fileUri = URL.createObjectURL(file)
      try { resolve({ fileUri, thumbnail: await paliroBrowserVideoCover(fileUri) }) }
      catch (error) { URL.revokeObjectURL(fileUri); reject(error) }
    }
    input.click()
  })
}

async function pickVideoForPublish(source) {
  if (videoSelectionBusy.value || videoPublishLoading.value) return
  videoSelectionBusy.value = true
  videoPublishError.value = ''
  const draft = videoPublishDraft.value
  try {
    const result = await paliroSelectVideo({ source, nativePicker: getPaliroMediaPicker(), browserPicker: pickBrowserVideo })
    if (!result) return
    if (!showVideoPublish.value || videoPublishDraft.value !== draft) {
      if (result.source.startsWith('blob:')) URL.revokeObjectURL(result.source)
      return
    }
    if (draft.source.startsWith('blob:')) URL.revokeObjectURL(draft.source)
    videoPublishDraft.value = { ...draft, ...result }
  } catch (error) {
    if (showVideoPublish.value && videoPublishDraft.value === draft) videoPublishError.value = t(paliroMediaErrorKey(error))
  } finally { videoSelectionBusy.value = false }
}

function closeVideoPublish() {
  if (videoSelectionBusy.value || videoPublishLoading.value) return
  if (videoPublishDraft.value.source.startsWith('blob:')) URL.revokeObjectURL(videoPublishDraft.value.source)
  showVideoPublish.value = false
}

function publishVideo() {
  if (!showVideoPublish.value || videoPublishLoading.value || videoSelectionBusy.value) return
  if (!videoPublishDraft.value.source || !videoPublishDraft.value.caption.trim()) {
    videoPublishError.value = t('videoPublishRequired')
    return
  }
  videoPublishLoading.value = true
  let post
  try { post = paliroCreateVideoPost(session.value?.userID, {
    ...videoPublishDraft.value,
    language: languagePreference.value,
  }) } catch { videoPublishError.value = t('videoPublishFailed'); return }
  finally { videoPublishLoading.value = false }
  if (!post) { videoPublishError.value = t('videoPublishFailed'); return }
  const reward = paliroAwardVideoBoxAction(session.value?.userID)
  if (reward.state) boxState.value = reward.state
  showVideoPublish.value = false
  loadMeState()
  loadVideoFeed(post.id)
  nextTick(() => videoFeedScroll.value?.scrollTo({ top: 0, behavior: 'smooth' }))
  if (reward.type === 'success') {
    videoRewardPending.value = true
    showVideoPublishReward.value = true
  }
}

function finishVideoRewardFeedback(event) {
  if (['paliro-reward-progress', 'paliro-reward-progress-reduced'].includes(event.animationName) && event.target === event.currentTarget) videoRewardPending.value = false
}

function formatConversationTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ''
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  return isToday
    ? date.toLocaleTimeString(languagePreference.value === 'ko' ? 'ko-KR' : 'en-US', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString(languagePreference.value === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })
}

function messagePreview(message) {
  if (message?.type === 'friend-request' && !message.body) return t('requestSent')
  return message?.type === 'audio' ? t('voiceMessage') : message?.body ?? ''
}

function formatVoiceDuration(value) {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0))
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function scrollConversationToEnd(smooth = true) {
  nextTick(() => conversationScroll.value?.scrollTo({ top: conversationScroll.value.scrollHeight, behavior: smooth === true ? 'smooth' : 'auto' }))
}

function updateChatViewport() {
  if (route.value !== 'conversation' && !showAccountDeletionNotice.value) return
  const viewport = window.visualViewport
  const height = viewport?.height ?? window.innerHeight
  const wasNearEnd = !conversationScroll.value || conversationScroll.value.scrollHeight - conversationScroll.value.scrollTop - conversationScroll.value.clientHeight < 80
  chatViewport.value = { height, top: viewport?.offsetTop ?? 0, keyboard: window.innerHeight - height > 100 }
  if (route.value === 'conversation' && (wasNearEnd || document.activeElement === conversationInput.value)) scrollConversationToEnd(false)
}

function dismissConversationKeyboard(event) {
  if (event?.target?.closest('button, input, textarea')) return
  conversationInput.value?.blur()
}

function ensureConversationPermission() {
  if (paliroCanChatWithMember(session.value?.userID, activeConversation.value?.member?.id)) return true
  profileReminder.value = 'message'
  return false
}

function clearVoiceDurationTimer() {
  clearInterval(voiceDurationTimer)
  voiceDurationTimer = null
}

function startVoiceDurationTimer() {
  clearVoiceDurationTimer()
  voiceDurationTimer = window.setInterval(() => {
    if (voiceRecording.value.state !== 'recording') return
    voiceRecording.value.durationSeconds = voiceSession?.duration() ?? 0
    if (voiceRecording.value.durationSeconds >= PALIRO_VOICE_MAX_SECONDS) void stopVoiceRecording()
  }, 100)
}

function voiceRecordingError(error) {
  if (error?.code === 'AUDIO_INPUT_UNAVAILABLE') return t('voiceInputUnavailable')
  const message = String(error?.name ?? '') + ' ' + String(error?.message ?? error ?? '')
  return /permission|denied|notallowed|not granted/i.test(message) ? t('voicePermissionDenied') : t('voiceRecordingFailed')
}

async function startVoiceRecording() {
  if (!activeConversation.value || voiceRecordingBusy.value || voiceRecording.value.state !== 'idle' || !ensureConversationPermission()) return
  dismissConversationKeyboard()
  stopVoicePlayback()
  conversationError.value = ''
  voiceRecordingBusy.value = true
  const revision = ++voiceRevision
  voiceSession = createPaliroVoiceSession({ nativeRecorder: nativeVoiceRecorder })
  voiceRecording.value = { state: 'starting', durationSeconds: 0, source: '', error: '' }
  try {
    const started = await voiceSession.start()
    if (!started || revision !== voiceRevision || route.value !== 'conversation') return
    voiceRecording.value = { state: 'recording', durationSeconds: 0, source: '', error: '' }
    startVoiceDurationTimer()
  } catch (error) {
    if (revision === voiceRevision) voiceRecording.value = { state: 'idle', durationSeconds: 0, source: '', error: voiceRecordingError(error) }
  } finally {
    if (revision === voiceRevision) voiceRecordingBusy.value = false
  }
}

async function pauseVoiceRecording() {
  if (voiceRecording.value.state !== 'recording' || voiceRecordingBusy.value) return
  const revision = voiceRevision
  voiceRecordingBusy.value = true
  try {
    await voiceSession.pause()
    if (revision !== voiceRevision) return
    clearVoiceDurationTimer()
    voiceRecording.value = { ...voiceRecording.value, state: 'paused', durationSeconds: voiceSession.duration(), error: '' }
  } catch (error) {
    if (revision === voiceRevision) voiceRecording.value.error = voiceRecordingError(error)
  } finally { if (revision === voiceRevision) voiceRecordingBusy.value = false }
}

async function resumeVoiceRecording() {
  if (voiceRecording.value.state !== 'paused' || voiceRecordingBusy.value || !ensureConversationPermission()) return
  const revision = voiceRevision
  voiceRecordingBusy.value = true
  try {
    await voiceSession.resume()
    if (revision !== voiceRevision) return
    voiceRecording.value = { ...voiceRecording.value, state: 'recording', error: '' }
    startVoiceDurationTimer()
  } catch (error) {
    if (revision === voiceRevision) voiceRecording.value.error = voiceRecordingError(error)
  } finally { if (revision === voiceRevision) voiceRecordingBusy.value = false }
}

async function stopVoiceRecording() {
  if (!['recording', 'paused'].includes(voiceRecording.value.state) || voiceRecordingBusy.value) return
  const revision = voiceRevision
  voiceRecordingBusy.value = true
  clearVoiceDurationTimer()
  voiceRecording.value = { ...voiceRecording.value, state: 'stopping' }
  try {
    const draft = await voiceSession.stop()
    if (!draft || revision !== voiceRevision) return
    voiceRecording.value = { ...draft, state: 'ready', error: '' }
  } catch (error) {
    if (revision === voiceRevision) {
      await voiceSession.cancel().catch(() => {})
      if (revision === voiceRevision) voiceRecording.value = { state: 'idle', durationSeconds: 0, source: '', error: voiceRecordingError(error) }
    }
  } finally { if (revision === voiceRevision) voiceRecordingBusy.value = false }
}

async function cancelVoiceRecording() {
  const revision = ++voiceRevision
  clearVoiceDurationTimer()
  voicePointer = null
  voiceGestureCancelled.value = false
  if (!voiceSession) return
  const current = voiceSession
  voiceRecordingBusy.value = true
  voiceRecording.value = { state: 'cancelling', durationSeconds: 0, source: '', error: '' }
  try { await current.cancel() }
  catch { conversationError.value = t('voiceRecordingFailed') }
  finally {
    if (revision === voiceRevision) {
      voiceSession = null
      voiceRecordingBusy.value = false
      voiceRecording.value = { state: 'idle', durationSeconds: 0, source: '', error: '' }
    }
  }
}

async function finishAndSendVoiceRecording() {
  if (voiceSending || voiceRecordingBusy.value || !ensureConversationPermission()) return
  voiceSending = true
  const revision = voiceRevision
  const memberID = activeConversation.value?.member.id
  try {
    if (['recording', 'paused'].includes(voiceRecording.value.state)) {
      if (voiceSession.duration() < 1) {
        voiceRecording.value.error = t('voiceHoldAtLeastOneSecond')
        return
      }
      await stopVoiceRecording()
    }
    if (revision !== voiceRevision || route.value !== 'conversation' || memberID !== activeConversation.value?.member.id || voiceRecording.value.state !== 'ready') return
    if (!Number.isFinite(voiceRecording.value.durationSeconds) || voiceRecording.value.durationSeconds < 1) {
      voiceRecording.value.error = t('voiceHoldAtLeastOneSecond')
      return
    }
    const result = paliroSendConversationAudioMessage(session.value?.userID, memberID, voiceRecording.value)
    if (result.type !== 'success') {
      voiceRecording.value.error = t(result.type === 'not-friends' ? 'messageMutualOnlyCopy' : 'chatSendFailed')
      return
    }
    voiceSession.commit()
    voiceSession = null
    activeConversation.value = result.conversation
    voiceRecording.value = { state: 'idle', durationSeconds: 0, source: '', error: '' }
    loadMessageState()
    scrollConversationToEnd()
  } catch { voiceRecording.value.error = t('chatSendFailed') }
  finally { voiceSending = false }
}

function startVoiceGesture(event) {
  if (event.button !== 0 || voiceRecordingBusy.value || voiceRecording.value.state !== 'idle') return
  voicePointer = { id: event.pointerId, x: event.clientX, at: performance.now() }
  event.currentTarget.closest('.paliro-conversation-view')?.setPointerCapture(event.pointerId)
  voiceGestureCancelled.value = false
  voiceStartPromise = startVoiceRecording()
}

function moveVoiceGesture(event) {
  if (voicePointer?.id !== event.pointerId) return
  voiceGestureCancelled.value = event.clientX - voicePointer.x < -60
}

async function endVoiceGesture(event) {
  if (voicePointer?.id !== event.pointerId) return
  const held = performance.now() - voicePointer.at > 350
  const cancelled = voiceGestureCancelled.value || event.type === 'pointercancel'
  voicePointer = null
  voiceGestureCancelled.value = false
  if (cancelled) { await cancelVoiceRecording(); return }
  if (!held) return
  const revision = voiceRevision
  await voiceStartPromise
  if (revision === voiceRevision) await finishAndSendVoiceRecording()
}

function stopVoicePlayback() {
  const audio = activeVoiceAudio
  activeVoiceAudio = null
  audio?.pause()
  playingVoiceMessageID.value = ''
  voicePlaybackProgress.value = 0
}

function toggleVoicePlayback(message) {
  if (!message?.source || voiceRecording.value.state !== 'idle') return
  if (playingVoiceMessageID.value === message.id) { stopVoicePlayback(); return }
  stopVoicePlayback()
  conversationError.value = ''
  const audio = new Audio(videoSource(message.source))
  activeVoiceAudio = audio
  playingVoiceMessageID.value = message.id
  const finish = () => { if (activeVoiceAudio === audio) stopVoicePlayback() }
  const fail = () => {
    if (activeVoiceAudio !== audio) return
    stopVoicePlayback()
    conversationError.value = t('voicePlaybackFailed')
  }
  audio.addEventListener('timeupdate', () => {
    if (activeVoiceAudio === audio) voicePlaybackProgress.value = Math.min(1, audio.currentTime / (audio.duration || message.durationSeconds || 1))
  })
  audio.addEventListener('ended', finish, { once: true })
  audio.addEventListener('error', fail, { once: true })
  audio.play().catch(fail)
}

function openConversationProfile() {
  if (!activeConversation.value) return
  matchedFriend.value = activeConversation.value.member
  friendProfileOrigin.value = 'conversation'
  friendRequestStatus.value = paliroGetFriendRequestStatus(session.value?.userID, matchedFriend.value.id)
  openRoute('friend-profile')
}

function openConversationActions() {
  if (!activeConversation.value) return
  dismissConversationKeyboard()
  stopVoicePlayback()
  void cancelVoiceRecording()
  matchedFriend.value = activeConversation.value.member
  friendProfileOrigin.value = 'conversation'
  showFriendProfileActions.value = true
}

async function startMemberVideoCall(member) {
  if (videoCallStarting.value || route.value === 'video-call') return
  if (!paliroCanChatWithMember(session.value?.userID, member?.id)) { profileReminder.value = 'message'; return }
  const origin = route.value
  const userID = session.value?.userID
  videoCallStarting.value = true
  dismissConversationKeyboard()
  stopVoicePlayback()
  try {
    await cancelVoiceRecording()
    if (route.value !== origin || session.value?.userID !== userID) return
    if (!paliroCanChatWithMember(userID, member.id)) return
    videoCallMember.value = member
    videoCallOrigin.value = origin
    clearFriendProfileVideoPlayback()
    profileReminder.value = ''
    openRoute('video-call')
  } finally { videoCallStarting.value = false }
}

function openConversationVideo() {
  void startMemberVideoCall(activeConversation.value?.member)
}

function requestVideoCallPermissions() {
  return paliroRequestCallPermissions({ nativePermissions: nativeCallPermissions })
}

function canContinueVideoCall() {
  return route.value === 'video-call' && paliroCanChatWithMember(session.value?.userID, videoCallMember.value?.id)
}

function closeVideoCall() {
  // Replace the call entry so browser forward/back cannot restart a finished call.
  const origin = videoCallOrigin.value
  videoCallMember.value = null
  const destination = origin === 'conversation' && !canSendConversation.value ? 'messages' : origin
  route.value = destination
  window.history.replaceState({ route: destination }, '', `#/${destination}`)
}

function openConversation(memberID) {
  loadMeState()
  if (!paliroCanChatWithMember(session.value?.userID, memberID)) {
    loadMessageState()
    profileReminder.value = paliroGetFriendRequestStatus(session.value?.userID, memberID) === 'pending' ? 'request-pending' : 'message'
    return
  }
  activeConversation.value = paliroMarkConversationRead(session.value?.userID, memberID)
  if (!activeConversation.value) { loadMessageState(); return }
  conversationOrigin.value = 'messages'
  conversationError.value = ''
  conversationDraft.value = ''
  voiceRecording.value = { state: 'idle', durationSeconds: 0, source: '', error: '' }
  loadMessageState()
  openRoute('conversation')
  scrollConversationToEnd()
}

function closeConversation() {
  stopVoicePlayback()
  if (conversationOrigin.value === 'friend-profile') {
    friendProfileOrigin.value = conversationReturnProfileOrigin.value
    openRoute('friend-profile')
    return
  }
  activeConversation.value = null
  openMessages()
}

function sendConversationMessage() {
  if (!activeConversation.value || !conversationDraft.value.trim() || !ensureConversationPermission()) return
  conversationError.value = ''
  try {
    const result = paliroSendConversationMessage(session.value?.userID, activeConversation.value.member.id, conversationDraft.value)
    if (result.type !== 'success') { conversationError.value = t(result.type === 'not-friends' ? 'messageMutualOnlyCopy' : 'chatSendFailed'); return }
    activeConversation.value = result.conversation
    conversationDraft.value = ''
    loadMessageState()
    scrollConversationToEnd()
  } catch { conversationError.value = t('chatSendFailed') }
}

function openFriendRequests() {
  loadMessageState()
  openRoute('friend-requests')
}

function acceptIncomingFriendRequest(requestID) {
  const result = paliroAcceptIncomingFriendRequest(session.value?.userID, requestID)
  if (result.type !== 'success') return
  acceptedFriend.value = result.member
  loadMeState()
  loadMessageState()
  showFriendshipCelebration.value = true
}

function declineIncomingFriendRequest(requestID) {
  if (paliroDeclineIncomingFriendRequest(session.value?.userID, requestID).type === 'success') loadMessageState()
}

function closeFriendshipCelebration() {
  showFriendshipCelebration.value = false
  acceptedFriend.value = null
  openMessages()
}

function messageAcceptedFriend() {
  const memberID = acceptedFriend.value?.id
  showFriendshipCelebration.value = false
  if (memberID) openConversation(memberID)
  acceptedFriend.value = null
}

function openMe() {
  loadMeState()
  openRoute('me')
}

function openSocialDetail(detail) {
  socialDetail.value = detail
  socialSearch.value = ''
  loadMeState()
  openRoute('social-detail')
}

function formatSocialDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ''
  return date.toLocaleDateString(languagePreference.value === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isFollowingSocialMember(member) {
  return socialState.value.following.some((item) => item.id === member?.id)
}

function updateSocialRelationship(member, mode) {
  if (!member?.id) return
  const result = mode === 'follow'
    ? paliroFollowMember(session.value?.userID, member)
    : paliroToggleFollowMember(session.value?.userID, member)
  if (result.type !== 'success') return
  socialState.value = result.state
  profileMeta.value = paliroGetSocialSummary(session.value?.userID)
}

function openSocialMemberProfile(member) {
  if (!member?.id) return
  matchedFriend.value = { ...member, nickname: member.nickname ?? member.name }
  friendRequestStatus.value = paliroGetFriendRequestStatus(session.value?.userID, member.id)
  friendProfileOrigin.value = 'social-detail'
  openRoute('friend-profile')
}

function deleteProfilePost(post) {
  const result = post.contentType === 'video'
    ? paliroDeletePublishedVideo(session.value?.userID, post.id)
    : paliroDeleteBoxPost(session.value?.userID, post.id)
  if (result.type !== 'success') return
  loadMeState()
  loadVideoFeed()
}

function beginProfileEdit() {
  if (!session.value?.userID) return
  editableProfile.value = {
    ...createDefaultProfile(),
    ...session.value.profile,
    interests: [...(session.value.profile?.interests ?? [])],
  }
  profileEditBase = JSON.parse(JSON.stringify(editableProfile.value))
  editProfileError.value = ''
  editProfileNotice.value = ''
  openRoute('edit-profile')
}

function closeProfileEdit() {
  if (profileSaving.value) return
  showProfilePhotoSourcePicker.value = false
  editProfileError.value = ''
  editProfileNotice.value = ''
  openRoute('me')
}

function selectProfilePhotoSource() {
  if (editableProfile.value && !profileLoading.value && !profileSaving.value) showProfilePhotoSourcePicker.value = true
}

function addBrowserProfileImage() {
  const localID = session.value?.userID
  const draft = editableProfile.value
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (session.value?.userID !== localID || editableProfile.value !== draft || route.value !== 'edit-profile') return
      if (typeof reader.result !== 'string' || reader.result.length > 1_200_000) {
        editProfileError.value = t('mediaPickerFailed')
        return
      }
      persistProfileAvatar(reader.result)
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function persistProfileAvatar(photoDataUrl) {
  if (route.value !== 'edit-profile' || profileLoading.value || profileSaving.value || !session.value?.userID || !editableProfile.value || typeof photoDataUrl !== 'string') return
  const savedProfile = session.value.profile ?? createDefaultProfile()
  let nextSession
  try {
    nextSession = paliroUpdateProfile(session.value.userID, {
      ...savedProfile,
      interests: [...(savedProfile.interests ?? [])],
      photoDataUrl,
    })
  } catch { editProfileError.value = t('authStorageError'); return }
  if (!nextSession) {
    editProfileError.value = t('mediaPickerFailed')
    return
  }
  session.value = nextSession
  editableProfile.value = { ...editableProfile.value, photoDataUrl }
  editProfileNotice.value = t('profilePhotoLocalOnly')
  loadMeState()
}

async function pickProfilePhoto(source) {
  const localID = session.value?.userID
  const draft = editableProfile.value
  showProfilePhotoSourcePicker.value = false
  editProfileError.value = ''
  editProfileNotice.value = ''
  const picker = getPaliroMediaPicker()
  try {
    if (picker?.pick) {
      const result = await picker.pick({ source })
      if (session.value?.userID !== localID || editableProfile.value !== draft || route.value !== 'edit-profile') return
      if (typeof result?.dataUrl === 'string' && result.dataUrl.length <= 1_200_000) {
        persistProfileAvatar(result.dataUrl)
      } else if (result?.dataUrl) {
        editProfileError.value = t('mediaPickerFailed')
      }
      return
    }
    if (source === 'camera') throw new Error('native-camera-required')
    addBrowserProfileImage()
  } catch (error) {
    editProfileError.value = t(paliroMediaErrorKey(error, 'mediaPickerFailed'))
  }
}

async function refreshCurrentProfile(targetRoute) {
  if (!session.value?.serverUserID) return
  profileController?.abort()
  const controller = new AbortController()
  profileController = controller
  const localID = session.value.userID
  profileLoading.value = true
  profileReadNotice.value = ''
  profileSessionExpired.value = false
  try {
    const user = await serverSession.readProfile(controller.signal)
    if (controller.signal.aborted || route.value !== targetRoute || session.value?.userID !== localID) return
    session.value = paliroCacheServerProfile(user, localID)
    if (targetRoute === 'edit-profile') {
      editableProfile.value = JSON.parse(JSON.stringify(session.value.profile))
      profileEditBase = JSON.parse(JSON.stringify(editableProfile.value))
    }
  } catch (error) {
    if (controller.signal.aborted || session.value?.userID !== localID) return
    profileSessionExpired.value = error.status === 401 || error.code === 'UNAUTHORIZED'
    profileReadNotice.value = profileSessionExpired.value ? t('authSessionExpired') : t('profileCachedNotice')
  } finally { if (profileController === controller) profileLoading.value = false }
}

async function saveEditedProfile() {
  if (profileSaving.value || profileLoading.value) return
  const nextProfile = editableProfile.value
  if (!session.value?.userID || !nextProfile) return
  if (!nextProfile.nickname.trim()) { editProfileError.value = t('nicknameRequired'); return }
  if (!nextProfile.bio.trim() || !nextProfile.birthday) { editProfileError.value = t('profileRequired'); return }
  const issue = getBirthdayIssue(nextProfile.birthday)
  if (issue) { editProfileError.value = issue; return }

  document.activeElement?.blur?.()
  const localID = session.value.userID
  const controller = new AbortController()
  profileController?.abort()
  profileController = controller
  const patch = paliroProfilePatch(nextProfile, profileEditBase)
  profileSaving.value = true
  editProfileError.value = ''
  try {
    if (Object.keys(patch).length) {
      const updated = await serverSession.saveProfile(patch, controller.signal)
      if (controller.signal.aborted || session.value?.userID !== localID) return
      session.value = paliroCacheServerProfile(updated, localID)
    }
    editableProfile.value = null
    editProfileNotice.value = ''
    loadMeState()
    profileSaving.value = false
    openRoute('me')
  } catch (error) {
    if (controller.signal.aborted || session.value?.userID !== localID) return
    profileSessionExpired.value = error.status === 401 || error.code === 'UNAUTHORIZED'
    editProfileError.value = t(paliroAuthErrorKey(error))
  } finally { profileSaving.value = false }
}

function togglePushNotifications() {
  pushNotificationsEnabled.value = paliroSetPushPreference(session.value?.userID, !pushNotificationsEnabled.value)
}

function openAccountDeletionNotice() {
  if (!session.value?.serverUserID || accountDeletionBusy.value) return
  accountDeletionPassword.value = ''
  accountDeletionError.value = ''
  accountDeletionExpired.value = false
  showAccountDeletionNotice.value = true
  nextTick(() => { updateChatViewport(); accountDeletionInput.value?.focus() })
}

function trapAccountDeletionFocus(event) {
  const controls = [...(accountDeletionDialog.value?.querySelectorAll('input:not(:disabled), button:not(:disabled)') ?? [])]
  if (!controls.length) { event.preventDefault(); return }
  if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus() }
  else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus() }
}

function closeAccountDeletion() {
  if (accountDeletionBusy.value) return
  showAccountDeletionNotice.value = false
  accountDeletionPassword.value = ''
  accountDeletionError.value = ''
  accountDeletionExpired.value = false
  document.activeElement?.blur?.()
}

async function confirmAccountDeletion() {
  if (accountDeletionBusy.value || !showAccountDeletionNotice.value || !session.value?.serverUserID) return
  if (!accountDeletionPassword.value) { accountDeletionError.value = t('deletePasswordRequired'); return }
  const { userID, serverUserID } = session.value
  accountDeletionBusy.value = true
  accountDeletionError.value = ''
  profileController?.abort()
  document.activeElement?.blur?.()
  accountDeletionDialog.value?.focus()
  try {
    const result = await serverSession.deleteAccount(accountDeletionPassword.value)
    let cleanupFailed = result.cleanupFailed
    try { paliroDeleteLocalAccount(userID, serverUserID) } catch { cleanupFailed = true }
    session.value = null
    editableProfile.value = null
    signupUser.value = null
    profile.value = createDefaultProfile()
    activeConversation.value = null
    conversations.value = []
    incomingFriendRequests.value = []
    registrationDraft = null
    incompleteAuth = null
    authForm.value = { email: '', password: '', confirmPassword: '' }
    showBoxRules.value = false
    accountDeletionBusy.value = false
    closeAccountDeletion()
    route.value = 'welcome'
    window.history.replaceState({ route: 'welcome' }, '', '#/welcome')
    accountNotice.value = t('accountDeleted')
    errorMessage.value = cleanupFailed ? t('accountDeleteCleanupFailed') : ''
  } catch (error) {
    accountDeletionExpired.value = error.code === 'UNAUTHORIZED'
    accountDeletionError.value = error.code === 'INVALID_CREDENTIALS' ? t('deletePasswordWrong')
      : ['TIMEOUT', 'NETWORK_ERROR'].includes(error.code) ? t('accountDeleteUnconfirmed') : t(paliroAuthErrorKey(error))
  } finally { accountDeletionBusy.value = false }
}

function openMeMenu(item) {
  if (item === 'edit') {
    beginProfileEdit()
  } else if (item === 'wallet') {
    openWallet()
  } else if (item === 'videos') {
    openRoute('my-videos')
  } else if (item === 'blocked') {
    blockedUsers.value = paliroGetBlockedUsers(session.value?.userID)
    openRoute('blocked-users')
  } else if (item === 'language') {
    languagePreference.value = paliroGetLanguagePreference(session.value?.userID)
    openRoute('language')
  } else if (item === 'settings') {
    pushNotificationsEnabled.value = paliroGetPushPreference(session.value?.userID)
    openRoute('settings')
  }
}

function closeMeSecondary() {
  openRoute('me')
}

function selectLanguage(language) {
  const wasBoxSelectedNotice = homeNotice.value === t('boxSelected')
  const wasBoxSelectionRequiredNotice = homeNotice.value === t('boxSelectionRequired')
  languagePreference.value = paliroSetLanguagePreference(session.value?.userID, language)
  syncNativeLaunchLanguage(languagePreference.value)
  applyLocale()
  loadMeState()
  loadMessageState()
  loadVideoFeed()
  if (wasBoxSelectedNotice) homeNotice.value = t('boxSelected')
  if (wasBoxSelectionRequiredNotice) homeNotice.value = t('boxSelectionRequired')
}

function unblockMember(memberID) {
  blockedUsers.value = paliroUnblockUser(session.value?.userID, memberID)
  loadMeState()
}

function dismissBoxRules() {
  paliroSetBoxRulesSeen(session.value?.userID)
  showBoxRules.value = false
}

function handlePageEntered(element) {
  if (route.value === 'home' && element.classList.contains('paliro-home')) homePageReady.value = true
}

function selectBox(index) {
  if (isBoxActionLocked.value || selectedBox.value === index) return
  if (paliroBoxSelectionAlertTimer) window.clearTimeout(paliroBoxSelectionAlertTimer)
  paliroBoxSelectionAlertTimer = null
  boxSelectionAlertActive.value = false
  selectedBox.value = index
  boxSelectionAnimating.value = index
  homeNotice.value = t('boxSelected')
}

function hasAvailableMatchMember() {
  return paliroGetAvailableMatchMembers(session.value?.userID, languagePreference.value).length > 0
}

function requestBoxAction(action) {
  if (!session.value || isBoxActionLocked.value) return
  if (action === 'make') {
    openBoxComposer()
    return
  }
  if (action === 'take' && !hasAvailableMatchMember()) {
    homeNotice.value = t('noAvailableMatches')
    return
  }
  if (action === 'take' && selectedBox.value === null) {
    homeNotice.value = t('boxSelectionRequired')
    boxSelectionHintPulse.value += 1
    boxSelectionAlertActive.value = true
    if (paliroBoxSelectionAlertTimer) window.clearTimeout(paliroBoxSelectionAlertTimer)
    paliroBoxSelectionAlertTimer = window.setTimeout(() => {
      boxSelectionAlertActive.value = false
      paliroBoxSelectionAlertTimer = null
    }, 720)
    return
  }
  if (freeBoxActionsLeft.value > 0) {
    const result = paliroUseFreeBoxAction(session.value.userID)
    if (result.type === 'success') {
      boxState.value = result.state
      if (action === 'take') {
        startTakeOneOpening()
      } else {
        finishBoxAction(action)
      }
    }
    return
  }

  pendingBoxAction.value = action
  coinPromptError.value = ''
  if (action === 'take' && boxCoinBalance.value < PALIRO_BOX_ACTION_COST) {
    homeNotice.value = t('boxNeedsCoins')
    void openWallet()
    return
  }
  showCoinPrompt.value = true
}

function openBoxComposer() {
  composerError.value = ''
  showBoxComposer.value = true
}

function closeBoxComposer() {
  showMediaSourcePicker.value = false
  showBoxComposer.value = false
  composerError.value = ''
  if (pendingBoxAction.value === 'make') pendingBoxAction.value = null
  resumeComposerAfterWallet.value = false
}

function addComposerImage() {
  if (composerImages.value.length < 3) showMediaSourcePicker.value = true
}

function getPaliroMediaPicker() {
  return nativeMediaPicker
}

function loadComposerImage(dataUrl) {
  return new Promise((resolve, reject) => {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) { reject(new Error('Invalid image data')); return }
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to decode image'))
    image.src = dataUrl
  })
}

async function prepareComposerImage(dataUrl) {
  const image = await loadComposerImage(dataUrl)
  const targetDataUrlLength = 420_000
  let lastResult = ''

  for (const maximumEdge of [960, 800, 640]) {
    const scale = Math.min(1, maximumEdge / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image canvas is unavailable')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of [0.82, 0.72, 0.62, 0.52]) {
      lastResult = canvas.toDataURL('image/jpeg', quality)
      if (lastResult.length <= targetDataUrlLength) return lastResult
    }
  }

  if (lastResult.length <= 1_200_000) return lastResult
  throw new Error('Image is too large to store')
}

async function appendComposerImage(dataUrl) {
  try {
    const preparedImage = await prepareComposerImage(dataUrl)
    composerImages.value = [...composerImages.value, preparedImage].slice(0, 3)
    composerError.value = ''
  } catch {
    composerError.value = t('mediaPickerFailed')
  }
}

async function pickComposerImage(source) {
  showMediaSourcePicker.value = false
  const picker = getPaliroMediaPicker()
  try {
    if (picker?.pick) {
      const result = await picker.pick({ source })
      if (result?.dataUrl) await appendComposerImage(result.dataUrl)
      return
    }
    if (source === 'camera') throw new Error('native-camera-required')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => { if (typeof reader.result === 'string') void appendComposerImage(reader.result) }
      reader.readAsDataURL(file)
    }
    input.click()
  } catch (error) {
    composerError.value = t(paliroMediaErrorKey(error, 'mediaPickerFailed'))
  }
}

function removeComposerImage(index) {
  composerImages.value = composerImages.value.filter((_, imageIndex) => imageIndex !== index)
}

function publishComposerBox() {
  if (isBoxActionLocked.value) return
  if (!composerImages.value.length) { composerError.value = t('boxPhotoRequired'); return }
  if (!composerText.value.trim()) { composerError.value = t('boxMessageRequired'); return }
  composerError.value = ''
  if (freeBoxActionsLeft.value > 0) {
    const result = paliroUseFreeBoxAction(session.value.userID)
    if (result.type === 'success') { boxState.value = result.state; startMakeBoxFlight() }
    return
  }
  pendingBoxAction.value = 'make'
  if (boxCoinBalance.value < PALIRO_BOX_ACTION_COST) {
    // Keep the local draft intact while the member adds coins in the existing wallet.
    resumeComposerAfterWallet.value = true
    showBoxComposer.value = false
    void openWallet()
    return
  }
  showCoinPrompt.value = true
}

function dismissCoinPrompt() {
  showCoinPrompt.value = false
  pendingBoxAction.value = null
  coinPromptError.value = ''
}

function finishBoxAction(action) {
  if (action === 'make') {
    const theme = boxThemes[selectedBox.value ?? 0]
    const memberProfile = currentMemberProfile.value
    const createdPost = paliroCreateBoxPost(session.value?.userID, {
      theme,
      title: composerText.value.trim().slice(0, 80),
      description: composerText.value.trim(),
      interests: memberProfile.interests,
      images: composerImages.value,
    })
    if (!createdPost) {
      composerError.value = t('mediaPickerFailed')
      return
    }
    composerImages.value = []
    composerText.value = ''
    showBoxComposer.value = false
    openRoute('home')
    loadMeState()
    homeNotice.value = t('boxDraftSaved')
    return
  }
  homeNotice.value = t('boxOpenedNotice')
}

function confirmCoinSpend() {
  const action = pendingBoxAction.value
  if (!action || !session.value || isBoxActionLocked.value) return
  if (action === 'take' && !hasAvailableMatchMember()) {
    dismissCoinPrompt()
    homeNotice.value = t('noAvailableMatches')
    return
  }

  const result = paliroSpendBoxCoins(session.value.userID)
  if (result.type === 'insufficient-coins') {
    boxState.value = result.state
    showCoinPrompt.value = false
    void openWallet()
    return
  }
  if (result.type !== 'success') return

  boxState.value = result.state
  showCoinPrompt.value = false
  pendingBoxAction.value = null
  coinPromptError.value = ''
  if (action === 'take') {
    startTakeOneOpening()
  } else {
    startMakeBoxFlight()
  }
}

function scheduleOpeningStep(callback, delay) {
  const timer = window.setTimeout(() => {
    paliroOpeningTimers.delete(timer)
    callback()
  }, delay)
  paliroOpeningTimers.add(timer)
}

function clearOpeningTimers() {
  paliroOpeningTimers.forEach((timer) => window.clearTimeout(timer))
  paliroOpeningTimers.clear()
}

function startMakeBoxFlight() {
  if (isBoxActionLocked.value) return
  clearOpeningTimers()
  makeBoxFlightStage.value = 'forming'
  showBoxComposer.value = false
  showMediaSourcePicker.value = false
  homeNotice.value = t('boxCraftingNotice')

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    scheduleOpeningStep(completeMakeBoxFlight, 180)
    return
  }

  scheduleOpeningStep(() => { makeBoxFlightStage.value = 'flying' }, 180)
  scheduleOpeningStep(completeMakeBoxFlight, 1120)
}

function completeMakeBoxFlight() {
  if (!isCreatingBox.value) return
  makeBoxFlightStage.value = 'idle'
  finishBoxAction('make')
}

function startTakeOneOpening() {
  if (isOpeningBox.value) return
  const member = paliroTakeAvailableMatchMember(session.value?.userID, languagePreference.value)
  if (!member) {
    homeNotice.value = t('noAvailableMatches')
    return
  }
  matchedFriend.value = member
  friendRequestStatus.value = paliroGetFriendRequestStatus(session.value?.userID, matchedFriend.value.id)
  clearOpeningTimers()
  paliroOpeningPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  boxOpeningKey.value += 1
  boxOpeningStage.value = 'opening'
  homeNotice.value = t('boxOpeningNotice')

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    scheduleOpeningStep(showMatchResult, 180)
    return
  }

  scheduleOpeningStep(() => { boxOpeningStage.value = 'revealing' }, PALIRO_BOX_OPENING_MOTION.revealAt)
  scheduleOpeningStep(showMatchResult, PALIRO_BOX_OPENING_MOTION.resultAt)
}

function showMatchResult() {
  boxOpeningStage.value = 'result'
  nextTick(focusMatchResultAction)
}

function focusMatchResultAction() {
  if (matchPrimaryButton.value && !matchPrimaryButton.value.disabled) {
    matchPrimaryButton.value.focus()
    return
  }
  matchResultDialog.value?.querySelector('button:not([disabled])')?.focus()
}

function closeMatchResult() {
  clearOpeningTimers()
  boxOpeningStage.value = 'idle'
  selectedBox.value = null
  homeNotice.value = t('boxReadyNotice')
  const previousFocus = paliroOpeningPreviousFocus
  nextTick(() => previousFocus?.focus())
  paliroOpeningPreviousFocus = null
}

function trapMatchFocus(event) {
  if (event.key !== 'Tab' || !matchResultDialog.value) return
  const focusable = [...matchResultDialog.value.querySelectorAll('button:not([disabled])')]
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function openFriendRequestModal() {
  if (friendRequestStatus.value === 'pending') return
  friendRequestMessage.value = ''
  friendRequestError.value = ''
  showFriendRequestModal.value = true
  nextTick(() => friendRequestTextarea.value?.focus())
}

function closeFriendRequestModal() {
  if (friendRequestSending.value) return
  showFriendRequestModal.value = false
  if (isOpeningBox.value) nextTick(focusMatchResultAction)
}

function trapFriendRequestFocus(event) {
  if (event.key !== 'Tab' || !friendRequestDialog.value) return
  const focusable = [...friendRequestDialog.value.querySelectorAll('button:not([disabled]), textarea:not([disabled])')]
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function sendMatchFriendRequest() {
  if (friendRequestSending.value || friendRequestStatus.value === 'pending') return
  friendRequestSending.value = true
  friendRequestError.value = ''
  try {
    const result = paliroSendFriendRequest(session.value?.userID, matchedFriend.value.id, friendRequestMessage.value, matchedFriend.value)
    if (result.type === 'success' || result.type === 'already-pending') {
      friendRequestStatus.value = 'pending'
      loadMessageState()
      friendRequestTextarea.value?.blur()
      showFriendRequestModal.value = false
      profileReminder.value = result.type === 'success' ? 'request-sent' : 'request-pending'
    } else {
      friendRequestError.value = t('friendRequestFailed')
    }
  } catch {
    friendRequestError.value = t('friendRequestFailed')
  } finally { friendRequestSending.value = false }
}

function openReportUser(origin = 'home') {
  const resolvedOrigin = typeof origin === 'string' ? origin : 'home'
  reportOrigin.value = resolvedOrigin
  if (resolvedOrigin === 'home') {
    clearOpeningTimers()
    boxOpeningStage.value = 'idle'
  }
  reportReason.value = ''
  reportDetails.value = ''
  reportError.value = ''
  openRoute('report-user')
}

function closeReportUser() {
  if (reportSubmitting.value) return
  if (reportOrigin.value === 'conversation') { openRoute('conversation'); return }
  if (reportOrigin.value === 'opening') {
    reportReason.value = ''
    reportDetails.value = ''
    reportError.value = ''
    openRoute('home')
    nextTick(focusMatchResultAction)
    return
  }
  if (reportOrigin.value === 'friend-profile') {
    openRoute('friend-profile')
    return
  }
  if (reportOrigin.value === 'videos') {
    openVideoFeed()
    return
  }
  selectedBox.value = null
  homeNotice.value = t('boxReadyNotice')
  openRoute('home')
  const previousFocus = paliroOpeningPreviousFocus
  nextTick(() => previousFocus?.focus())
  paliroOpeningPreviousFocus = null
}

function finishFriendSafetyAction({ closeBox = false, noticeKey = 'boxReadyNotice' } = {}) {
  friendRequestStatus.value = 'none'
  loadMeState()
  loadMessageState()
  if (friendProfileOrigin.value === 'conversation') {
    activeConversation.value = null
    openMessages()
    return
  }
  if (friendProfileOrigin.value === 'videos') {
    restoreVideoFeed({ refresh: true })
    return
  }
  if (friendProfileOrigin.value === 'box') {
    clearOpeningTimers()
    clearFriendProfileVideoPlayback()
    if (closeBox) selectedBox.value = null
    boxOpeningStage.value = closeBox ? 'idle' : 'result'
    if (closeBox) {
      homeNotice.value = t(noticeKey)
      paliroOpeningPreviousFocus = null
    }
    openRoute('home')
    if (!closeBox) nextTick(focusMatchResultAction)
    return
  }
  selectedBox.value = null
  homeNotice.value = t('boxReadyNotice')
  openRoute('home')
}

function submitReport() {
  if (reportSubmitting.value) return
  if (!reportReason.value) {
    reportError.value = t('reportReasonRequired')
    return
  }

  reportSubmitting.value = true
  const result = paliroReportMember(
    session.value?.userID,
    matchedFriend.value,
    t(reportReason.value),
    reportDetails.value,
  )
  reportSubmitting.value = false
  if (result.type !== 'success') {
    reportError.value = t('reportReasonRequired')
    return
  }

  blockedUsers.value = result.blockedUsers
  reportReason.value = ''
  reportDetails.value = ''
  reportError.value = ''
  if (reportOrigin.value === 'friend-profile' || reportOrigin.value === 'videos' || reportOrigin.value === 'conversation') {
    finishFriendSafetyAction()
    return
  }
  if (reportOrigin.value === 'opening') {
    friendRequestStatus.value = 'none'
    loadMeState()
    loadMessageState()
    homeNotice.value = t('reportSubmitted')
    openRoute('home')
    nextTick(focusMatchResultAction)
    return
  }
  friendRequestStatus.value = 'none'
  loadMeState()
  loadMessageState()
  selectedBox.value = null
  homeNotice.value = t('reportSubmitted')
  openRoute('home')
  const previousFocus = paliroOpeningPreviousFocus
  nextTick(() => previousFocus?.focus())
  paliroOpeningPreviousFocus = null
}

function openMatchedFriendProfile() {
  clearOpeningTimers()
  boxOpeningStage.value = 'idle'
  friendProfileOrigin.value = 'box'
  loadMeState()
  openRoute('friend-profile')
}

function followMatchedFriend() {
  if (isMatchedBlocked.value) return
  const result = paliroToggleFollowMember(session.value?.userID, matchedFriend.value)
  if (result.type !== 'success') return
  socialState.value = result.state
  profileMeta.value = paliroGetSocialSummary(session.value?.userID, languagePreference.value)
  loadMessageState()
}

function openMatchedConversation() {
  if (!isMatchedMutualFriend.value) {
    profileReminder.value = 'message'
    return
  }
  activeConversation.value = paliroGetOrCreateConversation(session.value?.userID, matchedFriend.value)
  if (!activeConversation.value) return
  if (friendProfileOrigin.value !== 'conversation') {
    conversationOrigin.value = 'friend-profile'
    conversationReturnProfileOrigin.value = friendProfileOrigin.value
  }
  conversationError.value = ''
  conversationDraft.value = ''
  loadMessageState()
  openRoute('conversation')
}

function openMatchedVideo() {
  void startMemberVideoCall(matchedFriend.value)
}

function closeMatchedFriendProfile() {
  clearFriendProfileVideoPlayback()
  showFriendProfileActions.value = false
  showFriendProfileBlockConfirm.value = false
  if (friendProfileOrigin.value === 'conversation') { openRoute('conversation'); return }
  if (friendProfileOrigin.value === 'videos') {
    restoreVideoFeed()
    return
  }
  if (friendProfileOrigin.value === 'social-detail') {
    openSocialDetail(socialDetail.value)
    return
  }
  openRoute('home')
  boxOpeningStage.value = 'result'
  nextTick(focusMatchResultAction)
}

function openFriendProfileActions() {
  showFriendProfileActions.value = true
}

function reportMatchedFriendFromProfile() {
  showFriendProfileActions.value = false
  openReportUser(route.value === 'conversation' ? 'conversation' : 'friend-profile')
}

function openFriendProfileBlockConfirm() {
  showFriendProfileActions.value = false
  showFriendProfileBlockConfirm.value = true
}

function closeFriendProfileBlockConfirm() {
  showFriendProfileBlockConfirm.value = false
}

function trapFriendProfileBlockFocus(event) {
  const controls = [...(friendProfileBlockDialog.value?.querySelectorAll('button:not(:disabled)') ?? [])]
  if (!controls.length) { event.preventDefault(); return }
  if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus() }
  else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus() }
}

function confirmBlockMatchedFriend() {
  if (!showFriendProfileBlockConfirm.value) return
  const result = paliroBlockMember(session.value?.userID, matchedFriend.value)
  if (result.type !== 'success') return
  blockedUsers.value = result.blockedUsers
  showFriendProfileBlockConfirm.value = false
  showFriendProfileActions.value = false
  finishFriendSafetyAction({ closeBox: true, noticeKey: 'memberBlockedNotice' })
}

function getPaliroIapPlugin() {
  return paliroNativeService('PaliroIap')
}

async function setupNativeIapBridge() {
  const plugin = getPaliroIapPlugin()
  if (!plugin?.addListener) return
  paliroIapListener = await plugin.addListener('purchaseResult', handleNativeIapResult)
}

function openWallet() {
  walletOrigin.value = route.value === 'me' ? 'me' : 'home'
  showCoinPrompt.value = false
  coinPromptError.value = ''
  selectedWalletProductID.value = ''
  walletSelectionRequired.value = false
  walletDialogMessage.value = ''
  openRoute('wallet')
}

function closeWallet() {
  walletDialogMessage.value = ''
  walletSelectionRequired.value = false
  if (pendingBoxAction.value === 'make' && resumeComposerAfterWallet.value) {
    resumeComposerAfterWallet.value = false
    walletOrigin.value = 'home'
    openRoute('home')
    showBoxComposer.value = true
    return
  }
  const destination = walletOrigin.value
  walletOrigin.value = 'home'
  if (destination === 'me') {
    loadMeState()
    openRoute('me')
    return
  }
  openRoute('home')
  if (pendingBoxAction.value === 'take') {
    homeNotice.value = t('walletReturnNotice')
  }
}

async function purchaseSelectedCoinPack() {
  const selectedPack = selectedWalletPack.value
  const plugin = getPaliroIapPlugin()
  if (walletPurchaseLoading.value) return
  if (!selectedPack) {
    walletSelectionRequired.value = true
    return
  }
  if (!plugin?.purchase || !session.value) {
    walletDialogMessage.value = t('purchaseUnavailable')
    return
  }

  walletPurchaseLoading.value = true
  try {
    const result = await plugin.purchase({ productID: selectedPack.productID, userID: session.value.userID })
    handleNativeIapResult(result)
    if (result.status === 'pending') walletDialogMessage.value = t('purchasePending')
    if (result.status === 'cancelled') walletDialogMessage.value = t('purchaseCancelled')
  } catch (error) {
    walletDialogMessage.value = error?.message ?? t('purchaseFailed')
  } finally {
    walletPurchaseLoading.value = false
  }
}

function handleNativeIapResult(result) {
  if (result?.status !== 'success') return
  const userID = result.userID || session.value?.userID
  if (!userID || userID !== session.value?.userID) return

  const credit = paliroCreditCoinsFromIap(userID, result)
  if (credit.type === 'success') {
    boxState.value = credit.state
    walletDialogMessage.value = `${credit.coins.toLocaleString()} ${t('coins')} ${t('purchaseSuccess')} ${credit.state.coins.toLocaleString()} ${t('coins')}.`
    selectedWalletProductID.value = ''
  } else if (credit.type === 'already-credited') {
    boxState.value = credit.state
  }
}

function openTopicTest() {
  const saved = paliroGetTopicTestState(session.value?.userID)
  if (!saved) return

  testAnswers.value = [...saved.answers]
  testStep.value = Math.min(saved.step ?? 0, testQuestions.length - 1)
  const ageAnswer = saved.answers?.[1]
  if (typeof ageAnswer === 'string') {
    const [minimum, maximum] = ageAnswer.split('-').map(Number)
    if (Number.isFinite(minimum) && Number.isFinite(maximum)) {
      testAgeMin.value = minimum
      testAgeMax.value = maximum
    }
  }
  testCompletionAwarded.value = false
  testStage.value = saved.completedAt ? 'complete' : 'intro'
  openRoute('test')
}

function selectTestAnswer(answer) {
  const answers = [...testAnswers.value]
  answers[testStep.value] = answer
  testAnswers.value = answers
  paliroSaveTopicTestProgress(session.value?.userID, answers, testStep.value)
}

function getTestOptionIcon(option) {
  const iconName = testQuestion.value.optionIcons?.[option]
  if (!iconName) return ''

  const selectedState = testAnswers.value[testStep.value] === option ? 'selected' : 'default'
  return `/assets/paliro-test-${iconName}-${selectedState}@2x.png`
}

function saveTestAgeRange() {
  if (testAgeMin.value > testAgeMax.value) {
    const previousMinimum = testAgeMin.value
    testAgeMin.value = testAgeMax.value
    testAgeMax.value = previousMinimum
  }
  selectTestAnswer(`${testAgeMin.value}-${testAgeMax.value}`)
}

function startTopicTest() {
  testStage.value = 'question'
  if (!testAnswers.value[testStep.value] && testQuestion.value.type === 'age') {
    saveTestAgeRange()
  }
}

function advanceTopicTest() {
  if (!testAnswers.value[testStep.value]) return
  if (testStep.value === testQuestions.length - 1) {
    const result = paliroCompleteTopicTest(session.value?.userID, testAnswers.value)
    if (result.type === 'success') {
      boxState.value = result.boxState
      testCompletionAwarded.value = result.awarded
      testStage.value = 'complete'
      loadMeState()
    }
    return
  }

  testStep.value += 1
  if (testQuestion.value.type === 'age' && !testAnswers.value[testStep.value]) {
    saveTestAgeRange()
    return
  }
  paliroSaveTopicTestProgress(session.value?.userID, testAnswers.value, testStep.value)
}

function goBackFromTopicTest() {
  if (testStage.value === 'complete' || testStage.value === 'intro') {
    openRoute('home')
    return
  }
  if (testStep.value > 0) {
    testStep.value -= 1
    return
  }
  testStage.value = 'intro'
}

function restartTopicTest() {
  testAnswers.value = []
  testStep.value = 0
  testAgeMin.value = 22
  testAgeMax.value = 30
  testCompletionAwarded.value = false
  paliroSaveTopicTestProgress(session.value?.userID, [], 0)
  testStage.value = 'question'
}

function finishTopicTest() {
  homeNotice.value = testCompletionAwarded.value
    ? t('topicTestSavedReward')
    : t('topicTestSaved')
  openRoute('home')
}
</script>

<template>
  <PaliroFirstLaunch v-if="showFirstLaunch" :title="t('appName')" :copy="t('firstLaunchCopy')" @complete="finishFirstLaunch" />
  <main class="paliro-shell" :class="{ 'is-first-launch': showFirstLaunch }" :inert="showAccountDeletionNotice || showFirstLaunch">
    <div class="paliro-stars" aria-hidden="true"></div>

      <section v-if="hasOpenedVideoFeed && session" :class="{ 'is-inactive': route !== 'videos' || isVideoFeedRestoring, 'is-tab-transition': isPrimaryTabTransition }" :aria-hidden="route !== 'videos' || isVideoFeedRestoring" :inert="route !== 'videos' || isVideoFeedRestoring" class="paliro-video-feed paliro-view">
        <div v-if="!videoListRequest.ready.value && videoListRequest.busy.value" class="paliro-video-loading" role="status" aria-live="polite">
          <span class="paliro-list-spinner" aria-hidden="true"></span><span>{{ t('listLoading') }}</span>
          <div class="paliro-video-loading-lines" aria-hidden="true"><i></i><i></i></div>
        </div>
        <main v-if="videoFeed.length" ref="videoFeedScroll" aria-label="Topic videos" class="paliro-video-feed-scroll">
          <article v-for="(video, index) in videoFeed" :key="video.id" :data-video-index="index" class="paliro-video-slide">
            <video
              :ref="(element) => setVideoElement(video.id, element)"
              :poster="video.thumbnail"
              :src="videoSource(video.source)"
              loop
              muted
              playsinline
              preload="metadata"
              @click="toggleVideoPlayback(video)"
              @pause="setVideoFeedPlayback(video.id, false)"
              @play="setVideoFeedPlayback(video.id, true)"
            ></video>
            <div class="paliro-video-scrim" aria-hidden="true"></div>
            <img v-if="userPausedVideoID === video.id && videoFeedPlayback[video.id] === false" alt="" class="paliro-video-paused-indicator" src="/assets/paliro-video-play@2x.png" />
            <section class="paliro-video-copy">
              <h2>@{{ video.member.name }}</h2>
              <p>{{ video.caption }}</p>
              <div class="paliro-video-interests"><span v-for="interest in video.member.interests?.slice(0, 3)" :key="interest">#{{ interest }}</span></div>
            </section>
            <aside class="paliro-video-actions" :aria-label="`${video.member.name} ${t('video')}`">
              <button :aria-label="`${video.member.name} ${t('profile')}`" class="paliro-video-author-action" type="button" @click="openVideoMemberProfile(video)"><img :alt="`${video.member.name} avatar`" :src="video.member.avatar" /><i v-if="!isOwnVideo(video)" :class="{ 'is-following': isFollowingVideoMember(video) }" aria-hidden="true" @click.stop="toggleVideoFollow(video)"><PaliroStateFeedback :value="isFollowingVideoMember(video)" :positive="isFollowingVideoMember(video)" kind="follow"><img v-if="isFollowingVideoMember(video)" alt="" src="/assets/paliro-video-following@2x.png" /><span v-else>+</span></PaliroStateFeedback></i></button>
              <button :aria-label="t('likes')" :aria-pressed="video.liked" :class="{ 'is-liked': video.liked }" type="button" @click="toggleVideoLike(video)"><PaliroStateFeedback :value="video.liked" :positive="video.liked" kind="like"><img alt="" :src="video.liked ? '/assets/paliro-video-like-active@2x.png' : '/assets/paliro-video-like@2x.png'" /></PaliroStateFeedback><small><PaliroStateFeedback :value="video.likes" kind="count">{{ video.likes }}</PaliroStateFeedback></small></button>
              <button :aria-label="t('comments')" type="button" @click="openVideoComments(video)"><img alt="" src="/assets/paliro-video-comment@2x.png" /><small>{{ video.comments.length }}</small></button>
              <button :aria-label="t('reportVideo')" class="paliro-video-report-action" type="button" @click="openVideoActions(video)"><img alt="" src="/assets/paliro-video-report@2x.png" /><small>{{ t('reportLabel') }}</small></button>
            </aside>
          </article>
        </main>
        <section v-else ref="videoEmptyScroll" class="paliro-video-empty"><template v-if="!videoListRequest.busy.value"><div aria-hidden="true">✦</div><h2>{{ videoListRequest.failed.value ? t('listFailed') : t('noVideosTitle') }}</h2><p v-if="!videoListRequest.failed.value">{{ t('noVideosCopy') }}</p><button v-if="videoListRequest.failed.value" type="button" @click="requestVideoList">{{ t('listRetry') }}</button><button v-else type="button" @click="openVideoPublish">{{ t('videoPublish') }}</button></template></section>
        <PaliroPullRefresh class="paliro-video-refresh" :target="videoFeedScroll || videoEmptyScroll" :enabled="route === 'videos' && videoListRequest.ready.value && !selectedVideo"
          :busy="videoListRequest.busy.value && videoListRequest.ready.value" :failed="videoListRequest.failed.value && videoListRequest.ready.value" :t="t" @refresh="requestVideoList" />
        <header class="paliro-video-header">
          <button :aria-label="t('videoPublish')" type="button" @click="openVideoPublish"><img alt="" class="paliro-video-publish-icon" src="/assets/paliro-video-publish@2x.png" /></button>
        </header>
      </section>

    <nav v-if="session && paliroPrimaryTabs.some(tab => tab.route === route)" class="paliro-home-tabs paliro-primary-tabs" aria-label="Primary navigation">
      <button v-for="tab in paliroPrimaryTabs" :key="tab.route" :aria-label="t(tab.label)" :aria-current="route === tab.route ? 'page' : undefined"
        :class="['paliro-home-tab', { 'is-active': route === tab.route }]" type="button" @click="openPrimaryTab(tab.route)">
        <img class="paliro-home-tab-icon" alt="" :src="`/assets/paliro-tab-${tab.icon}-${route === tab.route ? 'selected' : 'default'}@2x.png`" />
        <small>{{ t(tab.label) }}</small>
      </button>
    </nav>

    <Transition :name="isPrimaryTabTransition ? 'paliro-tab-fade' : 'paliro-route-fade'" :css="!skipVideoRouteAnimation" :mode="isPrimaryTabTransition ? undefined : 'out-in'" @after-enter="handlePageEntered">
      <section v-if="route === 'boot'" key="boot" aria-busy="true" class="paliro-boot paliro-view">
        <img alt="" :src="launchArtwork.src" :srcset="launchArtwork.srcset || undefined" />
        <div aria-hidden="true" class="paliro-boot-indicator"><i></i><i></i><i></i></div>
      </section>

      <section v-else-if="route === 'welcome'" key="welcome" class="paliro-welcome paliro-view">
      <div class="paliro-status-spacer"></div>
      <div class="paliro-welcome-art" aria-hidden="true">
        <img alt="" src="/assets/paliro-welcome-hero@2x.png" />
      </div>
      <div class="paliro-welcome-actions">
        <p v-if="accountNotice" class="paliro-profile-edit-notice" role="status">{{ accountNotice }}</p>
        <p v-if="errorMessage" class="paliro-error" role="alert">{{ errorMessage }}</p>
        <button :disabled="!hasAgreed || authBusy" class="paliro-primary-button" @click="openRoute('login')">{{ t('logIn') }}</button>
        <button :disabled="!hasAgreed || authBusy" class="paliro-secondary-button" @click="openRoute('signup')">{{ t('signUp') }}</button>
        <button class="paliro-eula-button" @click="showEula = true">{{ t('readEula') }}</button>
        <label class="paliro-consent">
          <input :checked="hasAgreed" type="checkbox" @change="saveAgreement($event.target.checked)" />
          <span>{{ t('eulaConsent') }}</span>
        </label>
        <p class="paliro-legal-links">
          <button @click="openPolicy('privacy')">{{ t('privacyPolicy') }}</button>
          <span>{{ t('and') }}</span>
          <button @click="openPolicy('terms')">{{ t('terms') }}</button>
        </p>
      </div>
    </section>

      <section
        v-else-if="route === 'login' || route === 'signup'"
        :key="route"
        :class="[
          'paliro-auth',
          'paliro-view',
          {
            'paliro-auth-login': route === 'login',
            'paliro-auth-signup': route === 'signup',
          },
        ]"
      >
      <header class="paliro-auth-nav">
        <button :disabled="authBusy" :aria-label="t('back')" class="paliro-back" @click="openRoute('welcome')">‹</button>
        <h1 v-if="route === 'login'" class="paliro-login-title">{{ t('logIn') }}</h1>
        <h1 v-else class="paliro-signup-title">{{ t('createAccount') }}</h1>
      </header>
      <div class="paliro-auth-illustration" aria-hidden="true">
        <div class="paliro-book-glow"></div>
        <img
          alt=""
          :class="['paliro-login-book', { 'paliro-signup-witch': route === 'signup' }]"
          :src="route === 'signup' ? '/assets/paliro-signup-witch@2x.png' : '/assets/paliro-login-book@2x.png'"
        />
      </div>
      <div class="paliro-auth-content">
        <label class="paliro-field">
          <span>{{ t('emailAddress') }}</span>
          <input v-model="authForm.email" autocomplete="email" inputmode="email" :placeholder="t('enterEmail')" type="email" />
        </label>
        <label class="paliro-field">
          <span>{{ t('password') }}</span>
          <span class="paliro-password-control">
            <input v-model="authForm.password" :autocomplete="route === 'login' ? 'current-password' : 'new-password'" :placeholder="route === 'signup' ? t('signupPasswordPlaceholder') : t('enterPassword')" :type="showAuthPassword ? 'text' : 'password'" />
            <button :aria-label="showAuthPassword ? 'Hide password' : 'Show password'" :aria-pressed="showAuthPassword" class="paliro-password-visibility" type="button" @click="showAuthPassword = !showAuthPassword">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 12s3.3-5.5 9.5-5.5S21.5 12 21.5 12 18.2 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>
            </button>
          </span>
        </label>
        <label v-if="route === 'signup'" class="paliro-field">
          <span>{{ t('confirmPassword') }}</span>
          <span class="paliro-password-control">
            <input v-model="authForm.confirmPassword" autocomplete="new-password" :placeholder="t('repeatPassword')" :type="showConfirmPassword ? 'text' : 'password'" />
            <button :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'" :aria-pressed="showConfirmPassword" class="paliro-password-visibility" type="button" @click="showConfirmPassword = !showConfirmPassword">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 12s3.3-5.5 9.5-5.5S21.5 12 21.5 12 18.2 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>
            </button>
          </span>
        </label>
        <p v-if="errorMessage" class="paliro-error" role="alert">{{ errorMessage }}</p>
        <button :disabled="authBusy" :aria-busy="authBusy" class="paliro-primary-button" @click="route === 'login' ? submitLogin() : submitSignup()">
          {{ authBusy ? t('authProcessing') : route === 'login' ? t('logIn') : t('signUp') }}
        </button>
        <p class="paliro-switch-copy">
          {{ route === 'login' ? t('noAccount') : t('existingAccount') }}
          <button :disabled="authBusy" @click="openRoute(route === 'login' ? 'signup' : 'login')">{{ route === 'login' ? t('signUp') : t('logIn') }}</button>
        </p>
      </div>
    </section>

      <section v-else-if="route === 'setup'" key="setup" :class="['paliro-setup', 'paliro-view', `paliro-setup-step-${profileStep}`, { 'has-birthday-issue': profileStep === 2 && Boolean(birthdayIssue) }]">
        <header class="paliro-setup-nav">
          <button :disabled="authBusy" :aria-label="t('back')" class="paliro-back" @click="goBackFromProfile">‹</button>
          <h1>{{ profileStep === 3 ? t('interests') : t('setupProfile') }}</h1>
          <span aria-hidden="true"></span>
        </header>

        <div v-if="profileStep === 1" ref="setupScroll" class="paliro-setup-scroll paliro-profile-step-one">
          <button class="paliro-profile-avatar" aria-label="Use Violet avatar" type="button" @click="profile.avatar = avatars[0].key">
            <img :alt="`${currentAvatar.label} avatar`" :src="currentAvatar.src" />
            <span class="paliro-avatar-camera"><img alt="" src="/assets/paliro-profile-camera@2x.png" /></span>
          </button>
          <p class="paliro-preset-label">{{ t('choosePreset') }}</p>
          <div class="paliro-avatar-row" role="list" aria-label="Avatar presets">
            <button v-for="avatar in avatars.slice(1)" :key="avatar.key" :aria-label="`Use ${avatar.label} avatar`" :class="['paliro-avatar-option', { 'is-selected': profile.avatar === avatar.key }]" type="button" @click="profile.avatar = avatar.key">
              <img alt="" :src="avatar.src" />
            </button>
          </div>
          <label class="paliro-field paliro-nickname-field">
            <span>{{ t('nickname') }}</span>
            <input v-model.trim="profile.nickname" autocomplete="nickname" maxlength="32" :placeholder="t('nicknamePlaceholder')" type="text" />
          </label>
          <div class="paliro-mood-grid" aria-label="Current status">
            <button v-for="mood in moods" :key="mood.label" :class="['paliro-mood-chip', { 'is-selected': profile.mood === mood.label }]" type="button" @click="profile.mood = mood.label">
              <span aria-hidden="true">{{ mood.icon }}</span>{{ localizedMood(mood.label) }}
            </button>
          </div>
        </div>

        <div v-else-if="profileStep === 2" ref="setupScroll" class="paliro-setup-scroll paliro-profile-step-two">
          <label class="paliro-field paliro-bio-field">
            <span>{{ t('bio') }}</span>
            <small>{{ profile.bio.length }} / 150</small>
            <textarea v-model="profile.bio" maxlength="150" :placeholder="t('bioPlaceholder')"></textarea>
          </label>
          <p class="paliro-section-label">{{ t('gender') }}</p>
          <div class="paliro-segmented-control">
            <button v-for="option in ['Male', 'Female', 'Other']" :key="option" :class="{ 'is-selected': profile.gender === option }" type="button" @click="profile.gender = option">{{ localizedGender(option) }}</button>
          </div>
          <label class="paliro-field">
            <span>{{ t('birthday') }}</span>
            <span class="paliro-date-field"><input v-model="profile.birthday" :aria-label="t('birthday')" type="date" /><img alt="" src="/assets/paliro-profile-calendar@2x.png" /></span>
          </label>
          <p v-if="birthdayIssue" class="paliro-age-notice" role="alert"><strong>18+</strong>{{ birthdayIssue }}</p>
        </div>

        <div v-else ref="setupScroll" class="paliro-setup-scroll paliro-profile-step-three">
          <div class="paliro-interest-heading">
            <div>
              <h2>{{ t('pickInterests') }}</h2>
              <p>{{ t('selectAtLeastThree') }}</p>
            </div>
            <strong>{{ profile.interests.length }}/20 {{ t('selected') }}</strong>
          </div>
          <div class="paliro-chip-grid paliro-interest-grid">
            <button v-for="interest in interests" :key="interest" :class="['paliro-choice-chip', { 'is-selected': profile.interests.includes(interest) }]" type="button" @click="toggleInterest(interest)">{{ interest }}</button>
          </div>
        </div>
        <p v-if="errorMessage" class="paliro-error paliro-setup-error" role="alert">{{ errorMessage }}</p>
        <button :disabled="authBusy || (profileStep === 2 && Boolean(birthdayIssue))" :aria-busy="authBusy" class="paliro-primary-button paliro-setup-next" @click="nextProfileStep">{{ authBusy ? t('authProcessing') : profileStep === 3 ? t('done') : t('continue') }}</button>
      </section>

      <section v-else-if="route === 'home'" key="home" class="paliro-home paliro-view">
        <div class="paliro-home-stage">
          <div class="paliro-home-artboard">
            <img class="paliro-home-background" alt="" src="/assets/paliro-home-floating-boxes.gif" />
            <img class="paliro-home-title" :alt="t('boxRules')" :class="{ 'is-korean': languagePreference === 'ko' }" :src="languagePreference === 'ko' ? '/assets/paliro-home-title-ko@2x.png' : '/assets/paliro-home-title@2x.png'" />

          <button :aria-label="t('boxRules')" class="paliro-home-pill paliro-home-rule" type="button" @click="showBoxRules = true">
            <img alt="" :src="languagePreference === 'ko' ? '/assets/paliro-home-rule-button-ko@2x.png' : '/assets/paliro-home-rule-button@2x.png'" />
            <span v-if="languagePreference !== 'ko'">{{ t('rule') }}</span>
          </button>
          <button :aria-label="t('test')" class="paliro-home-pill paliro-home-guide" type="button" @click="openTopicTest">
            <img alt="" src="/assets/paliro-home-guide-button@2x.png" />
            <img alt="" class="paliro-home-test-icon" src="/assets/paliro-home-test-icon@2x.png" />
            <span>{{ t('test') }}</span>
          </button>

          <button
            v-for="box in [0, 1, 2, 3, 4, 5]"
            :key="box"
            :aria-label="`${t('boxRules')} ${box + 1}`"
            :class="['paliro-floating-box-target', `paliro-floating-box-${box + 1}`, { 'is-selected': selectedBox === box, 'is-selection-changing': boxSelectionAnimating === box }]"
            :aria-pressed="selectedBox === box"
            :disabled="isBoxActionLocked"
            type="button"
            @click="selectBox(box)"
            @animationend="boxSelectionAnimating === box && (boxSelectionAnimating = null)"
          ></button>

          <div class="paliro-home-free-panel">
            <p :key="boxSelectionHintPulse" :class="['paliro-home-instruction', { 'is-selection-alert': boxSelectionAlertActive }]" aria-live="polite">{{ homeNotice || t('homeInstruction') }}</p>
            <div class="paliro-home-free-copy">
              <span>{{ t('freeTime') }}</span>
              <strong>{{ freeBoxActionsLeft }}/{{ boxActionLimit }}</strong>
            </div>
            <div :class="{ 'is-rewarded': videoRewardPending && !showBoxRules }" class="paliro-home-progress" aria-label="Daily free box actions remaining" @animationend="finishVideoRewardFeedback">
              <span :style="boxProgressStyle"></span>
            </div>
          </div>

          <button :aria-busy="isBoxActionLocked" :class="['paliro-home-action', 'paliro-home-take', { 'is-paid': freeBoxActionsLeft === 0 }]" :disabled="isBoxActionLocked" type="button" @click="requestBoxAction('take')">
            <img alt="" src="/assets/paliro-home-take-button@2x.png" />
            <span class="paliro-home-action-label">{{ t('takeOne') }}</span>
            <span v-if="freeBoxActionsLeft === 0" class="paliro-home-price-badge">{{ PALIRO_BOX_ACTION_COST }} {{ t('coins') }} <img alt="" src="/assets/paliro-home-coin-star@2x.png" /></span>
          </button>
          <button :aria-busy="isBoxActionLocked" :disabled="isBoxActionLocked" :class="['paliro-home-action', 'paliro-home-make', { 'is-paid': freeBoxActionsLeft === 0 }]" type="button" @click="requestBoxAction('make')">
            <img alt="" src="/assets/paliro-home-make-button@2x.png" />
            <span class="paliro-home-action-label">{{ t('makeOne') }}</span>
            <small aria-live="polite">{{ makeBoxFreeCountLabel }}</small>
            <span v-if="freeBoxActionsLeft === 0" class="paliro-home-price-badge">{{ PALIRO_BOX_ACTION_COST }} {{ t('coins') }} <img alt="" src="/assets/paliro-home-coin-star@2x.png" /></span>
          </button>
          </div>

        </div>
      </section>


      <section v-else-if="route === 'messages'" key="messages" class="paliro-messages paliro-view">
        <header class="paliro-messages-nav">
          <h1>{{ t('messages') }}</h1>
          <button :aria-label="t('friendRequests')" class="paliro-message-notification" type="button" @click="openFriendRequests"><span aria-hidden="true"></span><i v-if="incomingFriendRequests.length" aria-hidden="true"></i></button>
        </header>
        <PaliroPullRefresh class="paliro-message-refresh" :target="messageListScroll" :enabled="messageListRequest.ready.value"
          :busy="messageListRequest.busy.value && messageListRequest.ready.value" :failed="messageListRequest.failed.value && messageListRequest.ready.value" :t="t" @refresh="requestMessageList" />
        <main ref="messageListScroll" class="paliro-messages-scroll" :aria-busy="messageListRequest.busy.value">
          <label class="paliro-message-search"><span aria-hidden="true">⌕</span><input v-model="messageSearch" :placeholder="t('searchMessages')" type="search" /></label>
          <h2>{{ t('conversations') }}</h2>
          <section v-if="!messageListRequest.ready.value && messageListRequest.busy.value" class="paliro-message-skeleton" role="status" :aria-label="t('listLoading')">
            <div v-for="row in 6" :key="row" aria-hidden="true"><i></i><span><b></b><b></b></span><small></small></div>
          </section>
          <section v-else-if="messageListRequest.failed.value && !messageListRequest.ready.value" class="paliro-message-empty"><h2>{{ t('listFailed') }}</h2><button type="button" @click="requestMessageList">{{ t('listRetry') }}</button></section>
          <section v-else-if="filteredConversations.length" :aria-label="t('conversations')" class="paliro-conversation-list">
            <button v-for="conversation in filteredConversations" :key="conversation.member.id" type="button" @click="openConversation(conversation.member.id)">
              <img :alt="`${conversation.member.name} avatar`" :src="memberAvatarSource(conversation.member)" />
              <span class="paliro-conversation-copy"><strong>{{ conversation.member.name }}</strong><small>{{ messagePreview(conversation.messages.at(-1)) }}</small></span>
              <span class="paliro-conversation-meta"><time>{{ formatConversationTime(conversation.messages.at(-1)?.sentAt) }}</time>
                <span v-if="conversation.isLocked" class="paliro-conversation-lock" role="img" :aria-label="t('friendRequestPendingTitle')"><PaliroChatIcon name="lock" /></span>
                <i v-else-if="conversation.unreadCount">{{ conversation.unreadCount }}</i>
              </span>
            </button>
          </section>
          <section v-else class="paliro-message-empty"><div aria-hidden="true">✦</div><h2>{{ t('noConversations') }}</h2><p>{{ t('noConversationsCopy') }}</p></section>
        </main>
      </section>

      <PaliroVideoCall v-else-if="route === 'video-call' && videoCallMember" key="video-call"
        :member="videoCallMember" :avatar="memberAvatarSource(videoCallMember)" :t="t"
        :request-permissions="requestVideoCallPermissions" :can-call="canContinueVideoCall" @close="closeVideoCall" />

      <section v-else-if="route === 'conversation'" key="conversation" class="paliro-conversation-view paliro-view"
        :class="{ 'is-recording': voiceRecording.state !== 'idle', 'has-keyboard': chatViewport.keyboard }"
        :style="chatViewport.height ? { height: chatViewport.height + 'px', top: chatViewport.top + 'px' } : {}"
        @pointermove="moveVoiceGesture" @pointerup="endVoiceGesture" @pointercancel="endVoiceGesture">
        <header class="paliro-chat-nav">
          <button :aria-label="t('back')" type="button" @click="closeConversation"><PaliroChatIcon name="back" /></button>
          <button v-if="activeConversation" class="paliro-chat-member" :aria-label="t('profile')" type="button" @click="openConversationProfile">
            <img alt="" :src="memberAvatarSource(activeConversation.member)" /><h1>{{ activeConversation.member.name }}</h1>
          </button>
          <button :aria-label="t('chatVideoCall')" :disabled="videoCallStarting" class="paliro-chat-video" type="button" @click="openConversationVideo"><PaliroChatIcon name="video" /></button>
          <button :aria-label="t('moreActions')" class="paliro-chat-more" type="button" @click="openConversationActions"><PaliroChatIcon name="more" /></button>
        </header>
        <main ref="conversationScroll" class="paliro-conversation-scroll" role="log" :aria-label="t('conversations')" aria-live="polite" @click="dismissConversationKeyboard">
          <article v-for="message in activeConversation?.messages ?? []" :key="message.id" :class="['paliro-chat-row', { 'is-self': message.sender === 'self' }]">
            <img v-if="message.sender !== 'self'" class="paliro-chat-avatar" alt="" :src="memberAvatarSource(activeConversation.member)" />
            <div :class="['paliro-message-bubble', { 'is-self': message.sender === 'self' }]">
              <button v-if="message.type === 'audio'" :aria-label="playingVoiceMessageID === message.id ? t('stopVoiceMessage') : t('playVoiceMessage')"
                :aria-pressed="playingVoiceMessageID === message.id" :disabled="voiceRecording.state !== 'idle'"
                class="paliro-audio-message" type="button" @click="toggleVoicePlayback(message)">
                <PaliroChatIcon :name="playingVoiceMessageID === message.id ? 'stop' : 'play'" />
                <span aria-hidden="true" class="paliro-audio-wave"><i v-for="(height, index) in [12, 20, 8, 24, 16, 20, 10]" :key="index"
                  :style="{ height: height + 'px' }" :class="{ 'is-played': playingVoiceMessageID === message.id && voicePlaybackProgress >= index / 7 }"></i></span>
                <strong>{{ formatVoiceDuration(message.durationSeconds) }}</strong>
              </button>
              <p v-else>{{ message.body }}</p>
              <time class="paliro-chat-message-time" :datetime="message.sentAt">{{ formatConversationTime(message.sentAt) }}</time>
            </div>
          </article>
        </main>
        <p v-if="conversationError || (voiceRecording.state === 'idle' && voiceRecording.error)" class="paliro-chat-error" role="alert">{{ conversationError || voiceRecording.error }}</p>
        <section v-if="voiceRecording.state !== 'idle'" class="paliro-voice-recording" :class="{ 'is-paused': voiceRecording.state !== 'recording', 'is-cancelling': voiceGestureCancelled }" :aria-label="t('voiceRecording')">
          <div class="paliro-voice-recording-head"><strong>{{ formatVoiceDuration(voiceRecording.durationSeconds) }}</strong>
            <span aria-hidden="true" class="paliro-voice-live-wave"><i v-for="height in [6, 18, 24, 12, 32, 8, 14]" :key="height" :style="{ height: height + 'px' }"></i></span>
            <span>{{ voiceGestureCancelled ? t('chatReleaseCancel') : voiceRecording.state === 'paused' ? t('chatRecordingPaused') : t('chatSlideCancel') }}</span>
          </div>
          <button class="paliro-record-mic" :aria-label="voiceRecording.state === 'paused' ? t('resumeRecording') : t('pauseRecording')" :disabled="voiceRecordingBusy || !['recording', 'paused'].includes(voiceRecording.state)" type="button"
            @click="voiceRecording.state === 'paused' ? resumeVoiceRecording() : pauseVoiceRecording()"><img alt="" src="/assets/paliro-chat-mic@2x.png" /></button>
          <p v-if="voiceRecording.error" role="alert">{{ voiceRecording.error }}</p>
          <p v-else>{{ voiceRecordingBusy ? t('chatRecordingProcessing') : voiceRecording.state === 'ready' ? t('chatRecordingReady') : t('chatHoldHint') }}</p>
          <div class="paliro-voice-recording-actions">
            <button :disabled="voiceRecording.state === 'cancelling'" type="button" @click="cancelVoiceRecording">{{ t('cancelRecording') }}</button>
            <button v-if="voiceRecording.state !== 'ready'" :disabled="voiceRecordingBusy || !['recording', 'paused'].includes(voiceRecording.state)" type="button" @click="voiceRecording.state === 'paused' ? resumeVoiceRecording() : pauseVoiceRecording()">{{ voiceRecording.state === 'paused' ? t('resumeRecording') : t('pauseRecording') }}</button>
            <button :disabled="voiceRecordingBusy || voiceRecording.durationSeconds < 1" type="button" @click="finishAndSendVoiceRecording">{{ t('send') }}</button>
          </div>
        </section>
        <form v-else class="paliro-conversation-composer" @submit.prevent="sendConversationMessage">
          <button :aria-label="t('voiceMessage')" class="paliro-composer-voice-trigger" type="button" @pointerdown.prevent="startVoiceGesture" @click="$event.detail === 0 && startVoiceRecording()"><img alt="" src="/assets/paliro-chat-mic@2x.png" /></button>
          <input ref="conversationInput" v-model="conversationDraft" :maxlength="280" :placeholder="t('messagePlaceholder')" :aria-label="t('messagePlaceholder')" type="text" enterkeyhint="send" autocomplete="off" @focus="scrollConversationToEnd(false)" @keydown.enter="$event.isComposing && $event.preventDefault()" />
          <button :aria-label="t('send')" :disabled="!conversationDraft.trim()" type="submit" @pointerdown.prevent><PaliroChatIcon name="send" /></button>
        </form>
      </section>

      <section v-else-if="route === 'friend-requests'" key="friend-requests" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('back')" class="paliro-back" type="button" @click="openMessages">‹</button>
          <h1>{{ t('friendRequests') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main class="paliro-me-secondary-scroll paliro-friend-requests-scroll">
          <h2>{{ t('pending') }}</h2>
          <section v-if="incomingFriendRequests.length" :aria-label="t('pending')" class="paliro-incoming-request-list">
            <article v-for="request in incomingFriendRequests" :key="request.id">
              <img :alt="`${request.member.name} avatar`" :src="request.member.avatar" />
              <div><strong>{{ request.member.name }}</strong><p>{{ request.message }}</p></div>
              <footer><button type="button" @click="acceptIncomingFriendRequest(request.id)">{{ t('accept') }}</button><button type="button" @click="declineIncomingFriendRequest(request.id)">{{ t('decline') }}</button></footer>
            </article>
          </section>
          <section v-else class="paliro-message-empty"><div aria-hidden="true">✦</div><h2>{{ t('noFriendRequests') }}</h2><p>{{ t('noFriendRequestsCopy') }}</p></section>
        </main>
      </section>

      <section v-else-if="route === 'me'" key="me" class="paliro-me paliro-view">
        <header class="paliro-me-nav">
          <h1>{{ t('meTitle') }}</h1>
        </header>

        <main class="paliro-me-scroll">
          <p v-if="profileLoading" class="paliro-profile-edit-notice" role="status">{{ t('authProcessing') }}</p>
          <p v-else-if="profileReadNotice" class="paliro-error" role="status">{{ profileReadNotice }}</p>
          <button v-if="profileSessionExpired" class="paliro-profile-edit-save" type="button" @click="leaveHome">{{ t('logIn') }}</button>
          <section class="paliro-me-identity" aria-labelledby="paliro-me-name">
            <div class="paliro-me-avatar-ring">
              <img :alt="`${currentMemberProfile.nickname || 'Paliro member'} avatar`" :src="currentMemberAvatar.src" />
            </div>
            <p class="paliro-me-mood"><span aria-hidden="true">{{ moods.find((item) => item.label === currentMemberProfile.mood)?.icon ?? '·' }}</span>{{ localizedMood(currentMemberProfile.mood) }}</p>
            <h2 id="paliro-me-name">{{ currentMemberProfile.nickname || t('defaultNickname') }}</h2>
            <p>{{ currentMemberProfile.bio || t('defaultBio') }}</p>
          </section>

          <section class="paliro-me-stats" aria-label="Profile statistics">
            <button :aria-label="`${profileMeta.followers} ${t('followers')}`" type="button" @click="openSocialDetail('followers')"><strong>{{ profileMeta.followers }}</strong><span>{{ t('followers') }}</span></button>
            <button :aria-label="`${profileMeta.following} ${t('following')}`" type="button" @click="openSocialDetail('following')"><strong>{{ profileMeta.following }}</strong><span>{{ t('following') }}</span></button>
            <button :aria-label="`${profileMeta.posts} ${t('posts')}`" type="button" @click="openSocialDetail('posts')"><strong>{{ profileMeta.posts }}</strong><span>{{ t('posts') }}</span></button>
          </section>

          <nav aria-label="Profile options" class="paliro-me-menu">
            <button v-for="item in meMenuItems" :key="item.key" type="button" @click="openMeMenu(item.key)">
              <span :class="['paliro-me-menu-icon', `is-${item.icon}`]" aria-hidden="true"></span>
              <span>{{ t(item.labelKey) }}</span>
              <i aria-hidden="true">›</i>
            </button>
          </nav>
        </main>

      </section>

      <section v-else-if="route === 'edit-profile'" key="edit-profile" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :disabled="profileSaving" :aria-label="t('backToMe')" class="paliro-back" type="button" @click="closeProfileEdit">‹</button>
          <h1>{{ t('editProfile') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main v-if="editableProfile" :inert="profileLoading || profileSaving" :aria-busy="profileLoading || profileSaving" class="paliro-me-secondary-scroll paliro-profile-edit-scroll">
          <p v-if="profileLoading" class="paliro-profile-edit-notice" role="status">{{ t('authProcessing') }}</p>
          <p v-else-if="profileReadNotice" class="paliro-error" role="status">{{ profileReadNotice }}</p>
          <section class="paliro-profile-edit-identity">
            <button :disabled="profileLoading || profileSaving" :aria-label="t('changeProfilePhoto')" class="paliro-profile-edit-avatar" type="button" @click="selectProfilePhotoSource">
              <img :alt="t('selectedPhoto')" :src="avatarForProfile(editableProfile).src" />
              <span aria-hidden="true"><img alt="" src="/assets/paliro-profile-camera@2x.png" /></span>
            </button>
            <button :disabled="profileLoading || profileSaving" class="paliro-profile-edit-photo-link" type="button" @click="selectProfilePhotoSource">{{ t('changeProfilePhoto') }}</button>
          </section>

          <label class="paliro-profile-edit-field">
            <span>{{ t('nickname') }}</span>
            <input :disabled="profileLoading || profileSaving" v-model.trim="editableProfile.nickname" autocomplete="nickname" maxlength="32" :placeholder="t('nicknamePlaceholder')" type="text" />
          </label>
          <label class="paliro-profile-edit-field paliro-profile-edit-bio">
            <span>{{ t('bio') }}</span>
            <textarea :disabled="profileLoading || profileSaving" v-model="editableProfile.bio" maxlength="150" :placeholder="t('bioPlaceholder')"></textarea>
            <small>{{ editableProfile.bio.length }}/150</small>
          </label>
          <section :aria-label="t('gender')" class="paliro-profile-edit-section">
            <span>{{ t('gender') }}</span>
            <div class="paliro-profile-edit-gender">
              <button :disabled="profileLoading || profileSaving" v-for="option in ['Male', 'Female', 'Other']" :key="option" :class="{ 'is-selected': editableProfile.gender === option }" type="button" @click="editableProfile.gender = option">{{ localizedGender(option) }}</button>
            </div>
          </section>
          <label class="paliro-profile-edit-field">
            <span>{{ t('birthday') }}</span>
            <span class="paliro-profile-edit-date"><input :disabled="profileLoading || profileSaving" v-model="editableProfile.birthday" :aria-label="t('birthday')" type="date" /><img alt="" src="/assets/paliro-profile-calendar@2x.png" /></span>
          </label>
          <p v-if="getBirthdayIssue(editableProfile.birthday)" class="paliro-age-notice" role="alert"><strong>18+</strong>{{ getBirthdayIssue(editableProfile.birthday) }}</p>
          <section :aria-label="t('currentStatus')" class="paliro-profile-edit-section">
            <span>{{ t('currentStatus') }}</span>
            <div class="paliro-profile-edit-moods">
              <button :disabled="profileLoading || profileSaving" v-for="mood in moods" :key="mood.label" :class="{ 'is-selected': editableProfile.mood === mood.label }" type="button" @click="editableProfile.mood = mood.label"><i aria-hidden="true">{{ mood.icon }}</i>{{ localizedMood(mood.label) }}</button>
            </div>
          </section>
          <p v-if="editProfileError" class="paliro-error" role="alert">{{ editProfileError }}</p>
          <p v-if="editProfileNotice" class="paliro-profile-edit-notice" role="status">{{ editProfileNotice }}</p>
          <button v-if="profileSessionExpired" class="paliro-profile-edit-save" type="button" @click="leaveHome">{{ t('logIn') }}</button>
          <button :disabled="profileLoading || profileSaving || profileSessionExpired" class="paliro-profile-edit-save" type="button" @click="saveEditedProfile">{{ profileSaving ? t('authProcessing') : t('save') }}</button>
        </main>
      </section>

      <section v-else-if="route === 'social-detail'" key="social-detail" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('backToMe')" class="paliro-back" type="button" @click="closeMeSecondary">‹</button>
          <h1>{{ socialDetailTitle }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main v-if="socialDetail === 'posts'" class="paliro-me-secondary-scroll paliro-profile-posts-scroll">
          <section v-if="socialDetailItems.length" :aria-label="socialDetailTitle" class="paliro-profile-post-grid">
            <article v-for="post in socialDetailItems" :key="post.id" class="paliro-profile-post-card">
              <video v-if="post.contentType === 'video'" :src="videoSource(post.source)" :poster="post.thumbnail" muted playsinline preload="metadata"></video>
              <div v-else :class="['paliro-profile-box-post-art', `is-${post.theme?.toLocaleLowerCase().replace(/[^a-z]+/g, '-')}`]" aria-hidden="true"><img v-if="post.coverImage" :src="post.coverImage" /><span v-else>✦</span></div>
              <span aria-hidden="true" class="paliro-profile-post-play">{{ post.contentType === 'video' ? '▶' : '✦' }}</span>
              <button :aria-label="t('deletePost')" class="paliro-profile-post-delete" type="button" @click="deleteProfilePost(post)">⌫</button>
              <div><strong>{{ post.title }}</strong><small>{{ post.contentType === 'video' ? post.caption : post.description }}</small></div>
            </article>
          </section>
          <section v-else class="paliro-me-empty-state paliro-profile-post-empty">
            <div aria-hidden="true" class="paliro-me-empty-orbit is-clear"><span></span></div>
            <h2>{{ t('noPostsFound') }}</h2>
          </section>
        </main>
        <main v-else class="paliro-me-secondary-scroll paliro-relation-scroll">
          <label class="paliro-relation-search"><span aria-hidden="true">⌕</span><input v-model="socialSearch" :placeholder="t('searchRelations')" type="search" /></label>
          <section v-if="filteredSocialDetailItems.length" :aria-label="socialDetailTitle" class="paliro-relation-list">
            <article v-for="member in filteredSocialDetailItems" :key="member.id">
              <button :aria-label="`${t('profile')} ${member.name}`" class="paliro-relation-member" type="button" @click="openSocialMemberProfile(member)">
                <img :alt="`${member.name} avatar`" :src="member.avatar" />
                <span><strong>{{ member.name }}</strong><small>{{ socialDetail === 'followers' ? t('memberJoined') : t('followingSince') }}</small></span>
              </button>
              <button v-if="socialDetail === 'followers'" :class="{ 'is-following': isFollowingSocialMember(member) }" :disabled="isFollowingSocialMember(member)" type="button" @click="updateSocialRelationship(member, 'follow')">{{ isFollowingSocialMember(member) ? t('following') : t('followBack') }}</button>
              <button v-else class="is-following" type="button" @click="updateSocialRelationship(member, 'toggle')">{{ t('unfollow') }}</button>
            </article>
          </section>
          <section v-else class="paliro-me-empty-state">
            <div aria-hidden="true" class="paliro-me-empty-orbit is-clear"><span></span></div>
            <h2>{{ socialDetailEmptyTitle }}</h2>
            <p>{{ socialDetailEmptyCopy }}</p>
          </section>
        </main>
      </section>

      <section v-else-if="route === 'my-videos'" key="my-videos" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('backToMe')" class="paliro-back" type="button" @click="closeMeSecondary">‹</button>
          <h1>{{ t('myVideos') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main v-if="publishedVideos.length" class="paliro-me-secondary-scroll paliro-my-videos-grid">
          <article v-for="video in publishedVideos" :key="video.id">
            <video :src="videoSource(video.source)" :poster="video.thumbnail" muted playsinline preload="metadata"></video>
            <div><strong>{{ video.title }}</strong><span>{{ video.likes }} {{ t('likes') }}</span></div>
          </article>
        </main>
        <main v-else class="paliro-me-secondary-scroll paliro-me-empty-state">
          <div aria-hidden="true" class="paliro-me-empty-orbit"><span></span></div>
          <h2>{{ t('noVideosTitle') }}</h2>
          <p>{{ t('noVideosCopy') }}</p>
        </main>
      </section>

      <section v-else-if="route === 'blocked-users'" key="blocked-users" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('backToMe')" class="paliro-back" type="button" @click="closeMeSecondary">‹</button>
          <h1>{{ t('blockedUsers') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main class="paliro-me-secondary-scroll paliro-blocked-users-scroll">
          <p class="paliro-blocked-users-notice"><span aria-hidden="true">!</span>{{ t('blockedUsersNotice') }}</p>
          <section v-if="blockedUsers.length" :aria-label="t('blockedUsers')" class="paliro-me-blocked-list">
            <article v-for="member in blockedUsers" :key="member.id">
              <img v-if="member.avatar" :alt="`${member.name} avatar`" class="paliro-me-blocked-avatar" :src="member.avatar" />
              <span v-else class="paliro-me-blocked-avatar">{{ member.name?.slice(0, 1) ?? '?' }}</span>
              <div><strong>{{ member.name || t('appName') }}</strong><small>{{ t('blockedStatus') }} · {{ formatSocialDate(member.blockedAt ?? member.reportedAt) }}</small></div>
              <button type="button" @click="unblockMember(member.id)">{{ t('unblock') }}</button>
            </article>
          </section>
          <section v-else class="paliro-me-empty-state">
            <div aria-hidden="true" class="paliro-me-empty-orbit is-clear"><span></span></div>
            <h2>{{ t('noBlockedTitle') }}</h2>
            <p>{{ t('noBlockedCopy') }}</p>
          </section>
        </main>
      </section>

      <section v-else-if="route === 'language'" key="language" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('backToMe')" class="paliro-back" type="button" @click="closeMeSecondary">‹</button>
          <h1>{{ t('language') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main class="paliro-me-secondary-scroll">
          <p class="paliro-me-secondary-intro">{{ t('languageIntro') }}</p>
          <button v-for="option in languageOptions" :key="option.code" :class="['paliro-me-language-option', { 'is-selected': languagePreference === option.code }]" type="button" @click="selectLanguage(option.code)">
            <span><strong>{{ t(option.labelKey) }}</strong><small>{{ option.detail }}</small></span><i aria-hidden="true">✓</i>
          </button>
          <p class="paliro-me-secondary-note">{{ t('languageFuture') }}</p>
        </main>
      </section>

      <section v-else-if="route === 'settings'" key="settings" class="paliro-me-secondary paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('backToMe')" class="paliro-back" type="button" @click="closeMeSecondary">‹</button>
          <h1>{{ t('settings') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <main class="paliro-me-secondary-scroll paliro-settings-scroll">
          <section :aria-label="t('account')" class="paliro-settings-section">
            <h2>{{ t('account') }}</h2>
            <div class="paliro-me-settings-group">
              <div><span>{{ t('linkedEmail') }}</span><strong>{{ session?.email }}</strong></div>
              <button type="button" @click="openAccountDeletionNotice"><span>{{ t('deleteAccount') }}</span><i aria-hidden="true">›</i></button>
            </div>
          </section>
          <section :aria-label="t('notifications')" class="paliro-settings-section">
            <h2>{{ t('notifications') }}</h2>
            <div class="paliro-me-settings-group">
              <button :aria-checked="pushNotificationsEnabled" class="paliro-settings-toggle-row" role="switch" type="button" @click="togglePushNotifications"><span>{{ t('pushNotifications') }}</span><i :class="{ 'is-on': pushNotificationsEnabled }" aria-hidden="true"></i></button>
            </div>
          </section>
          <section aria-label="About Paliro" class="paliro-settings-section">
            <h2>{{ t('about') }}</h2>
            <div class="paliro-me-settings-group">
              <button type="button" @click="openPolicy('terms', 'settings')"><span>{{ t('terms') }}</span><i aria-hidden="true">›</i></button>
              <button type="button" @click="openPolicy('privacy', 'settings')"><span>{{ t('privacyPolicy') }}</span><i aria-hidden="true">›</i></button>
              <div><span>{{ t('appVersion') }}</span><strong>v1.0.0</strong></div>
            </div>
          </section>
          <button class="paliro-me-sign-out" type="button" @click="leaveHome">{{ t('logOut') }}</button>
        </main>
      </section>

      <section v-else-if="route === 'report-user'" key="report-user" class="paliro-report-user paliro-view">
        <header class="paliro-me-secondary-nav">
          <button :aria-label="t('back')" class="paliro-back" type="button" @click="closeReportUser">‹</button>
          <h1>{{ t('reportUser') }}</h1>
          <span aria-hidden="true"></span>
        </header>
        <form class="paliro-report-scroll" @submit.prevent="submitReport">
          <section :aria-label="t('reportSelectReason')" class="paliro-report-reasons" role="radiogroup">
            <p class="paliro-report-section-title">{{ t('reportSelectReason') }}</p>
            <button
              v-for="reasonKey in reportReasons"
              :key="reasonKey"
              :aria-checked="reportReason === reasonKey"
              :class="{ 'is-selected': reportReason === reasonKey }"
              role="radio"
              type="button"
              @click="reportReason = reasonKey; reportError = ''"
            ><i aria-hidden="true"></i><span>{{ t(reasonKey) }}</span></button>
          </section>
          <label class="paliro-report-details">
            <span>{{ t('reportAdditionalDetails') }}</span>
            <textarea v-model="reportDetails" :maxlength="280" :placeholder="t('reportDetailsPlaceholder')"></textarea>
            <small>{{ reportDetails.length }}/280</small>
          </label>
          <p v-if="reportError" class="paliro-error" role="alert">{{ reportError }}</p>
          <button :disabled="!reportReason || reportSubmitting" class="paliro-report-submit" type="submit">{{ t('submit') }}</button>
        </form>
      </section>

      <section v-else-if="route === 'friend-profile'" key="friend-profile" class="paliro-friend-profile paliro-view">
        <header class="paliro-friend-profile-nav">
          <button :aria-label="t('back')" class="paliro-back" type="button" @click="closeMatchedFriendProfile">‹</button>
          <h1>{{ t('profile') }}</h1>
          <button :aria-label="t('moreActions')" class="paliro-friend-profile-more" type="button" @click="openFriendProfileActions"><span aria-hidden="true">•••</span></button>
        </header>
        <div class="paliro-friend-profile-scroll">
          <section class="paliro-friend-profile-hero">
            <img :alt="`${matchedFriend.nickname} profile background`" :src="matchedFriend.profileBackground || matchedFriend.avatar" />
            <button
              v-if="!isMatchedMutualFriend"
              :aria-label="friendRequestStatus === 'pending' ? t('requestSent') : t('addFriends')"
              :disabled="friendRequestStatus === 'pending'"
              :class="['paliro-friend-profile-request', { 'is-pending': friendRequestStatus === 'pending' }]"
              type="button"
              @click="openFriendRequestModal"
            >{{ friendRequestStatus === 'pending' ? t('requestSent') : t('addFriends') }}</button>
            <p class="paliro-friend-profile-mood"><span aria-hidden="true">{{ moods.find((item) => item.label === matchedFriend.mood)?.icon ?? '·' }}</span>{{ localizedMood(matchedFriend.mood) }}</p>
          </section>
          <section class="paliro-friend-profile-body">
            <div class="paliro-friend-profile-name"><h2>{{ matchedFriend.nickname }}</h2></div>
            <section :aria-label="`${matchedFriend.nickname} statistics`" class="paliro-friend-profile-stats">
              <div><strong>{{ matchedFriend.stats?.followers ?? 0 }}</strong><span>{{ t('followers') }}</span></div>
              <div><strong>{{ matchedFriend.stats?.following ?? 0 }}</strong><span>{{ t('following') }}</span></div>
              <div><strong>{{ matchedFriend.stats?.likes ?? 0 }}</strong><span>{{ t('likes') }}</span></div>
            </section>
            <section class="paliro-friend-profile-about">
              <h3>{{ t('about') }}</h3>
              <p>{{ matchedAbout }}</p>
            </section>
            <section class="paliro-friend-profile-posts">
              <h3>{{ t('memberPosts') }}</h3>
              <div>
                <article v-for="post in matchedMemberPosts" :key="post.id" :class="`is-${post.contentType}`">
                  <div class="paliro-friend-profile-post-media"><img v-if="post.contentType === 'box'" :alt="post.title" :src="post.thumbnail" /><video v-else :ref="(element) => setFriendProfileVideoElement(post.id, element)" :aria-label="post.title" loop muted playsinline preload="metadata" :poster="post.thumbnail" :src="videoSource(post.source)" @click="toggleFriendProfileVideo(post)" @pause="setFriendProfileVideoPlayback(post.id, false)" @play="setFriendProfileVideoPlayback(post.id, true)"></video><span v-if="post.contentType === 'box'" aria-hidden="true">✦</span><button v-else :aria-label="post.title" :aria-pressed="Boolean(friendProfileVideoPlayback[post.id])" :class="['paliro-friend-profile-post-play', { 'is-playing': friendProfileVideoPlayback[post.id] }]" type="button" @click.stop="toggleFriendProfileVideo(post)"><span aria-hidden="true">{{ friendProfileVideoPlayback[post.id] ? 'Ⅱ' : '▶' }}</span></button></div>
                  <p>{{ post.contentType === 'box' ? (post.description || post.title) : post.title }}</p>
                  <small>{{ post.contentType === 'box' ? post.theme : `${post.likes} ${t('likes')}` }}</small>
                </article>
              </div>
            </section>
          </section>
        </div>
        <footer class="paliro-friend-profile-actions">
          <button :class="{ 'is-followed': isMatchedFollowing }" :disabled="isMatchedBlocked" :aria-pressed="isMatchedFollowing" :aria-label="isMatchedFollowing ? t('unfollow') : t('follow')" type="button" @click="followMatchedFriend"><PaliroStateFeedback :value="isMatchedFollowing" kind="label">{{ isMatchedFollowing ? t('followed') : t('follow') }}</PaliroStateFeedback></button>
          <button :aria-disabled="!isMatchedMutualFriend" class="paliro-friend-profile-message" :class="{ 'is-locked': !isMatchedMutualFriend }" type="button" @click="openMatchedConversation"><span v-if="!isMatchedMutualFriend" aria-hidden="true" class="paliro-conversation-lock"><PaliroChatIcon name="lock" /></span>{{ t('message') }}</button>
          <button v-if="isMatchedMutualFriend" :aria-label="t('chatVideoCall')" :disabled="videoCallStarting" class="paliro-friend-profile-video" type="button" @click="openMatchedVideo"><PaliroChatIcon name="video" /></button>
        </footer>
      </section>

      <section v-else-if="route === 'wallet'" key="wallet" class="paliro-wallet paliro-view">
        <header class="paliro-wallet-nav">
          <button :aria-label="t('back')" class="paliro-back" type="button" @click="closeWallet">‹</button>
          <h1>{{ t('wallet') }}</h1>
          <span aria-hidden="true"></span>
        </header>

        <div class="paliro-wallet-scroll">
          <section class="paliro-wallet-balance" aria-live="polite">
            <img alt="" src="/assets/paliro-home-coin-star@2x.png" />
            <span>{{ t('myBalance') }}</span>
            <strong>{{ boxCoinBalance.toLocaleString() }}</strong>
            <small>{{ t('coins') }}</small>
          </section>

          <section class="paliro-wallet-packs" aria-labelledby="paliro-wallet-packs-title">
            <h2 id="paliro-wallet-packs-title">{{ t('purchaseCoins') }}</h2>
            <div class="paliro-wallet-pack-grid" role="list">
              <button
                v-for="pack in walletCoinPacks"
                :key="pack.productID"
                :aria-pressed="selectedWalletProductID === pack.productID"
                :class="['paliro-wallet-pack', { 'is-selected': selectedWalletProductID === pack.productID, 'needs-selection': walletSelectionRequired }]"
                type="button"
                @click="selectedWalletProductID = pack.productID; walletSelectionRequired = false"
              >
                <span v-if="pack.bestValue" class="paliro-wallet-best-value">{{ t('bestValue') }}</span>
                <img alt="" src="/assets/paliro-home-coin-star@2x.png" />
                <strong>{{ pack.coins.toLocaleString() }}</strong>
                <small>{{ t('coins') }}</small>
                <span class="paliro-wallet-pack-price">{{ pack.displayPrice }}</span>
              </button>
            </div>
          </section>
        </div>

        <footer class="paliro-wallet-footer">
          <button class="paliro-wallet-purchase" type="button" @click="purchaseSelectedCoinPack">
            {{ walletPurchaseLoading ? t('processing') : selectedWalletPack ? `${t('purchase')} ${selectedWalletPack.displayPrice}` : t('purchase') }}
          </button>
        </footer>
      </section>

      <section v-else-if="route === 'test'" key="test" class="paliro-test paliro-view">
        <img class="paliro-test-background" alt="" :src="testStage === 'complete' ? '/assets/paliro-test-complete-background@2x.png' : '/assets/paliro-test-background@2x.png'" />
        <button :aria-label="t('back')" class="paliro-test-back" type="button" @click="goBackFromTopicTest">‹</button>

        <div v-if="testStage === 'intro'" class="paliro-test-intro">
          <p>{{ t('testIntro') }}</p>
          <button class="paliro-test-primary" type="button" @click="startTopicTest">{{ t('start') }}</button>
        </div>

        <template v-else-if="testStage === 'question'">
          <header :aria-label="t('testProgress')" class="paliro-test-progress">
            <span>{{ t('question') }} {{ testStep + 1 }} {{ t('of') }} {{ testQuestions.length }}</span>
            <strong>{{ (testStep + 1) * 20 }}%</strong>
            <div><i :style="{ width: `${(testStep + 1) * 20}%` }"></i></div>
          </header>
          <div class="paliro-test-question">
            <h1>{{ t(testQuestion.titleKey) }}</h1>
            <template v-if="testQuestion.type === 'age'">
              <div class="paliro-test-age-card">
                <div><span>{{ t('targetAge') }}</span><strong>{{ testAgeMin }} - {{ testAgeMax }}</strong></div>
                <div class="paliro-test-range-row">
                  <input v-model.number="testAgeMin" aria-label="Minimum preferred age" max="50" min="18" type="range" @change="saveTestAgeRange" />
                  <input v-model.number="testAgeMax" aria-label="Maximum preferred age" max="50" min="18" type="range" @change="saveTestAgeRange" />
                </div>
                <small><span>18</span><span>50+</span></small>
              </div>
            </template>
            <div v-else class="paliro-test-options">
              <button
                v-for="option in testQuestion.options"
                :key="option"
                :class="{ 'has-icon': getTestOptionIcon(option), 'is-selected': testAnswers[testStep] === option }"
                type="button"
                @click="selectTestAnswer(option)"
              ><img v-if="getTestOptionIcon(option)" class="paliro-test-option-icon" alt="" :src="getTestOptionIcon(option)" />{{ localizedTestOption(option) }}</button>
            </div>
          </div>
          <button :disabled="!testAnswers[testStep]" class="paliro-test-primary paliro-test-next" type="button" @click="advanceTopicTest">{{ testStep === testQuestions.length - 1 ? t('done') : t('next') }}</button>
        </template>

        <div v-else class="paliro-test-complete">
          <h1>{{ t('testCompleteTitle') }}</h1>
          <p>{{ t('testCompleteCopy') }}</p>
          <button class="paliro-test-primary" type="button" @click="finishTopicTest">{{ t('ok') }}</button>
          <button class="paliro-test-repeat" type="button" @click="restartTopicTest">{{ t('testAgain') }}</button>
          <p v-if="testCompletionAwarded" class="paliro-test-reward">{{ t('testReward') }}</p>
          <p v-else class="paliro-test-retake-note">{{ t('testRetakeNote') }}</p>
        </div>
      </section>

      <section v-else-if="route === 'privacy' || route === 'terms'" key="policy" class="paliro-policy paliro-view">
      <header class="paliro-policy-nav">
        <button :aria-label="t('back')" class="paliro-back" @click="openRoute(policyOrigin)">‹</button>
        <h1>{{ pageTitle }}</h1>
        <span aria-hidden="true"></span>
      </header>
      <article ref="policyScroll" class="paliro-policy-copy">
        <p class="paliro-kicker">{{ t('appName') }}</p>
        <p class="paliro-policy-intro">{{ activePolicyCopy.intro }}</p>
        <section v-for="section in activePolicyCopy.sections" :key="section[0]">
          <h2>{{ section[0] }}</h2>
          <p v-for="paragraph in section[1]" :key="paragraph">{{ paragraph }}</p>
        </section>
      </article>
      </section>
    </Transition>

    <Teleport to="body">
      <div v-if="isOpeningBox" :class="['paliro-opening-overlay', `is-${boxOpeningStage}`]" :style="{ '--paliro-box-charge': `${PALIRO_BOX_OPENING_MOTION.revealAt}ms`, '--paliro-box-reveal': `${PALIRO_BOX_OPENING_MOTION.resultAt - PALIRO_BOX_OPENING_MOTION.revealAt}ms`, '--paliro-box-settle': `${PALIRO_BOX_OPENING_MOTION.settleDuration}ms` }" role="presentation">
        <section v-if="boxOpeningStage !== 'result'" aria-live="polite" :aria-label="t('openingBox')" class="paliro-opening-experience" role="status">
          <span class="paliro-opening-spark paliro-opening-spark-one" aria-hidden="true"></span>
          <span class="paliro-opening-spark paliro-opening-spark-two" aria-hidden="true"></span>
          <img :key="boxOpeningKey" :alt="t('openingBox')" class="paliro-opening-machine" src="/assets/paliro-open-box-machine.gif" />
        </section>

        <section v-else ref="matchResultDialog" :aria-label="matchedFriend.nickname" aria-describedby="paliro-match-copy" aria-modal="true" class="paliro-match-result" role="dialog" tabindex="-1" @keydown="trapMatchFocus">
          <div class="paliro-match-card">
            <img alt="" class="paliro-match-card-frame" src="/assets/paliro-match-card@2x.png" />
            <button :aria-label="t('reportUser')" class="paliro-match-report" type="button" @click="openReportUser('opening')"><img alt="" src="/assets/paliro-match-report@2x.png" /></button>
            <img :alt="matchedBoxPost?.title || `${matchedFriend.nickname} Box`" class="paliro-match-avatar" :src="matchedBoxPost?.images?.[0] || matchedFriend.avatar" />
            <div class="paliro-match-copy">
              <p id="paliro-match-copy">{{ matchedBoxPost?.description || matchedBoxPost?.title || '' }}</p>
            </div>
            <button v-if="!isMatchedBlocked" ref="matchPrimaryButton" :aria-label="friendRequestButtonLabel" :aria-pressed="friendRequestStatus === 'pending'" :class="['paliro-match-add-friend', { 'is-pending': friendRequestStatus === 'pending' }]" :disabled="friendRequestStatus === 'pending'" type="button" @click="openFriendRequestModal">
              <span>{{ friendRequestStatus === 'pending' ? t('requestSent') : t('addFriends') }}</span>
            </button>
          </div>
          <div class="paliro-match-result-actions">
            <button type="button" @click="closeMatchResult">{{ t('close') }}</button>
            <button type="button" @click="openMatchedFriendProfile">{{ t('viewProfile') }}</button>
          </div>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="isCreatingBox" :class="['paliro-make-flight-overlay', `is-${makeBoxFlightStage}`]" aria-live="polite" role="status">
        <div class="paliro-make-flight-experience">
          <span aria-hidden="true" class="paliro-make-flight-glow"></span>
          <span aria-hidden="true" class="paliro-make-flight-trail"></span>
          <img :alt="t('boxCraftingNotice')" class="paliro-make-flight-box" src="/assets/paliro-make-box-flight@2x.png" />
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="showFriendRequestModal" class="paliro-friend-request-backdrop" @click.self="closeFriendRequestModal">
        <section ref="friendRequestDialog" aria-describedby="paliro-friend-request-safety" aria-labelledby="paliro-friend-request-title" aria-modal="true" class="paliro-friend-request-dialog" role="dialog" tabindex="-1" @keydown.esc="closeFriendRequestModal" @keydown="trapFriendRequestFocus">
          <h2 id="paliro-friend-request-title">{{ t('friendRequest') }}</h2>
          <label class="paliro-friend-request-field" for="paliro-friend-request-message">
            <textarea id="paliro-friend-request-message" ref="friendRequestTextarea" v-model="friendRequestMessage" :maxlength="120" :placeholder="t('friendRequestPlaceholder')" :disabled="friendRequestSending"></textarea>
            <span>{{ friendRequestMessage.length }}/120</span>
          </label>
          <p id="paliro-friend-request-safety">{{ t('friendRequestSafety') }}</p>
          <p v-if="friendRequestError" class="paliro-error" role="alert">{{ friendRequestError }}</p>
          <div class="paliro-friend-request-actions">
            <button :disabled="friendRequestSending" type="button" @click="closeFriendRequestModal">{{ t('cancel') }}</button>
            <button :disabled="friendRequestSending" type="button" @click="sendMatchFriendRequest">{{ t('send') }}</button>
          </div>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="profileReminder" class="paliro-profile-reminder-backdrop" @click.self="profileReminder = ''">
        <section aria-modal="true" :class="['paliro-profile-reminder', { 'is-mutual-only': profileReminder === 'message' }]" role="dialog" aria-labelledby="paliro-profile-reminder-title" @keydown.esc="profileReminder = ''" @keydown.tab.prevent="profileReminderConfirm?.focus()">
          <img v-if="profileReminder === 'message'" aria-hidden="true" class="paliro-profile-reminder-art-image" src="/assets/paliro-mutual-friend-reminder@2x.png" srcset="/assets/paliro-mutual-friend-reminder@2x.png 2x, /assets/paliro-mutual-friend-reminder@3x.png 3x" alt="" />
          <span v-else aria-hidden="true" class="paliro-profile-reminder-art">✦</span>
          <h2 id="paliro-profile-reminder-title">{{ t(profileReminder === 'request-sent' ? 'friendRequestSentTitle' : profileReminder === 'request-pending' ? 'friendRequestPendingTitle' : 'messageMutualOnlyTitle') }}</h2>
          <p>{{ t(profileReminder === 'request-sent' ? 'friendRequestSentNotice' : profileReminder === 'request-pending' ? 'friendRequestPendingCopy' : 'messageMutualOnlyCopy') }}</p>
          <button ref="profileReminderConfirm" class="paliro-home-modal-button" type="button" @click="profileReminder = ''">{{ t('ok') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showFriendProfileActions" class="paliro-profile-safety-backdrop" @click.self="showFriendProfileActions = false">
        <section aria-modal="true" class="paliro-profile-safety-actions" role="dialog" :aria-label="t('moreActions')">
          <button type="button" @click="reportMatchedFriendFromProfile"><span aria-hidden="true">!</span>{{ t('reportUser') }}</button>
          <button type="button" @click="openFriendProfileBlockConfirm"><span aria-hidden="true">⊘</span>{{ t('blockUser') }}</button>
          <button type="button" @click="showFriendProfileActions = false">{{ t('cancel') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="showFriendProfileBlockConfirm" class="paliro-profile-safety-backdrop paliro-profile-block-backdrop" @click.self="closeFriendProfileBlockConfirm">
        <section ref="friendProfileBlockDialog" aria-describedby="paliro-profile-block-copy" aria-labelledby="paliro-profile-block-title" aria-modal="true" class="paliro-profile-block-dialog" role="dialog" @keydown.esc="closeFriendProfileBlockConfirm" @keydown.tab="trapFriendProfileBlockFocus">
          <span aria-hidden="true" class="paliro-profile-block-symbol"><PaliroChatIcon name="alert" /></span>
          <h2 id="paliro-profile-block-title">{{ blockMemberDialogTitle }}</h2>
          <p id="paliro-profile-block-copy">{{ t('blockMemberCopy') }}</p>
          <button ref="friendProfileBlockConfirm" type="button" @click="confirmBlockMatchedFriend">{{ t('blockConfirm') }}</button>
          <button type="button" @click="closeFriendProfileBlockConfirm">{{ t('cancel') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showVideoComments && selectedVideo" class="paliro-video-sheet-backdrop" @click.self="showVideoComments = false">
        <section aria-modal="true" class="paliro-video-comments-sheet" role="dialog" :aria-label="t('comments')">
          <header><h2>{{ t('comments') }} <span>({{ selectedVideoComments.length }})</span></h2><button :aria-label="t('close')" type="button" @click="showVideoComments = false">×</button></header>
          <main>
            <article v-for="comment in selectedVideoComments" :key="comment.id">
              <img v-if="commentAvatarSource(comment)" :alt="`${comment.authorName} avatar`" :src="commentAvatarSource(comment)" />
              <span v-else aria-hidden="true">{{ comment.authorName.slice(0, 1) }}</span>
              <div class="paliro-video-comment-copy"><strong>{{ comment.authorName }}</strong><p>{{ comment.body }}</p></div>
              <button :aria-label="t('likes')" :aria-pressed="comment.liked" :class="{ 'is-liked': comment.liked }" class="paliro-video-comment-like" type="button" @click="toggleVideoCommentLike(comment)"><PaliroStateFeedback :value="comment.liked" :positive="comment.liked" kind="like" aria-hidden="true">{{ comment.liked ? '♥' : '♡' }}</PaliroStateFeedback><small><PaliroStateFeedback :value="comment.likes" kind="count">{{ comment.likes }}</PaliroStateFeedback></small></button>
            </article>
          </main>
          <form @submit.prevent="submitVideoComment"><img :alt="`${currentMemberName} avatar`" class="paliro-video-comment-composer-avatar" :src="currentMemberAvatarSource" /><input v-model="videoCommentDraft" :maxlength="180" :placeholder="t('addComment')" type="text" /><button :disabled="!videoCommentDraft.trim()" type="submit">{{ t('postComment') }}</button></form>
          <p v-if="videoCommentError" class="paliro-video-form-error" role="alert">{{ videoCommentError }}</p>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showVideoActions && selectedVideo" class="paliro-video-sheet-backdrop" @click.self="showVideoActions = false">
        <section aria-modal="true" class="paliro-video-action-sheet" role="dialog" :aria-label="t('reportVideo')">
          <button type="button" @click="hideSelectedVideo"><span aria-hidden="true">◒</span>{{ t('notInterested') }}</button>
          <button type="button" @click="openVideoReport"><span aria-hidden="true">!</span>{{ t('reportVideo') }}</button>
          <button type="button" @click="blockSelectedVideoMember"><span aria-hidden="true">⊘</span>{{ t('blockUser') }}</button>
          <button type="button" @click="showVideoActions = false">{{ t('cancel') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showVideoReport && selectedVideo" class="paliro-video-sheet-backdrop" @click.self="showVideoReport = false">
        <form aria-modal="true" class="paliro-video-report-sheet" role="dialog" :aria-label="t('videoReportTitle')" @submit.prevent="submitVideoReport">
          <header><h2>{{ t('videoReportTitle') }}</h2><button :aria-label="t('close')" type="button" @click="showVideoReport = false">×</button></header>
          <p>{{ t('reportSelectReason') }}</p>
          <fieldset>
            <button v-for="reasonKey in reportReasons" :key="reasonKey" :aria-checked="videoReportReason === reasonKey" :class="{ 'is-selected': videoReportReason === reasonKey }" role="radio" type="button" @click="videoReportReason = reasonKey; videoReportError = ''"><i aria-hidden="true"></i>{{ t(reasonKey) }}</button>
          </fieldset>
          <label><span>{{ t('reportAdditionalDetails') }}</span><textarea v-model="videoReportDetails" :maxlength="280" :placeholder="t('reportDetailsPlaceholder')"></textarea></label>
          <p v-if="videoReportError" class="paliro-video-form-error" role="alert">{{ videoReportError }}</p>
          <button class="paliro-video-submit" :disabled="!videoReportReason" type="submit">{{ t('submit') }}</button>
        </form>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showVideoPublish" class="paliro-video-publish-backdrop" @click.self="closeVideoPublish">
        <form aria-modal="true" class="paliro-video-publish-sheet" role="dialog" :aria-label="t('videoPublishTitle')" @submit.prevent="publishVideo">
          <header><button :aria-label="t('back')" :disabled="videoSelectionBusy || videoPublishLoading" type="button" @click="closeVideoPublish">‹</button><h2>{{ t('publish') }}</h2><span aria-hidden="true"></span></header>
          <p :class="['paliro-video-reward-banner', { 'is-claimed': !videoRewardAvailable }]">{{ videoRewardAvailable ? t('videoRewardBanner') : t('videoRewardClaimed') }}</p>
          <section class="paliro-video-publish-media">
            <video v-if="videoPublishDraft.source" :key="videoPublishDraft.source" :src="videoSource(videoPublishDraft.source)" :poster="videoPublishDraft.thumbnail" preload="metadata" controls muted playsinline></video>
            <button v-else :disabled="videoSelectionBusy" :aria-label="videoPublishSource === 'camera' ? t('recordVideo') : t('chooseVideo')" type="button" @click="beginVideoSelection"><span aria-hidden="true">+</span><strong>{{ videoSelectionBusy ? t('processing') : videoPublishSource === 'camera' ? t('recordVideo') : t('chooseVideo') }}</strong></button>
          </section>
          <button v-if="videoPublishDraft.source" class="paliro-video-reselect" :disabled="videoSelectionBusy" type="button" @click="beginVideoSelection">{{ videoSelectionBusy ? t('processing') : t('replaceVideo') }}</button>
          <div class="paliro-video-publish-sources"><button :aria-pressed="videoPublishSource === 'library'" :class="{ 'is-selected': videoPublishSource === 'library' }" type="button" @click="selectVideoPublishSource('library')"><span aria-hidden="true">▧</span>{{ t('videoLibrary') }}</button><button :aria-pressed="videoPublishSource === 'camera'" :class="{ 'is-selected': videoPublishSource === 'camera' }" type="button" @click="selectVideoPublishSource('camera')"><span aria-hidden="true">▣</span>{{ t('recordVideo') }}</button></div>
          <label><span>{{ t('videoPublishCaption') }}</span><textarea v-model="videoPublishDraft.caption" :maxlength="180" :placeholder="t('videoPublishCaptionPlaceholder')"></textarea><small>{{ videoPublishDraft.caption.length }}/180</small></label>
          <p v-if="videoPublishError" class="paliro-video-form-error" role="alert">{{ videoPublishError }}</p>
          <button class="paliro-video-submit" :disabled="videoPublishLoading || videoSelectionBusy" type="submit">{{ videoPublishLoading || videoSelectionBusy ? t('processing') : t('publish') }}</button>
        </form>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="showVideoPublishReward" class="paliro-video-reward-backdrop" @click.self="showVideoPublishReward = false">
        <section aria-describedby="paliro-video-reward-copy" aria-labelledby="paliro-video-reward-title" aria-modal="true" class="paliro-video-reward-dialog" role="dialog">
          <div class="paliro-reward-art" aria-hidden="true"><img alt="" src="/assets/paliro-make-box-flight@2x.png" /><span>+1</span></div>
          <h2 id="paliro-video-reward-title">{{ t('videoRewardTitle') }}</h2>
          <p id="paliro-video-reward-copy">{{ t('videoRewardCopy') }}</p>
          <button type="button" @click="showVideoPublishReward = false">{{ t('videoRewardConfirm') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="showFriendshipCelebration && acceptedFriend" class="paliro-friendship-backdrop" @click.self="closeFriendshipCelebration">
        <section aria-describedby="paliro-friendship-copy" aria-labelledby="paliro-friendship-title" aria-modal="true" class="paliro-friendship-dialog" role="dialog">
          <div aria-hidden="true" class="paliro-friendship-avatars"><img :src="currentMemberAvatar.src" /><img :src="acceptedFriend.avatar" /></div>
          <h2 id="paliro-friendship-title">{{ t('youAnd') }} {{ acceptedFriend.name }} {{ t('areFriends') }}</h2>
          <p id="paliro-friendship-copy">{{ t('friendsWithCopy') }}</p>
          <button type="button" @click="messageAcceptedFriend">{{ t('sendMessage') }}</button>
          <button type="button" @click="closeFriendshipCelebration">{{ t('maybeLater') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="showBoxComposer" class="paliro-composer-backdrop" @click.self="closeBoxComposer">
        <section aria-labelledby="paliro-composer-title" aria-modal="true" class="paliro-composer" role="dialog">
          <button :aria-label="t('close')" class="paliro-composer-close" type="button" @click="closeBoxComposer"><img alt="" src="/assets/paliro-composer-close@2x.png" /></button>
          <h2 id="paliro-composer-title">{{ t('createBoxTitle') }}</h2>
          <p class="paliro-composer-photo-label">{{ t('addPhoto') }} ({{ composerImages.length }}/3)</p>
          <div class="paliro-composer-images">
            <figure v-for="(image, index) in composerImages" :key="image"><img :alt="t('selectedPhoto')" :src="image" /><button :aria-label="t('removePhoto')" type="button" @click="removeComposerImage(index)">×</button></figure>
            <button v-if="composerImages.length < 3" :aria-label="t('addPhoto')" class="paliro-composer-add-image" type="button" @click="addComposerImage">+</button>
          </div>
          <label class="paliro-composer-message"><span>{{ t('boxMessage') }}</span><textarea v-model="composerText" :maxlength="100" :placeholder="t('boxMessagePlaceholder')"></textarea><small>{{ composerText.length }}/100</small></label>
          <p class="paliro-composer-requirements">{{ t('boxPostRequirements') }}</p>
          <p v-if="composerError" class="paliro-error" role="alert">{{ composerError }}</p>
          <button :disabled="isCreatingBox || !composerImages.length || !composerText.trim()" class="paliro-composer-post" type="button" @click="publishComposerBox"><span>{{ t('post') }}</span></button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showMediaSourcePicker" class="paliro-media-source-backdrop" @click.self="showMediaSourcePicker = false">
        <section aria-modal="true" class="paliro-media-source" role="dialog">
          <h2>{{ t('addPhoto') }}</h2>
          <button type="button" @click="pickComposerImage('library')">{{ t('photoLibrary') }}</button>
          <button type="button" @click="pickComposerImage('camera')">{{ t('camera') }}</button>
          <button type="button" @click="showMediaSourcePicker = false">{{ t('cancel') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showProfilePhotoSourcePicker" class="paliro-media-source-backdrop" @click.self="showProfilePhotoSourcePicker = false">
        <section aria-modal="true" class="paliro-media-source" role="dialog">
          <h2>{{ t('changeProfilePhoto') }}</h2>
          <button type="button" @click="pickProfilePhoto('library')">{{ t('photoLibrary') }}</button>
          <button type="button" @click="pickProfilePhoto('camera')">{{ t('camera') }}</button>
          <button type="button" @click="showProfilePhotoSourcePicker = false">{{ t('cancel') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="sheet">
      <div v-if="showAccountDeletionNotice" class="paliro-media-source-backdrop paliro-delete-backdrop" :style="chatViewport.height ? { height: chatViewport.height + 'px', top: chatViewport.top + 'px' } : {}" @click.self="closeAccountDeletion" @keydown.esc="closeAccountDeletion">
        <form ref="accountDeletionDialog" tabindex="-1" aria-modal="true" aria-labelledby="paliro-delete-title" aria-describedby="paliro-delete-copy" :aria-busy="accountDeletionBusy" class="paliro-media-source paliro-delete-dialog" role="dialog" @keydown.tab="trapAccountDeletionFocus" @submit.prevent="confirmAccountDeletion">
          <h2 id="paliro-delete-title">{{ t('deleteAccount') }}</h2>
          <p id="paliro-delete-copy" class="paliro-account-deletion-copy">{{ t('deleteAccountNotice') }}</p>
          <label class="paliro-field"><span>{{ t('password') }}</span><input ref="accountDeletionInput" v-model="accountDeletionPassword" :disabled="accountDeletionBusy" type="password" autocomplete="current-password" maxlength="128" :placeholder="t('enterPassword')" /></label>
          <p v-if="accountDeletionError" class="paliro-error" role="alert">{{ accountDeletionError }}</p>
          <button v-if="accountDeletionExpired" type="button" @click="leaveHome">{{ t('logIn') }}</button>
          <button class="paliro-delete-confirm" :disabled="accountDeletionBusy || accountDeletionExpired" type="submit">{{ accountDeletionBusy ? t('authProcessing') : t('deleteAccount') }}</button>
          <button :disabled="accountDeletionBusy" type="button" @click="closeAccountDeletion">{{ t('cancel') }}</button>
        </form>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Transition name="paliro-rules-sheet" appear>
    <div v-if="showBoxRules && route === 'home' && homePageReady" class="paliro-rules-backdrop" role="presentation">
      <section class="paliro-rules-experience" aria-modal="true" role="dialog" aria-labelledby="paliro-box-rules-title">
        <img class="paliro-rules-frame" alt="" src="/assets/paliro-rules-frame@2x.png" />
        <button :aria-label="t('close')" class="paliro-rules-close" type="button" @click="dismissBoxRules">
          <img alt="" src="/assets/paliro-rules-close@2x.png" />
        </button>
        <div class="paliro-rules-copy">
          <h2 id="paliro-box-rules-title">{{ t('boxRules') }}</h2>
          <p>{{ t('ruleOne') }}</p><p>{{ t('ruleTwo') }}</p><p>{{ t('ruleThree') }}</p><p>{{ t('ruleFour') }}</p>
        </div>
        <img class="paliro-rules-card" :alt="t('exampleBoxCard')" src="/assets/paliro-rules-card@2x.png" />
      </section>
    </div>
    </Transition>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="showCoinPrompt" class="paliro-home-modal-backdrop" role="presentation" @click.self="dismissCoinPrompt">
        <section class="paliro-home-coin-modal" aria-describedby="paliro-coin-copy" aria-modal="true" role="dialog" aria-labelledby="paliro-coin-title">
          <img class="paliro-home-coin-art" :alt="t('coinPromptArt')" src="/assets/paliro-home-coin-modal-art@2x.png" />
          <h2 id="paliro-coin-title">{{ t('reminder') }}</h2>
          <p id="paliro-coin-copy">{{ t('spendCoinsPrompt') }} {{ PALIRO_BOX_ACTION_COST }} {{ t('coins') }}: {{ pendingBoxActionLabel }}. {{ t('myBalance') }}: {{ boxCoinBalance }} {{ t('coins') }}.</p>
          <p v-if="coinPromptError" class="paliro-home-coin-error" role="alert">{{ coinPromptError }}</p>
          <button :disabled="Boolean(coinPromptError)" class="paliro-home-modal-button" type="button" @click="confirmCoinSpend">{{ t('confirm') }}</button>
          <button class="paliro-home-modal-secondary" type="button" @click="dismissCoinPrompt">{{ t('maybeLater') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <Teleport to="body">
      <PaliroOverlayTransition kind="dialog">
      <div v-if="walletDialogMessage" class="paliro-wallet-dialog-backdrop" role="presentation" @click.self="walletDialogMessage = ''">
        <section aria-describedby="paliro-wallet-dialog-copy" aria-labelledby="paliro-wallet-dialog-title" aria-modal="true" class="paliro-wallet-dialog" role="alertdialog">
          <h2 id="paliro-wallet-dialog-title">{{ t('wallet') }}</h2>
          <p id="paliro-wallet-dialog-copy">{{ walletDialogMessage }}</p>
          <button class="paliro-home-modal-button" type="button" @click="walletDialogMessage = ''">{{ t('ok') }}</button>
        </section>
      </div>
      </PaliroOverlayTransition>
    </Teleport>

    <PaliroOverlayTransition>
    <div v-if="showEula" class="paliro-modal-backdrop" role="presentation">
      <section class="paliro-eula-modal" aria-modal="true" role="dialog" aria-labelledby="paliro-eula-title">
        <header class="paliro-eula-header">
          <p class="paliro-kicker">{{ activeEulaCopy.kicker }}</p>
          <h2 id="paliro-eula-title">{{ activeEulaCopy.title }}</h2>
          <p class="paliro-eula-summary">{{ activeEulaCopy.summary }}</p>
        </header>
        <div class="paliro-eula-copy" tabindex="0">
          <section v-for="section in activeEulaCopy.sections" :key="section[0]">
            <h3>{{ section[0] }}</h3>
            <p v-for="paragraph in section[1]" :key="paragraph">{{ paragraph }}</p>
          </section>
        </div>
        <footer class="paliro-eula-actions">
          <button class="paliro-eula-cancel" @click="cancelEula">{{ t('cancel') }}</button>
          <button class="paliro-primary-button" @click="agreeToEula">{{ t('agree') }}</button>
        </footer>
      </section>
    </div>
    </PaliroOverlayTransition>
  </main>
</template>
