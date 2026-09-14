import XCTest
import WebKit
import AVFoundation
@testable import App

@MainActor
final class PaliroNativeBridgeTests: XCTestCase {
    func testLaunchLogoHasTransparentRoundedCorners() throws {
        let image = try XCTUnwrap(UIImage(named: "PaliroLaunchLogo"))
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = false
        let rendered = UIGraphicsImageRenderer(size: CGSize(width: 70, height: 70), format: format).image { _ in
            image.draw(in: CGRect(x: 0, y: 0, width: 70, height: 70))
        }
        let cgImage = try XCTUnwrap(rendered.cgImage)
        var pixels = [UInt8](repeating: 0, count: 70 * 70 * 4)
        try pixels.withUnsafeMutableBytes { buffer in
            let context = try XCTUnwrap(CGContext(data: buffer.baseAddress, width: 70, height: 70,
                bitsPerComponent: 8, bytesPerRow: 70 * 4, space: CGColorSpaceCreateDeviceRGB(),
                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue))
            context.draw(cgImage, in: CGRect(x: 0, y: 0, width: 70, height: 70))
        }
        for (x, y) in [(1, 1), (68, 1), (1, 68), (68, 68), (4, 4)] {
            XCTAssertEqual(pixels[(y * 70 + x) * 4 + 3], 0)
        }
        for (x, y) in [(35, 35), (35, 1), (1, 35), (20, 20)] {
            XCTAssertEqual(pixels[(y * 70 + x) * 4 + 3], 255)
        }
    }

