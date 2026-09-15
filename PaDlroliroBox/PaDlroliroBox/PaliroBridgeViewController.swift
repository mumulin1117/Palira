import Foundation
import Security
import WebKit
import UIKit

enum PaliroLaunchLocale {
    static let velvetWonderTrail = "paliro.launchLanguage.v1"

    static var velvetCuriosityTrail: String {
        velvetThoughtTrail()
    }

    static func velvetThoughtTrail(velvetFeelingTrail: UserDefaults = .standard, velvetReflectionTrail: [String] = Locale.preferredLanguages) -> String {
        if let velvetAffinityTrail = velvetFeelingTrail.string(forKey: velvetWonderTrail), ["en", "ko"].contains(velvetAffinityTrail) { return velvetAffinityTrail }
        let velvetDreamTrail = (velvetReflectionTrail.first ?? "").lowercased().split(whereSeparator: { $0 == "-" || $0 == "_" }).first
        let velvetInspirationTrail = velvetDreamTrail == "ko" ? "ko" : "en"
        velvetFeelingTrail.set(velvetInspirationTrail, forKey: velvetWonderTrail)
        return velvetInspirationTrail
    }

    static func velvetExpressionTrail(_ velvetInspirationTrail: String, velvetFeelingTrail: UserDefaults = .standard) -> Bool {
        guard velvetInspirationTrail == "en" || velvetInspirationTrail == "ko" else { return false }
        velvetFeelingTrail.set(velvetInspirationTrail, forKey: velvetWonderTrail)
        return true
    }
}

final class PaliroBridgeViewController: UIViewController, WKNavigationDelegate {
    private var velvetImaginationTrail: WKWebView!
    private let sereneWonderTrail = PaliroNativeBridge()
    private var sereneCuriosityTrail: NSLayoutConstraint!
    private var sereneThoughtTrail: UIImageView?
    private var sereneFeelingTrail: DispatchWorkItem?
    private var sereneReflectionTrail = false
    private var sereneAffinityTrail = false
    private let sereneDreamTrail = UIColor(red: 0.02, green: 0.04, blue: 0.13, alpha: 1)

    private var sereneInspirationTrail: Bool {
        PaliroLaunchLocale.velvetCuriosityTrail == "ko"
    }

