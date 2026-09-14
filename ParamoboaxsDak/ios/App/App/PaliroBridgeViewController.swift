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
    private var launchOverlay: UIView?
    private var hasConfiguredLaunchSurface = false
    private let launchBackgroundColor = UIColor(red: 0.02, green: 0.04, blue: 0.13, alpha: 1)

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
        let scriptURL = Bundle.main.resourceURL?.appendingPathComponent("public/paliro-native.js")
        let nativeScript = scriptURL.flatMap { try? String(contentsOf: $0, encoding: .utf8) } ?? ""
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
        guard launchOverlay == nil else { return }
        let overlay = UIView()
        overlay.translatesAutoresizingMaskIntoConstraints = false
        overlay.clipsToBounds = true
        overlay.backgroundColor = launchBackgroundColor
        overlay.isUserInteractionEnabled = false
        overlay.accessibilityElementsHidden = true

        let background = UIImageView(image: UIImage(named: "PaliroLaunchSpace"))
        background.translatesAutoresizingMaskIntoConstraints = false
        background.contentMode = .scaleAspectFill
        background.clipsToBounds = true
        background.alpha = 0.22
        overlay.addSubview(background)

        let logo = UIImageView(image: UIImage(named: "PaliroLaunchLogo"))
        logo.translatesAutoresizingMaskIntoConstraints = false
        logo.contentMode = .scaleAspectFit
        logo.clipsToBounds = true
        overlay.addSubview(logo)

        view.addSubview(overlay)
        NSLayoutConstraint.activate([
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            background.topAnchor.constraint(equalTo: overlay.topAnchor),
            background.leadingAnchor.constraint(equalTo: overlay.leadingAnchor),
            background.trailingAnchor.constraint(equalTo: overlay.trailingAnchor),
            background.bottomAnchor.constraint(equalTo: overlay.bottomAnchor),
            logo.widthAnchor.constraint(equalTo: overlay.widthAnchor, multiplier: 0.186667),
            logo.heightAnchor.constraint(equalTo: logo.widthAnchor),
            logo.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
            NSLayoutConstraint(item: logo, attribute: .centerY, relatedBy: .equal, toItem: overlay, attribute: .bottom, multiplier: 0.3375, constant: 0),
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

    @objc func read(_ call: PaliroNativeCall) {
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

    @objc func write(_ call: PaliroNativeCall) {
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

    @objc func remove(_ call: PaliroNativeCall) {
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            call.reject("Unable to clear the account credential."); return
        }
        call.resolve()
    }
}