    func testFirstInstallLanguageUsesOnlyPrimaryDeviceLanguage() throws {
        let suite = "paliro.locale-tests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        for (languages, expected) in [
            (["ko-KR"], "ko"), (["ko_KR"], "ko"), (["KO-kr"], "ko"),
            (["en-US", "ko-KR"], "en"), (["zh-Hans", "ko-KR"], "en"),
            (["ja-JP"], "en"), (["fr-FR"], "en"), ([], "en")
        ] {
            defaults.removePersistentDomain(forName: suite)
            XCTAssertEqual(PaliroLaunchLocale.resolve(defaults: defaults, preferredLanguages: languages), expected)
            XCTAssertEqual(defaults.string(forKey: PaliroLaunchLocale.storageKey), expected)
        }
    }

    func testSavedLanguageSurvivesRestartButNotACleanInstallation() throws {
        let suite = "paliro.locale-tests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        XCTAssertEqual(PaliroLaunchLocale.resolve(defaults: defaults, preferredLanguages: ["ko-KR"]), "ko")
        XCTAssertTrue(PaliroLaunchLocale.save("en", defaults: defaults))
        XCTAssertFalse(PaliroLaunchLocale.save("ja", defaults: defaults))
        let reopened = try XCTUnwrap(UserDefaults(suiteName: suite))
        XCTAssertEqual(PaliroLaunchLocale.resolve(defaults: reopened, preferredLanguages: ["ko-KR"]), "en")
        defaults.removePersistentDomain(forName: suite)
        XCTAssertEqual(PaliroLaunchLocale.resolve(defaults: defaults, preferredLanguages: ["ko-KR"]), "ko")
    }

    func testNativeAndWebLanguagesAgreeAfterLaunch() async throws {
        let webView = try await loadedWebView()
        let language = try await webView.evaluateJavaScript("document.documentElement.lang") as? String
        XCTAssertEqual(language, PaliroLaunchLocale.current)
        let saved = try await webView.evaluateJavaScript("JSON.parse(localStorage.getItem('paliro.appLanguage.v1'))") as? String
        XCTAssertEqual(saved, language)
    }

    func testEnglishFallbackAndLocalizedSystemResources() throws {
        XCTAssertEqual(Bundle.main.infoDictionary?["CFBundleDevelopmentRegion"] as? String, "en")
        for (language, name) in [("en", "Paliro"), ("ko", "팔리로")] {
            let path = try XCTUnwrap(Bundle.main.path(forResource: language, ofType: "lproj"))
            let bundle = try XCTUnwrap(Bundle(path: path))
            XCTAssertEqual(bundle.localizedString(forKey: "CFBundleDisplayName", value: nil, table: "InfoPlist"), name)
            for key in ["NSCameraUsageDescription", "NSMicrophoneUsageDescription", "NSPhotoLibraryUsageDescription"] {
                let text = bundle.localizedString(forKey: key, value: nil, table: "InfoPlist")
                XCTAssertNotEqual(text, key)
                XCTAssertTrue(text.contains(name))
            }
        }
        XCTAssertNotNil(UIImage(named: "PaliroLaunchSpace"))
        XCTAssertNotNil(UIImage(named: "PaliroLaunchLogo"))
    }

    func testAppStartsWithProgrammaticWindowAndRootController() async throws {
        let webView = try await loadedWebView()
        let delegate = try XCTUnwrap(UIApplication.shared.delegate as? AppDelegate)
        let window = try XCTUnwrap(delegate.window)
        let controller = try XCTUnwrap(window.rootViewController as? PaliroBridgeViewController)
        XCTAssertFalse(window.isHidden)
        XCTAssertTrue(window.isKeyWindow)
        XCTAssertTrue(webView.window === window)
        XCTAssertNil(controller.storyboard)
        XCTAssertNil(Bundle.main.object(forInfoDictionaryKey: "UIMainStoryboardFile"))
        XCTAssertNil(Bundle.main.url(forResource: "Main", withExtension: "storyboardc"))
        XCTAssertEqual(Bundle.main.object(forInfoDictionaryKey: "UILaunchStoryboardName") as? String, "PaliroLaunchScreen")
        controller.view.layoutIfNeeded()
        XCTAssertEqual(controller.view.bounds.size, window.bounds.size)
        XCTAssertEqual(webView.frame, controller.view.bounds)
    }

    func testInvalidMicrophoneFormatsCannotCreateRecordingSettings() {
        for input in [
            PaliroVoiceInputFormat(available: false, channels: 1, sampleRate: 44100),
            PaliroVoiceInputFormat(available: true, channels: 0, sampleRate: 44100),
            PaliroVoiceInputFormat(available: true, channels: 1, sampleRate: 0),
            PaliroVoiceInputFormat(available: true, channels: 1, sampleRate: .nan),
            PaliroVoiceInputFormat(available: true, channels: 1, sampleRate: .infinity)
        ] {
            XCTAssertFalse(input.isReady)
            XCTAssertThrowsError(try input.recordingSettings())
        }
    }

    func testRecordingUsesValidHardwareSampleRateAndMonoAAC() throws {
        let input = PaliroVoiceInputFormat(available: true, channels: 2, sampleRate: 48000)
        let settings = try input.recordingSettings()
        XCTAssertEqual(settings[AVSampleRateKey] as? Double, 48000)
        XCTAssertEqual(settings[AVNumberOfChannelsKey] as? Int, 1)
        XCTAssertEqual(settings[AVFormatIDKey] as? UInt32, kAudioFormatMPEG4AAC)
    }

    func testInstalledAppIncludesMicrophonePurpose() {
        let purpose = Bundle.main.object(forInfoDictionaryKey: "NSMicrophoneUsageDescription") as? String
        XCTAssertFalse(purpose?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true)
    }

    private func loadedWebView() async throws -> WKWebView {
        let delegate = try XCTUnwrap(UIApplication.shared.delegate as? AppDelegate)
        let controller = try XCTUnwrap(delegate.window?.rootViewController as? PaliroBridgeViewController)
        controller.loadViewIfNeeded()
        XCTAssertTrue(controller.view.isUserInteractionEnabled)
        let webView = try XCTUnwrap(controller.view.subviews.compactMap { $0 as? WKWebView }.first)
        // Do not attach an async JavaScript completion to the initial about:blank document.
        for _ in 0..<300 {
            if !webView.isLoading && webView.url?.host == "localhost" { break }
            try await Task.sleep(nanoseconds: 50_000_000)
        }
        XCTAssertFalse(webView.isLoading)
        _ = try await webView.callAsyncJavaScript("""
            await new Promise((resolve, reject) => {
              const start = Date.now();
              const ready = () => {
                if (window.PaliroNative && document.querySelector('#app')?.children.length) return resolve(true);
                if (Date.now() - start > 15000) return reject(new Error('Web app did not mount'));
                setTimeout(ready, 50);
              }; ready();
            }); return true;
            """, arguments: [:], in: nil, contentWorld: .page)
        return webView
    }

    func testNativeRoundTripAndKeychainRead() async throws {
        let webView = try await loadedWebView()
        let value = try await webView.callAsyncJavaScript("""
            const result = await window.PaliroNative.request('PaliroAuthStorage', 'read', { preserveExistingInstallation: true });
            return { platform: window.PaliroNative.platform, readCompleted: typeof result === 'object', legacyRuntimeAbsent: !window.Capacitor };
            """, arguments: [:], in: nil, contentWorld: .page) as? [String: Any]
        XCTAssertEqual(value?["platform"] as? String, "ios")
        XCTAssertEqual(value?["readCompleted"] as? Bool, true)
        XCTAssertEqual(value?["legacyRuntimeAbsent"] as? Bool, true)
    }

    func testVideoRangeAndPrivateFileIsolation() async throws {
        let webView = try await loadedWebView()
        let result = try await webView.callAsyncJavaScript("""
            const response = await fetch('/assets/paliro-feed-ko-01.mp4', { headers: { Range: 'bytes=0-31' } });
            let privateFileBlocked = false;
            try { const denied = await fetch('/_paliro_file_/etc/passwd'); privateFileBlocked = !denied.ok; }
            catch { privateFileBlocked = true; }
            return { status: response.status, bytes: (await response.arrayBuffer()).byteLength, privateFileBlocked };
            """, arguments: [:], in: nil, contentWorld: .page) as? [String: Any]
        XCTAssertEqual(result?["status"] as? Int, 206)
        XCTAssertEqual(result?["bytes"] as? Int, 32)
        XCTAssertEqual(result?["privateFileBlocked"] as? Bool, true)
    }

    func testUnlistedNativeMethodsAreRejected() async throws {
        let webView = try await loadedWebView()
        let result = try await webView.callAsyncJavaScript("""
            try { await window.PaliroNative.request('PaliroVoiceRecorder', 'description'); return false; }
            catch (error) { return error.code === 'UNAVAILABLE'; }
            """, arguments: [:], in: nil, contentWorld: .page) as? Bool
        XCTAssertEqual(result, true)
    }

    func testBundledVideoCanPlayAndPause() async throws {
        let webView = try await loadedWebView()
        let result = try await webView.callAsyncJavaScript("""
            window.__paliroPlaybackTest = (async () => {
            const video = document.createElement('video');
            video.muted = true; video.playsInline = true; video.preload = 'auto';
            video.style.cssText = 'position:fixed;top:70px;left:10px;width:160px;height:160px;z-index:9999';
            document.body.appendChild(video);
            try {
              video.src = '/assets/paliro-feed-ko-01.mp4'; video.load();
              await Promise.race([video.play(), new Promise((_, reject) => setTimeout(() => reject(new Error('Playback timed out')), 10000))]);
              const playing = !video.paused;
              video.pause();
              return playing && video.paused && video.videoWidth > 0;
            } finally { video.removeAttribute('src'); video.load(); video.remove(); }
            })();
            return await window.__paliroPlaybackTest;
            """, arguments: [:], in: nil, contentWorld: .page) as? Bool
        XCTAssertEqual(result, true)
    }

    func testKeyboardResizesAndRestoresWebView() async throws {
        let webView = try await loadedWebView()
        let host = try XCTUnwrap(webView.superview)
        host.layoutIfNeeded()
        let original = webView.frame.height
        let screen = host.convert(host.bounds, to: nil)
        let keyboard = CGRect(x: screen.minX, y: screen.maxY - 220, width: screen.width, height: 220)
        NotificationCenter.default.post(name: UIResponder.keyboardWillChangeFrameNotification, object: nil,
            userInfo: [UIResponder.keyboardFrameEndUserInfoKey: keyboard, UIResponder.keyboardAnimationDurationUserInfoKey: 0])
        host.layoutIfNeeded()
        XCTAssertEqual(webView.frame.height, original - 220, accuracy: 1)
        NotificationCenter.default.post(name: UIResponder.keyboardWillHideNotification, object: nil,
            userInfo: [UIResponder.keyboardFrameEndUserInfoKey: keyboard, UIResponder.keyboardAnimationDurationUserInfoKey: 0])
        host.layoutIfNeeded()
        XCTAssertEqual(webView.frame.height, original, accuracy: 1)
    }
}
