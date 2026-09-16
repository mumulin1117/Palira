import Foundation
import Security

@objc(PaliroQuietCove)
final class PaliroQuietCove: PaliroSilverWillow, PaliroMeadowHarmony {
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

    private func mellowThoughtTrail(_ celestialDreamTrail: Data?, lucentDreamTrail: PaliroAmberRipple) {
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

    @objc(read:) func mellowImaginationTrail(_ lucentDreamTrail: PaliroAmberRipple) {
        lucentExpressionTrail.async { [self] in etherealWonderTrail(lucentDreamTrail) }
    }

    private func etherealWonderTrail(_ lucentDreamTrail: PaliroAmberRipple) {
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

    @objc(write:) func etherealFeelingTrail(_ lucentDreamTrail: PaliroAmberRipple) {
        lucentExpressionTrail.async { [self] in etherealReflectionTrail(lucentDreamTrail) }
    }

    private func etherealReflectionTrail(_ lucentDreamTrail: PaliroAmberRipple) {
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

    @objc(remove:) func etherealAffinityTrail(_ lucentDreamTrail: PaliroAmberRipple) {
        lucentExpressionTrail.async { [self] in etherealDreamTrail(lucentDreamTrail) }
    }

    private func etherealDreamTrail(_ lucentDreamTrail: PaliroAmberRipple) {
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