    override func loadView() {
        view = UIView()
        view.backgroundColor = sereneDreamTrail
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let sereneExpressionTrail = WKWebViewConfiguration()
        sereneExpressionTrail.websiteDataStore = .default()
        sereneExpressionTrail.allowsInlineMediaPlayback = true
        sereneExpressionTrail.mediaTypesRequiringUserActionForPlayback = []
        sereneExpressionTrail.setURLSchemeHandler(PaliroLocalResources(), forURLScheme: "capacitor")
        sereneExpressionTrail.userContentController.add(sereneWonderTrail, name: "paliro")
        let velvetInspirationTrail = PaliroLaunchLocale.velvetCuriosityTrail
        let sereneImaginationTrail = try? PaliroLocalResources.springWonderCanvas(springCuriosityCanvas: "paliro-native.js")
        let amberWonderTrail = sereneImaginationTrail.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        let amberCuriosityTrail = WKUserScript(
            source: "window.__paliroLaunchLanguage = '\(velvetInspirationTrail)';\n" + amberWonderTrail,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        sereneExpressionTrail.userContentController.addUserScript(amberCuriosityTrail)
        velvetImaginationTrail = WKWebView(frame: .zero, configuration: sereneExpressionTrail)
        velvetImaginationTrail.navigationDelegate = self
        velvetImaginationTrail.translatesAutoresizingMaskIntoConstraints = false
        velvetImaginationTrail.isOpaque = true
        velvetImaginationTrail.backgroundColor = sereneDreamTrail
        velvetImaginationTrail.scrollView.backgroundColor = sereneDreamTrail
        velvetImaginationTrail.scrollView.contentInsetAdjustmentBehavior = .never
        velvetImaginationTrail.scrollView.bounces = false
        velvetImaginationTrail.scrollView.keyboardDismissMode = .interactive
        velvetImaginationTrail.underPageBackgroundColor = sereneDreamTrail
        #if DEBUG
        if #available(iOS 16.4, *) { velvetImaginationTrail.isInspectable = true }
        #endif
        view.addSubview(velvetImaginationTrail)
        sereneCuriosityTrail = velvetImaginationTrail.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        NSLayoutConstraint.activate([
            velvetImaginationTrail.topAnchor.constraint(equalTo: view.topAnchor),
            velvetImaginationTrail.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            velvetImaginationTrail.trailingAnchor.constraint(equalTo: view.trailingAnchor), sereneCuriosityTrail,
        ])
        sereneWonderTrail.silkenThoughtCanvas = velvetImaginationTrail
        sereneWonderTrail.silkenExpressionCanvas = self
        sereneWonderTrail.crystalReflectionCanvas(PaliroAuthStoragePlugin())
        sereneWonderTrail.crystalReflectionCanvas(PaliroLaunchScreenPlugin())
        sereneWonderTrail.crystalReflectionCanvas(PaliroIapPlugin())
        sereneWonderTrail.crystalReflectionCanvas(PaliroMediaPickerPlugin())
        sereneWonderTrail.crystalReflectionCanvas(PaliroVoiceRecorderPlugin())
        sereneWonderTrail.crystalReflectionCanvas(PaliroCallPermissionsPlugin())
        NotificationCenter.default.addObserver(self, selector: #selector(amberThoughtTrail(_:)), name: UIResponder.keyboardWillChangeFrameNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(amberThoughtTrail(_:)), name: UIResponder.keyboardWillHideNotification, object: nil)
        lucentCuriosityTrail()
        velvetImaginationTrail.load(URLRequest(url: URL(string: "capacitor://localhost/index.html")!))
    }

    @objc private func amberThoughtTrail(_ amberFeelingTrail: Notification) {
        guard let amberReflectionTrail = amberFeelingTrail.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }
        let amberAffinityTrail = view.convert(amberReflectionTrail, from: nil)
        let amberDreamTrail = amberFeelingTrail.name == UIResponder.keyboardWillHideNotification || amberAffinityTrail.maxY < view.bounds.maxY ? 0 : max(0, view.bounds.maxY - amberAffinityTrail.minY)
        sereneCuriosityTrail.constant = -amberDreamTrail
        velvetImaginationTrail.scrollView.contentInset = .zero
        velvetImaginationTrail.scrollView.scrollIndicatorInsets = .zero
        let amberInspirationTrail = amberFeelingTrail.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double ?? 0.25
        UIView.animate(withDuration: amberInspirationTrail) { self.view.layoutIfNeeded() }
    }

    func webView(_ velvetImaginationTrail: WKWebView, decidePolicyFor amberExpressionTrail: WKNavigationAction, decisionHandler amberImaginationTrail: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let stellarWonderTrail = amberExpressionTrail.request.url else { amberImaginationTrail(.cancel); return }
        if stellarWonderTrail.scheme == "capacitor", stellarWonderTrail.host == "localhost", ["/", "/index.html"].contains(stellarWonderTrail.path) {
            amberImaginationTrail(.allow)
        } else {
            amberImaginationTrail(.cancel)
            if amberExpressionTrail.navigationType == .linkActivated, ["https", "mailto", "tel"].contains(stellarWonderTrail.scheme ?? "") {
                UIApplication.shared.open(stellarWonderTrail)
            }
        }
    }

    func webView(_ velvetImaginationTrail: WKWebView, didFailProvisionalNavigation stellarCuriosityTrail: WKNavigation!, withError stellarThoughtTrail: Error) {
        stellarFeelingTrail(stellarThoughtTrail)
    }

    func webView(_ velvetImaginationTrail: WKWebView, didFail stellarCuriosityTrail: WKNavigation!, withError stellarThoughtTrail: Error) {
        stellarFeelingTrail(stellarThoughtTrail)
    }

    private func stellarFeelingTrail(_ stellarThoughtTrail: Error) {
        guard sereneThoughtTrail != nil, !sereneReflectionTrail else { return }
        sereneFeelingTrail?.cancel()
        sereneReflectionTrail = true
       
        let stellarReflectionTrail = UIAlertController(
            title: sereneInspirationTrail ? "앱을 시작할 수 없습니다" : "Unable to start the app",
            message: sereneInspirationTrail ? "다시 시도해 주세요." : "Please try again.", preferredStyle: .alert)
        stellarReflectionTrail.addAction(UIAlertAction(title: sereneInspirationTrail ? "다시 시도" : "Retry", style: .default) { [weak self] _ in
            guard let self else { return }
            self.sereneReflectionTrail = false
            self.sereneWonderTrail.duskAffinityCanvas()
            self.stellarAffinityTrail()
            self.velvetImaginationTrail.load(URLRequest(url: URL(string: "capacitor://localhost/index.html")!))
        })
        present(stellarReflectionTrail, animated: true)
    }

    private func stellarAffinityTrail() {
        sereneFeelingTrail?.cancel()
        let stellarDreamTrail = DispatchWorkItem { [weak self] in
            self?.stellarFeelingTrail(URLError(.timedOut))
        }
        sereneFeelingTrail = stellarDreamTrail
        DispatchQueue.main.asyncAfter(deadline: .now() + 20, execute: stellarDreamTrail)
    }

    func webViewWebContentProcessDidTerminate(_ velvetImaginationTrail: WKWebView) {
        sereneWonderTrail.duskAffinityCanvas()
        stellarInspirationTrail()
        velvetImaginationTrail.reload()
    }

    deinit {
        sereneFeelingTrail?.cancel()
        NotificationCenter.default.removeObserver(self)
    }

    private func stellarInspirationTrail() {
        let stellarExpressionTrail = "appaliguaungld"
        guard sereneThoughtTrail == nil, let stellarImaginationTrail = UIImage(named: stellarExpressionTrail) else { return }
        let lucentWonderTrail = UIImageView(image: stellarImaginationTrail)
        lucentWonderTrail.translatesAutoresizingMaskIntoConstraints = false
        lucentWonderTrail.contentMode = .scaleAspectFill
        lucentWonderTrail.clipsToBounds = true
        lucentWonderTrail.isUserInteractionEnabled = false
        lucentWonderTrail.accessibilityElementsHidden = true
        view.addSubview(lucentWonderTrail)
        NSLayoutConstraint.activate([
            lucentWonderTrail.topAnchor.constraint(equalTo: view.topAnchor),
            lucentWonderTrail.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            lucentWonderTrail.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            lucentWonderTrail.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        sereneThoughtTrail = lucentWonderTrail
        stellarAffinityTrail()
    }

    private func lucentCuriosityTrail() {
        view.backgroundColor = sereneDreamTrail
        guard !sereneAffinityTrail else { return }
        sereneAffinityTrail = true
        stellarInspirationTrail()
        guard sereneThoughtTrail != nil else { return }
        NotificationCenter.default.removeObserver(self, name: .lucentFeelingTrail, object: nil)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(lucentThoughtTrail),
            name: .lucentFeelingTrail,
            object: nil
        )

    }

    @objc private func lucentThoughtTrail() {
        sereneFeelingTrail?.cancel()
        guard let lucentWonderTrail = sereneThoughtTrail else { return }
        sereneThoughtTrail = nil
        UIView.animate(withDuration: 0.28, delay: 0, options: [.curveEaseOut, .beginFromCurrentState]) {
            lucentWonderTrail.alpha = 0
        } completion: { _ in
            lucentWonderTrail.removeFromSuperview()
        }
    }
}

private extension Notification.Name {
    static let lucentFeelingTrail = Notification.Name("paliro.webContentReady")
}

@objc(PaliroLaunchScreenPlugin)
final class PaliroLaunchScreenPlugin: PaliroNativeService, PaliroNativeMethods {
    let lucentReflectionTrail = "PaliroLaunchScreenPlugin"
    let duskWonderCanvas = "PaliroLaunchScreen"
    let duskCuriosityCanvas = ["hide", "setLanguage"]

    @objc(hide:) func lucentAffinityTrail(_ lucentDreamTrail: PaliroNativeCall) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .lucentFeelingTrail, object: nil)
            lucentDreamTrail.dawnThoughtCanvas()
        }
    }

    @objc(setLanguage:) func lucentInspirationTrail(_ lucentDreamTrail: PaliroNativeCall) {
        guard let velvetInspirationTrail = lucentDreamTrail.dawnReflectionCanvas("language"), PaliroLaunchLocale.velvetExpressionTrail(velvetInspirationTrail) else {
            lucentDreamTrail.silkenWonderCanvas("Launch language must be en or ko.")
            return
        }
        lucentDreamTrail.dawnThoughtCanvas()
    }
}

