import Foundation
import Security
import WebKit
import UIKit

enum PaliroLaunchLocale {
    static let storageKey = "paliro.launchLanguage.v1"

    static var current: String {
        resolve()
    }

    static func resolve(defaults: UserDefaults = .standard, preferredLanguages: [String] = Locale.preferredLanguages) -> String {
        if let saved = defaults.string(forKey: storageKey), ["en", "ko"].contains(saved) { return saved }
        let primary = (preferredLanguages.first ?? "").lowercased().split(whereSeparator: { $0 == "-" || $0 == "_" }).first
        let language = primary == "ko" ? "ko" : "en"
        defaults.set(language, forKey: storageKey)
        return language
    }

    static func save(_ language: String, defaults: UserDefaults = .standard) -> Bool {
        guard language == "en" || language == "ko" else { return false }
        defaults.set(language, forKey: storageKey)
        return true
    }
}

final class PaliroBridgeViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!
    private let bridge = PaliroNativeBridge()
    private var keyboardBottom: NSLayoutConstraint!
    private var launchOverlay: UIImageView?
    private var hasConfiguredLaunchSurface = false
    private let launchBackgroundColor = UIColor(red: 0.02, green: 0.04, blue: 0.13, alpha: 1)

    private var isKoreanLaunch: Bool {
        PaliroLaunchLocale.current == "ko"
    }

    override func loadView() {
        view = UIView()
        view.backgroundColor = launchBackgroundColor
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.setURLSchemeHandler(PaliroLocalResources(), forURLScheme: "capacitor")
        configuration.userContentController.add(bridge, name: "paliro")
        let language = PaliroLaunchLocale.current
        let nativeScriptData = try? PaliroLocalResources.bundledData(for: "paliro-native.js")
        let nativeScript = nativeScriptData.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        let launchScript = WKUserScript(
            source: "window.__paliroLaunchLanguage = '\(language)';\n" + nativeScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        configuration.userContentController.addUserScript(launchScript)
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.isOpaque = true
        webView.backgroundColor = launchBackgroundColor
        webView.scrollView.backgroundColor = launchBackgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.scrollView.keyboardDismissMode = .interactive
        webView.underPageBackgroundColor = launchBackgroundColor
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true }
        #endif
        view.addSubview(webView)
        keyboardBottom = webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor), keyboardBottom,
        ])
        bridge.webView = webView
        bridge.viewController = self
        bridge.register(PaliroAuthStoragePlugin())
        bridge.register(PaliroLaunchScreenPlugin())
        bridge.register(PaliroIapPlugin())
        bridge.register(PaliroMediaPickerPlugin())
        bridge.register(PaliroVoiceRecorderPlugin())
        bridge.register(PaliroCallPermissionsPlugin())
        NotificationCenter.default.addObserver(self, selector: #selector(updateKeyboard(_:)), name: UIResponder.keyboardWillChangeFrameNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(updateKeyboard(_:)), name: UIResponder.keyboardWillHideNotification, object: nil)
        configureLaunchSurface()
        webView.load(URLRequest(url: URL(string: "capacitor://localhost/index.html")!))
    }

    @objc private func updateKeyboard(_ notification: Notification) {
        guard let frame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }
        let local = view.convert(frame, from: nil)
        let overlap = notification.name == UIResponder.keyboardWillHideNotification || local.maxY < view.bounds.maxY ? 0 : max(0, view.bounds.maxY - local.minY)
        keyboardBottom.constant = -overlap
        webView.scrollView.contentInset = .zero
        webView.scrollView.scrollIndicatorInsets = .zero
        let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double ?? 0.25
        UIView.animate(withDuration: duration) { self.view.layoutIfNeeded() }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.scheme == "capacitor", url.host == "localhost", ["/", "/index.html"].contains(url.path) {
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
            if navigationAction.navigationType == .linkActivated, ["https", "mailto", "tel"].contains(url.scheme ?? "") {
                UIApplication.shared.open(url)
            }
        }
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        bridge.resetPage()
        showLaunchOverlay()
        webView.reload()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    private func showLaunchOverlay() {
        let assetName = isKoreanLaunch ? "PaliroLaunchKorean" : "appaliguaungld"
        guard launchOverlay == nil, let image = UIImage(named: assetName) else { return }
        let overlay = UIImageView(image: image)
        overlay.translatesAutoresizingMaskIntoConstraints = false
        overlay.contentMode = .scaleAspectFill
        overlay.clipsToBounds = true
        overlay.isUserInteractionEnabled = false
        overlay.accessibilityElementsHidden = true
        view.addSubview(overlay)
        NSLayoutConstraint.activate([
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        launchOverlay = overlay
    }

    private func configureLaunchSurface() {
        view.backgroundColor = launchBackgroundColor
        guard !hasConfiguredLaunchSurface else { return }
        hasConfiguredLaunchSurface = true
        showLaunchOverlay()
        guard launchOverlay != nil else { return }
        NotificationCenter.default.removeObserver(self, name: .paliroWebContentReady, object: nil)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(hideLaunchOverlay),
            name: .paliroWebContentReady,
            object: nil
        )

    }

    @objc private func hideLaunchOverlay() {
        guard let overlay = launchOverlay else { return }
        launchOverlay = nil
        UIView.animate(withDuration: 0.28, delay: 0, options: [.curveEaseOut, .beginFromCurrentState]) {
            overlay.alpha = 0
        } completion: { _ in
            overlay.removeFromSuperview()
        }
    }
}

