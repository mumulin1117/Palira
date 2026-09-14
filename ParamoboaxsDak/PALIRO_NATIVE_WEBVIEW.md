# Paliro: Vue + native WKWebView

The app no longer depends on Capacitor, Cordova, or CocoaPods. Vue still owns the existing pages and business logic. UIKit owns the WebView, system permissions, media operations, Keychain and StoreKit.

## Build and run

From this project directory:

```sh
pnpm install
pnpm ios:sync
open ios/App/App.xcodeproj
```

Select the `App` scheme and an actual connected iPhone or a named iPhone simulator. A generic `Any iOS Device` destination is for building/archiving, not running. Simulator builds cannot be installed on a physical iPhone. Keep the existing signing team and provisioning configuration for device/archive builds.

After changing Vue files, run `pnpm ios:sync` before rebuilding in Xcode. The sync script replaces only generated `ios/App/App/public` resources, never app user data. No `pod install` or `cap sync` is needed. The old workspace is also usable but contains only the app project.

## Bridge contract

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

## Upgrade and data compatibility

The existing Bundle ID, Keychain identifiers, UserDefaults keys and WKWebsiteDataStore remain unchanged. The local `capacitor://localhost` URL is intentionally retained solely as a legacy storage origin: changing it would hide existing localStorage accounts, conversations and preferences. It is now handled by our own WKURLSchemeHandler, not the removed framework. Legacy `/_capacitor_file_` media URLs remain readable under the same restricted file rules. Production API URLs and backend code are unchanged.

The launch overlay stays until Vue reports readiness. Native keyboard notifications resize the WebView; existing Vue scrolling and visualViewport handling remain in use.

## Permissions and functional limits

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
xcodebuild -project ios/App/App.xcodeproj -scheme PaliroNativeTests \
  -destination 'platform=iOS Simulator,id=YOUR_TEST_SIMULATOR_ID' test
```

Run the native suite on a dedicated test simulator. It verifies actual JavaScript/native replies, Keychain reads, resource byte ranges, file isolation, method allowlists, video playback and keyboard resizing. It does not grant microphone/camera access, start purchases, or send messages. Use a separate test account for manual permission and publishing checks.

Manual device checklist: library allow/limited/deny/cancel; camera and microphone allow/deny; video cover and playback; recording pause/resume/cancel and minimum duration; leaving chat releases recording; keyboard open/close on login and chat; English/Korean cold launches; logout/relogin; StoreKit sandbox callbacks.
