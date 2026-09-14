import XCTest
import WebKit
@testable import App

@MainActor
final class PaliroNativeBridgeTests: XCTestCase {
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