private extension Notification.Name {
    static let paliroWebContentReady = Notification.Name("paliro.webContentReady")
}

@objc(PaliroLaunchScreenPlugin)
final class PaliroLaunchScreenPlugin: PaliroNativeService, PaliroNativeMethods {
    let identifier = "PaliroLaunchScreenPlugin"
    let jsName = "PaliroLaunchScreen"
    let methods = ["hide", "setLanguage"]

    @objc func hide(_ call: PaliroNativeCall) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .paliroWebContentReady, object: nil)
            call.resolve()
        }
    }

    @objc func setLanguage(_ call: PaliroNativeCall) {
        guard let language = call.getString("language"), PaliroLaunchLocale.save(language) else {
            call.reject("Launch language must be en or ko.")
            return
        }
        call.resolve()
    }
}

@objc(PaliroAuthStoragePlugin)
final class PaliroAuthStoragePlugin: PaliroNativeService, PaliroNativeMethods {
    let identifier = "PaliroAuthStoragePlugin"
    let jsName = "PaliroAuthStorage"
    let methods = ["read", "write", "remove"]

    private enum StorageMode: String {
        case keychain
        case protectedFile
    }

    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: "\(Bundle.main.bundleIdentifier ?? "com.paliro.paramoboaxsdak").auth",
         kSecAttrAccount as String: "paliro.serverCredential.v1"]
    }

    private let installationMarkerKey = "paliro.installationMarker.v1"
    private let storageModeKey = "paliro.authStorageMode.v1"

    private var storageMode: StorageMode {
        get { StorageMode(rawValue: UserDefaults.standard.string(forKey: storageModeKey) ?? "") ?? .keychain }
        set { UserDefaults.standard.set(newValue.rawValue, forKey: storageModeKey) }
    }

    private func credentialFile(createDirectory: Bool) throws -> URL {
        let manager = FileManager.default
        let support = try manager.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: createDirectory)
        let directory = support.appendingPathComponent("PaliroSecureSession", isDirectory: true)
        if createDirectory {
            try manager.createDirectory(at: directory, withIntermediateDirectories: true)
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            var mutableDirectory = directory
            try? mutableDirectory.setResourceValues(values)
        }
        return directory.appendingPathComponent("credential.v1")
    }

    private func removeProtectedFile() throws {
        let file = try credentialFile(createDirectory: true)
        if FileManager.default.fileExists(atPath: file.path) { try FileManager.default.removeItem(at: file) }
    }

    private func writeProtectedFile(_ data: Data) throws {
        let file = try credentialFile(createDirectory: true)
        try data.write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    private func readProtectedFile() throws -> Data? {
        let file = try credentialFile(createDirectory: true)
        guard FileManager.default.fileExists(atPath: file.path) else { return nil }
        return try Data(contentsOf: file)
    }

    private func logKeychainFailure(_ operation: String, status: OSStatus) {
        let detail = SecCopyErrorMessageString(status, nil) as String? ?? "Unknown Security error"
        NSLog("Paliro auth storage: Keychain %@ failed (%d): %@. Using protected app storage.", operation, status, detail)
    }

    private func resolveCredential(_ data: Data?, call: PaliroNativeCall) {
        guard let data else { call.resolve([:]); return }
        guard let value = String(data: data, encoding: .utf8) else {
            call.reject("Invalid account credential.", "INVALID_SECURE_CREDENTIAL"); return
        }
        call.resolve(["value": value])
    }

    private func writeKeychain(_ data: Data) -> OSStatus {
        let attributes: [String: Any] = [kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        var status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            status = SecItemAdd(query.merging(attributes) { _, new in new } as CFDictionary, nil)
        }
        return status
    }

    private func prepareInstallation(preserveExistingInstallation: Bool) {
        let defaults = UserDefaults.standard
        guard defaults.object(forKey: installationMarkerKey) == nil else { return }
        if preserveExistingInstallation {
            storageMode = .keychain
        } else {
            try? removeProtectedFile()
            let status = SecItemDelete(query as CFDictionary)
            if status == errSecSuccess || status == errSecItemNotFound {
                storageMode = .keychain
            } else {
                logKeychainFailure("clean install", status: status)
                storageMode = .protectedFile
            }
        }
        defaults.set(UUID().uuidString, forKey: installationMarkerKey)
    }

    @objc func read(_ call: PaliroNativeCall) {
        prepareInstallation(preserveExistingInstallation: call.getBool("preserveExistingInstallation") == true)
        if storageMode == .protectedFile {
            do { resolveCredential(try readProtectedFile(), call: call) }
            catch { call.reject("Unable to read the protected account credential.", "PROTECTED_FILE_READ_FAILED") }
            return
        }
        var lookup = query
        lookup[kSecReturnData as String] = true
        lookup[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(lookup as CFDictionary, &result)
        if status == errSecSuccess {
            resolveCredential(result as? Data, call: call)
            return
        }
        if status == errSecItemNotFound { call.resolve([:]); return }
        logKeychainFailure("read", status: status)
        storageMode = .protectedFile
        do { resolveCredential(try readProtectedFile(), call: call) }
        catch { call.reject("Unable to read the protected account credential.", "PROTECTED_FILE_READ_FAILED") }
    }

    @objc func write(_ call: PaliroNativeCall) {
        prepareInstallation(preserveExistingInstallation: false)
        guard let value = call.getString("value"), let data = value.data(using: .utf8), data.count <= 4096 else {
            call.reject("Invalid account credential.", "INVALID_SECURE_CREDENTIAL"); return
        }
        if storageMode == .keychain {
            let status = writeKeychain(data)
            if status == errSecSuccess {
                try? removeProtectedFile()
                call.resolve()
                return
            }
            logKeychainFailure("write", status: status)
            storageMode = .protectedFile
        }
        do {
            try writeProtectedFile(data)
            call.resolve()
        } catch {
            call.reject("Unable to save the protected account credential.", "PROTECTED_FILE_WRITE_FAILED")
        }
    }

    @objc func remove(_ call: PaliroNativeCall) {
        let status = SecItemDelete(query as CFDictionary)
        if status != errSecSuccess && status != errSecItemNotFound {
            logKeychainFailure("remove", status: status)
            storageMode = .protectedFile
        }
        do {
            try removeProtectedFile()
            call.resolve()
        } catch {
            call.reject("Unable to clear the protected account credential.", "PROTECTED_FILE_REMOVE_FAILED")
        }
    }
}
