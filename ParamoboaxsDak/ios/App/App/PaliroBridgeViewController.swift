import Capacitor
import Foundation
import Security

final class PaliroBridgeViewController: CAPBridgeViewController {
    private var launchOverlay: UIImageView?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 5 / 255, green: 11 / 255, blue: 33 / 255, alpha: 1)
        showLaunchOverlay()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(hideLaunchOverlay),
            name: .paliroWebContentReady,
            object: nil
        )

        // Never leave the native cover stuck if JavaScript fails before mounting.
        DispatchQueue.main.asyncAfter(deadline: .now() + 15) { [weak self] in
            self?.hideLaunchOverlay()
        }
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(PaliroAuthStoragePlugin())
        bridge?.registerPluginInstance(PaliroLaunchScreenPlugin())
        webView?.isOpaque = false
        webView?.backgroundColor = .clear
        webView?.scrollView.backgroundColor = .clear
        if #available(iOS 15.0, *) {
            bridge?.registerPluginType(PaliroIapPlugin.self)
            bridge?.registerPluginType(PaliroMediaPickerPlugin.self)
            bridge?.registerPluginType(PaliroVoiceRecorderPlugin.self)
            bridge?.registerPluginType(PaliroCallPermissionsPlugin.self)
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    private func showLaunchOverlay() {
        guard launchOverlay == nil, let image = UIImage(named: "appaliguaungld") else { return }
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
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise)
    ]

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .paliroWebContentReady, object: nil)
            call.resolve()
        }
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
