# Paliro: Vue + native WKWebView

The app no longer depends on Capacitor, Cordova, or CocoaPods. Vue still owns the existing pages and business logic. UIKit owns the WebView, system permissions, media operations, Keychain and StoreKit.

## Build and run

From this project directory:

```sh
pnpm install
pnpm ios:sync
open ../PaDlroliroBox/PaDlroliroBox.xcodeproj
```

Select the `PaDlroliroBox` scheme and an actual connected iPhone or a named iPhone simulator. A generic `Any iOS Device` destination is for building/archiving, not running. Simulator builds cannot be installed on a physical iPhone. Keep the existing signing team and provisioning configuration for device/archive builds.

After changing Vue files, run `pnpm ios:sync` before rebuilding in Xcode. The sync script replaces only generated `../PaDlroliroBox/PaDlroliroBox/public` resources, never app user data. No `pod install` or `cap sync` is needed. The standalone workspace is also usable and contains only the app project.

During synchronization, resources are not encrypted as individual files. They are packed first, compressed as a whole, and then protected with two independent AES-256-GCM layers:

- `PaliroWebVault/paliro-bootstrap.pwb` is one complete archive for HTML, JavaScript, CSS and related Web code. It is authenticated, decrypted and decompressed into memory during bootstrap.
- `PaliroWebVault/paliro-assets-<version>.pwb` is one complete archive for all non-auth images, GIFs, audio and video. On first demand, the whole archive is authenticated, decrypted and decompressed into `Application Support/PaliroWebCache/<version>`. The cache uses iOS complete-until-first-authentication file protection, is excluded from backup, and is reused on later launches. An app build carrying a new archive version replaces the old cache.
- Launch, first-transition, welcome, login, signup and profile-setup artwork plus bundled fonts stay as ordinary bundle resources, so the first launch and authentication flow never waits for the large main archive.

The two archives are a startup/main split, not per-file encrypted output. The main archive is deliberately extracted as a unit so video and audio can continue using byte-range reads after the first preparation. A first visit to the authenticated main experience may therefore spend time preparing the full asset cache; subsequent launches reuse it. The embedded keys and encrypted bundle deter casual inspection but cannot provide server-grade secrecy against a determined reverse engineer because the native app must contain decryption material and the reusable cache is readable after the device has been unlocked.

## Bridge contract

The `@main` AppDelegate creates the UIWindow and PaliroBridgeViewController in code. There is no Main.storyboard or UIMainStoryboardFile entry. The existing app-delegate lifecycle is retained; this change does not introduce a scene delegate. PaliroLaunchScreen.storyboard remains only for the system launch screen, while the controller builds its WebView and localized launch overlay in code.

`public/paliro-native.js` is injected by WKWebView at document start, before Vue runs. `src/services/paliroNativeBridge.js` exposes Promise-based service calls. Messages travel through `window.webkit.messageHandlers.paliro`; replies and purchase events return through `window.PaliroNative`.

| Service | Methods |
| --- | --- |
| PaliroAuthStorage | read, write, remove |
| PaliroLaunchScreen | hide, setLanguage |
| PaliroMediaPicker | pick |
| PaliroVoiceRecorder | start, pause, resume, stop, cancel, discard |
| PaliroCallPermissions | request |
| PaliroIap | getProducts, purchase; purchaseResult event |

Native validates the main frame, local origin, service and method allowlist. External pages cannot navigate inside the privileged WebView. Only bundled Web resources and files inside PaliroVideos/PaliroVoiceMessages are served; symlink/path traversal outside these locations is rejected. Video/audio byte-range requests are supported.

`PaliroAuthStorage` keeps server credentials in Keychain when it is available. If Security.framework rejects Keychain access because of a device, simulator, signature or provisioning condition, it switches this installation to an atomic Application Support file protected with `completeFileProtectionUntilFirstUserAuthentication` and excluded from backup. It never falls back to Web storage. Logout/account deletion clear both locations; uninstall removes the protected fallback and the installation marker, while a clean launch also attempts to remove any Keychain item left by an earlier install.

## Upgrade and data compatibility

The existing Bundle ID, Keychain identifiers, UserDefaults keys and WKWebsiteDataStore remain unchanged. The local `capacitor://localhost` URL is intentionally retained solely as a legacy storage origin: changing it would hide existing localStorage accounts, conversations and preferences. It is now handled by our own WKURLSchemeHandler, not the removed framework. Legacy `/_capacitor_file_` media URLs remain readable under the same restricted file rules. Production API URLs and backend code are unchanged.

The launch overlay stays until Vue reports readiness. Native keyboard notifications resize the WebView; existing Vue scrolling and visualViewport handling remain in use.

## Permissions and functional limits

### Installation language

