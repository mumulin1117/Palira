import Capacitor
import Foundation
import Security

final class PaliroBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(PaliroAuthStoragePlugin())
        if #available(iOS 15.0, *) {
            bridge?.registerPluginType(PaliroIapPlugin.self)
            bridge?.registerPluginType(PaliroMediaPickerPlugin.self)
            bridge?.registerPluginType(PaliroVoiceRecorderPlugin.self)
            bridge?.registerPluginType(PaliroCallPermissionsPlugin.self)
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