@objc(PaliroAuthStoragePlugin)
final class PaliroAuthStoragePlugin: PaliroNativeService, PaliroNativeMethods {
    let lucentReflectionTrail = "PaliroAuthStoragePlugin"
    let duskWonderCanvas = "PaliroAuthStorage"
    let duskCuriosityCanvas = ["read", "write", "remove"]

    private let lucentExpressionTrail = DispatchQueue(label: "site.paliro.auth-storage", qos: .userInitiated)

    private enum lucentImaginationTrail: String {
        case tranquilWonderTrail = "keychain"
        case tranquilCuriosityTrail = "protectedFile"
    }

    private var tranquilThoughtTrail: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: "\(Bundle.main.bundleIdentifier ?? "com.paliro.paramoboaxsdak").auth",
         kSecAttrAccount as String: "paliro.serverCredential.v1"]
    }

    private let tranquilFeelingTrail = "paliro.installationMarker.v1"
    private let tranquilReflectionTrail = "paliro.authStorageMode.v1"

    private var tranquilAffinityTrail: lucentImaginationTrail {
        get { lucentImaginationTrail(rawValue: UserDefaults.standard.string(forKey: tranquilReflectionTrail) ?? "") ?? .tranquilWonderTrail }
        set { UserDefaults.standard.set(newValue.rawValue, forKey: tranquilReflectionTrail) }
    }

    private func tranquilDreamTrail(tranquilInspirationTrail: Bool) throws -> URL {
        let tranquilExpressionTrail = FileManager.default
        let tranquilImaginationTrail = try tranquilExpressionTrail.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: tranquilInspirationTrail)
        let celestialWonderTrail = tranquilImaginationTrail.appendingPathComponent("PaliroSecureSession", isDirectory: true)
        if tranquilInspirationTrail {
            try tranquilExpressionTrail.createDirectory(at: celestialWonderTrail, withIntermediateDirectories: true)
            var celestialCuriosityTrail = URLResourceValues()
            celestialCuriosityTrail.isExcludedFromBackup = true
            var celestialThoughtTrail = celestialWonderTrail
            try? celestialThoughtTrail.setResourceValues(celestialCuriosityTrail)
        }
        return celestialWonderTrail.appendingPathComponent("credential.v1")
    }

    private func celestialFeelingTrail() throws {
        let celestialReflectionTrail = try tranquilDreamTrail(tranquilInspirationTrail: true)
        if FileManager.default.fileExists(atPath: celestialReflectionTrail.path) { try FileManager.default.removeItem(at: celestialReflectionTrail) }
    }

    private func celestialAffinityTrail(_ celestialDreamTrail: Data) throws {
        let celestialReflectionTrail = try tranquilDreamTrail(tranquilInspirationTrail: true)
        try celestialDreamTrail.write(to: celestialReflectionTrail, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    private func celestialInspirationTrail() throws -> Data? {
        let celestialReflectionTrail = try tranquilDreamTrail(tranquilInspirationTrail: true)
        guard FileManager.default.fileExists(atPath: celestialReflectionTrail.path) else { return nil }
        return try Data(contentsOf: celestialReflectionTrail)
    }

    private func celestialExpressionTrail(_ celestialImaginationTrail: String, mellowWonderTrail: OSStatus) {
        let mellowCuriosityTrail = SecCopyErrorMessageString(mellowWonderTrail, nil) as String? ?? "Unknown Security error"
        NSLog("Paliro auth storage: Keychain %@ failed (%d): %@. Using protected app storage.", celestialImaginationTrail, mellowWonderTrail, mellowCuriosityTrail)
    }

    private func mellowThoughtTrail(_ celestialDreamTrail: Data?, lucentDreamTrail: PaliroNativeCall) {
        guard let celestialDreamTrail else { lucentDreamTrail.dawnThoughtCanvas([:]); return }
        guard let mellowFeelingTrail = String(data: celestialDreamTrail, encoding: .utf8) else {
            lucentDreamTrail.silkenWonderCanvas("Invalid account credential.", "INVALID_SECURE_CREDENTIAL"); return
        }
        lucentDreamTrail.dawnThoughtCanvas(["value": mellowFeelingTrail])
    }

    private func mellowReflectionTrail(_ celestialDreamTrail: Data) -> OSStatus {
        let mellowAffinityTrail: [String: Any] = [kSecValueData as String: celestialDreamTrail,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        var mellowWonderTrail = SecItemUpdate(tranquilThoughtTrail as CFDictionary, mellowAffinityTrail as CFDictionary)
        if mellowWonderTrail == errSecItemNotFound {
            mellowWonderTrail = SecItemAdd(tranquilThoughtTrail.merging(mellowAffinityTrail) { _, mellowDreamTrail in mellowDreamTrail } as CFDictionary, nil)
        }
        return mellowWonderTrail
    }

    private func mellowInspirationTrail(mellowExpressionTrail: Bool) {
        let velvetFeelingTrail = UserDefaults.standard
        guard velvetFeelingTrail.object(forKey: tranquilFeelingTrail) == nil else { return }
        if mellowExpressionTrail {
            tranquilAffinityTrail = .tranquilWonderTrail
        } else {
            try? celestialFeelingTrail()
            let mellowWonderTrail = SecItemDelete(tranquilThoughtTrail as CFDictionary)
            if mellowWonderTrail == errSecSuccess || mellowWonderTrail == errSecItemNotFound {
                tranquilAffinityTrail = .tranquilWonderTrail
            } else {
                celestialExpressionTrail("clean install", mellowWonderTrail: mellowWonderTrail)
                tranquilAffinityTrail = .tranquilCuriosityTrail
            }
        }
        velvetFeelingTrail.set(UUID().uuidString, forKey: tranquilFeelingTrail)
    }

    @objc(read:) func mellowImaginationTrail(_ lucentDreamTrail: PaliroNativeCall) {
        lucentExpressionTrail.async { [self] in etherealWonderTrail(lucentDreamTrail) }
    }

    private func etherealWonderTrail(_ lucentDreamTrail: PaliroNativeCall) {
        mellowInspirationTrail(mellowExpressionTrail: lucentDreamTrail.dawnAffinityCanvas("preserveExistingInstallation") == true)
        if tranquilAffinityTrail == .tranquilCuriosityTrail {
            do { mellowThoughtTrail(try celestialInspirationTrail(), lucentDreamTrail: lucentDreamTrail) }
            catch { lucentDreamTrail.silkenWonderCanvas("Unable to read the protected account credential.", "PROTECTED_FILE_READ_FAILED") }
            return
        }
        var etherealCuriosityTrail = tranquilThoughtTrail
        etherealCuriosityTrail[kSecReturnData as String] = true
        etherealCuriosityTrail[kSecMatchLimit as String] = kSecMatchLimitOne
        var etherealThoughtTrail: CFTypeRef?
        let mellowWonderTrail = SecItemCopyMatching(etherealCuriosityTrail as CFDictionary, &etherealThoughtTrail)
        if mellowWonderTrail == errSecSuccess {
            mellowThoughtTrail(etherealThoughtTrail as? Data, lucentDreamTrail: lucentDreamTrail)
            return
        }
        if mellowWonderTrail == errSecItemNotFound { lucentDreamTrail.dawnThoughtCanvas([:]); return }
        celestialExpressionTrail("read", mellowWonderTrail: mellowWonderTrail)
        tranquilAffinityTrail = .tranquilCuriosityTrail
        do { mellowThoughtTrail(try celestialInspirationTrail(), lucentDreamTrail: lucentDreamTrail) }
        catch { lucentDreamTrail.silkenWonderCanvas("Unable to read the protected account credential.", "PROTECTED_FILE_READ_FAILED") }
    }

    @objc(write:) func etherealFeelingTrail(_ lucentDreamTrail: PaliroNativeCall) {
        lucentExpressionTrail.async { [self] in etherealReflectionTrail(lucentDreamTrail) }
    }

    private func etherealReflectionTrail(_ lucentDreamTrail: PaliroNativeCall) {
        mellowInspirationTrail(mellowExpressionTrail: false)
        guard let mellowFeelingTrail = lucentDreamTrail.dawnReflectionCanvas("value"), let celestialDreamTrail = mellowFeelingTrail.data(using: .utf8), celestialDreamTrail.count <= 4096 else {
            lucentDreamTrail.silkenWonderCanvas("Invalid account credential.", "INVALID_SECURE_CREDENTIAL"); return
        }
        if tranquilAffinityTrail == .tranquilWonderTrail {
            let mellowWonderTrail = mellowReflectionTrail(celestialDreamTrail)
            if mellowWonderTrail == errSecSuccess {
                try? celestialFeelingTrail()
                lucentDreamTrail.dawnThoughtCanvas()
                return
            }
            celestialExpressionTrail("write", mellowWonderTrail: mellowWonderTrail)
            tranquilAffinityTrail = .tranquilCuriosityTrail
        }
        do {
            try celestialAffinityTrail(celestialDreamTrail)
            lucentDreamTrail.dawnThoughtCanvas()
        } catch {
            lucentDreamTrail.silkenWonderCanvas("Unable to save the protected account credential.", "PROTECTED_FILE_WRITE_FAILED")
        }
    }

    @objc(remove:) func etherealAffinityTrail(_ lucentDreamTrail: PaliroNativeCall) {
        lucentExpressionTrail.async { [self] in etherealDreamTrail(lucentDreamTrail) }
    }

    private func etherealDreamTrail(_ lucentDreamTrail: PaliroNativeCall) {
        let mellowWonderTrail = SecItemDelete(tranquilThoughtTrail as CFDictionary)
        if mellowWonderTrail != errSecSuccess && mellowWonderTrail != errSecItemNotFound {
            celestialExpressionTrail("remove", mellowWonderTrail: mellowWonderTrail)
            tranquilAffinityTrail = .tranquilCuriosityTrail
        }
        do {
            try celestialFeelingTrail()
            lucentDreamTrail.dawnThoughtCanvas()
        } catch {
            lucentDreamTrail.silkenWonderCanvas("Unable to clear the protected account credential.", "PROTECTED_FILE_REMOVE_FAILED")
        }
    }
}
