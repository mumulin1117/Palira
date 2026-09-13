import Capacitor
import Foundation
import Security
import WebKit

private enum PaliroLaunchLocale {
    static let storageKey = "paliro.launchLanguage.v1"

    static var current: String {
        UserDefaults.standard.string(forKey: storageKey) == "en" ? "en" : "ko"
    }

    static func save(_ language: String) -> Bool {
        guard language == "en" || language == "ko" else { return false }
        UserDefaults.standard.set(language, forKey: storageKey)
        return true
    }
}

final class PaliroBridgeViewController: CAPBridgeViewController {
    private var launchOverlay: UIImageView?
    private var hasConfiguredLaunchSurface = false
    private let launchBackgroundColor = UIColor(red: 5 / 255, green: 11 / 255, blue: 33 / 255, alpha: 1)

    private var isKoreanLaunch: Bool {
        PaliroLaunchLocale.current == "ko"
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        configureLaunchSurface()
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        // capacitorDidLoad runs before CAPBridgeViewController starts its first URL load.
        // Installing the cover here prevents the WebView's unpainted frame from flashing white.
        configureLaunchSurface()
        let language = PaliroLaunchLocale.current
        let launchScript = WKUserScript(
            source: "window.__paliroLaunchLanguage = '\(language)';",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        webView?.configuration.userContentController.addUserScript(launchScript)
        bridge?.registerPluginInstance(PaliroAuthStoragePlugin())
        bridge?.registerPluginInstance(PaliroLaunchScreenPlugin())
        webView?.isOpaque = true
        webView?.backgroundColor = launchBackgroundColor
        webView?.scrollView.backgroundColor = launchBackgroundColor
        if #available(iOS 15.0, *) {
            webView?.underPageBackgroundColor = launchBackgroundColor
        }
        if #available(iOS 15.0, *) {
            bridge?.registerPluginType(PaliroIapPlugin.self)
            bridge?.registerPluginInstance(PaliroMediaPickerPlugin())
            bridge?.registerPluginInstance(PaliroVoiceRecorderPlugin())
            bridge?.registerPluginInstance(PaliroCallPermissionsPlugin())
        }
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

        // Keep a dark branded surface even if JavaScript fails before mounting.
        DispatchQueue.main.asyncAfter(deadline: .now() + 15) { [weak self] in
            self?.hideLaunchOverlay()
        }
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
final class PaliroLaunchScreenPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "PaliroLaunchScreenPlugin"
    let jsName = "PaliroLaunchScreen"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setLanguage", returnType: CAPPluginReturnPromise)
    ]

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .paliroWebContentReady, object: nil)
            call.resolve()
        }
    }

    @objc func setLanguage(_ call: CAPPluginCall) {
        guard let language = call.getString("language"), PaliroLaunchLocale.save(language) else {
            call.reject("Launch language must be en or ko.")
            return
        }
        call.resolve()
    }
}

@objc(PaliroAuthStoragePlugin)
final class PaliroAuthStoragePlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "PaliroAuthStoragePlugin"
    let jsName = "PaliroAuthStorage"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "read", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "write", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise)
    ]

    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: "\(Bundle.main.bundleIdentifier ?? "com.paliro.paramoboaxsdak").auth",
         kSecAttrAccount as String: "paliro.serverCredential.v1"]
    }

    private let installationMarkerKey = "paliro.installationMarker.v1"

    private func prepareInstallation(preserveExistingInstallation: Bool) throws {
        let defaults = UserDefaults.standard
        guard defaults.object(forKey: installationMarkerKey) == nil else { return }
        if !preserveExistingInstallation {
            let status = SecItemDelete(query as CFDictionary)
            guard status == errSecSuccess || status == errSecItemNotFound else {
                throw NSError(domain: NSOSStatusErrorDomain, code: Int(status))
            }
        }
        defaults.set(UUID().uuidString, forKey: installationMarkerKey)
    }

    @objc func read(_ call: CAPPluginCall) {
        do {
            try prepareInstallation(preserveExistingInstallation: call.getBool("preserveExistingInstallation") == true)
        } catch {
            call.reject("Unable to prepare account storage for this installation."); return
        }
        var lookup = query
        lookup[kSecReturnData as String] = true
        lookup[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(lookup as CFDictionary, &result)
        if status == errSecItemNotFound { call.resolve([:]); return }
        guard status == errSecSuccess, let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            call.reject("Unable to read the account credential."); return
        }
        call.resolve(["value": value])
    }

    @objc func write(_ call: CAPPluginCall) {
        do {
            try prepareInstallation(preserveExistingInstallation: false)
        } catch {
            call.reject("Unable to prepare account storage for this installation."); return
        }
        guard let value = call.getString("value"), let data = value.data(using: .utf8), data.count <= 4096 else {
            call.reject("Invalid account credential."); return
        }
        let attributes: [String: Any] = [kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        var status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            status = SecItemAdd(query.merging(attributes) { _, new in new } as CFDictionary, nil)
        }
        guard status == errSecSuccess else { call.reject("Unable to save the account credential."); return }
        call.resolve()
    }

    @objc func remove(_ call: CAPPluginCall) {
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            call.reject("Unable to clear the account credential."); return
        }
        call.resolve()
    }
}