- On a fresh installation, only a Korean primary device language (including ko-KR) selects Korean. All other primary languages select English; region/IP are not used. Native resolves this before WebView creation and injects the result before HTML paints.
- The resolved initial choice and every manual change are saved for this installation in UserDefaults and localStorage. Logout, login, account switching and server profile refresh do not override the current App language. Existing installed preferences are preserved when upgrading.
- Settings switches UI, runtime launch artwork and discovery fixtures immediately. Existing conversations, sent greetings, posts and relationships are not deleted or translated.
- Ordinary deletion and reinstallation starts with a new sandbox and repeats device-language detection. Offloading with retained data, or restoring an OS backup, is not a clean installation. Language is not stored in Keychain or restored from the account server.
- The system launch storyboard contains only a shared background and logo, with no English/Korean name. The native/WebView transition uses the saved language's artwork. Desktop app names and native permission prompts use iOS localization (English fallback, Korean resources); the in-app selector cannot force system-owned text to change instantly.

Language QA: clean install with Korean, English, Chinese and Japanese primary language; manual English/Korean switching then relaunch/logout/login; login with an account whose server language differs; verify settings selection, runtime launch art, Box/video fixtures and retained conversations. Use a dedicated simulator for deletion tests, not a user's app sandbox.

### Language change files and verification (2026-09-14)

Paths below are relative to this project directory.

| Files | Purpose |
| --- | --- |
| `src/services/paliroLanguage.js` | Shared language resolver and runtime launch artwork mapping. |
| `src/services/paliroLocalStore.js` | Installation-level preference takes precedence over accounts; server login does not replace it; default discovery/video/Box language follows it. |
| `src/services/paliroI18n.js` | Localized settings options and English fallback for UI/legal copy. |
| `src/PaliroEntryApp.vue` | Reactive launch artwork, background and settings labels. |
| `public/paliro-launch.js`, `index.html` | Resolve/persist language before the first HTML paint, with a neutral background fallback. |
| `../PaDlroliroBox/PaDlroliroBox/PaliroBridgeViewController.swift` | Resolve/persist native initial language before WebView creation; retain manual choices. |
| `../PaDlroliroBox/PaDlroliroBox/Info.plist`, `../PaDlroliroBox/PaDlroliroBox.xcodeproj/project.pbxproj` | English development fallback and app-name baseline; retain existing English/Korean InfoPlist.strings. |
| `../PaDlroliroBox/PaDlroliroBox/Base.lproj/PaliroLaunchScreen.storyboard` | Language-neutral system launch background/logo; retains the pure-code main entry. |
| `../PaDlroliroBox/PaDlroliroBox/Assets.xcassets/PaliroLaunchSpace.imageset/Contents.json`, `paliro-welcome-space-background@2x.png` | Reuse the existing space background without modifying the artwork. |
| `../PaDlroliroBox/PaDlroliroBox/Assets.xcassets/PaliroLaunchLogo.imageset/Contents.json`, `paliro-launch-logo.pdf` | Reuse the existing logo with a vector rounded-rectangle clip: 20pt radius at the 70pt reference width. No runtime attributes in LaunchScreen. |
| `scripts/paliro-build-launch-logo.swift` | Rebuild the clipped launch asset with `xcrun swift scripts/paliro-build-launch-logo.swift`; preserves the original AppIcon image and existing launch layout. |
| `scripts/paliro-language-persistence.test.mjs`, `scripts/paliro-launch-language.test.mjs`, `scripts/paliro-launch-transition.test.mjs` | Language priority, reinstall, account/server isolation, data language, first frame and neutral launch checks. |
| `dist/index.html`, `dist/paliro-launch.js`, `dist/assets/index-*.js`, generated `../PaDlroliroBox/PaDlroliroBox/public/` | Rebuilt and synchronized distribution resources. |
| `PALIRO_NATIVE_WEBVIEW.md` | Rules, limitations, file inventory and verification record. |

Verification uses the Node regression suite plus Debug and Release compilation of the `App` target. Existing conversation and relationship preservation is covered by Node tests. Physical-device system permission dialogs and large-screen visual checks remain manual checks.

- Selecting an upload category only changes the selection. Tapping upload opens the native flow.
- Photo/video library selection requests Photos access and accepts limited access.
- Taking a photo requests Camera; recording a video requests Camera and Microphone.
- Voice recording requests Microphone. Video-call entry requests Camera and Microphone.
- iOS displays the system alert only while authorization is undetermined. Denied access requires changing system settings; no fake permission alert is used.
- Real camera capture and actual permission-denial/re-enable flows still require physical-device testing.
- Existing call behavior remains permission checking and waiting for an answer, not a new RTC/signaling service. Media publishing remains the existing local persistence flow, not a newly added server upload endpoint.

## Tests

```sh
node --test scripts/*.test.mjs
xcodebuild -project ../PaDlroliroBox/PaDlroliroBox.xcodeproj -scheme PaDlroliroBox \
  -configuration Debug -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build
```

Manual device checklist: library allow/limited/deny/cancel; camera and microphone allow/deny; video cover and playback; recording pause/resume/cancel and minimum duration; leaving chat releases recording; keyboard open/close on login and chat; English/Korean cold launches; logout/relogin; StoreKit sandbox callbacks.
