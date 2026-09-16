import Foundation

enum PaliroDawnWhisper {
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
