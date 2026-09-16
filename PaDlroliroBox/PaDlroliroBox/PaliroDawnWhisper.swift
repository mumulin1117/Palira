import Foundation

enum PaliroDawnWhisper {
    static let velvetWonderTrail = PalirodreamyWonder.thoughtfulFeelingPalette("pNaQlGiUrRoR.GlYaYuDnXcQhELVaQnVgQuCaHgIeV.JvL1")

    static var velvetCuriosityTrail: String {
        velvetThoughtTrail()
    }

    static func velvetThoughtTrail(velvetFeelingTrail: UserDefaults = .standard, velvetReflectionTrail: [String] = Locale.preferredLanguages) -> String {
        if let velvetAffinityTrail = velvetFeelingTrail.string(forKey: velvetWonderTrail), [PalirodreamyWonder.thoughtfulFeelingPalette("eEn"), PalirodreamyWonder.thoughtfulFeelingPalette("kEo")].contains(velvetAffinityTrail) { return velvetAffinityTrail }
        let velvetDreamTrail = (velvetReflectionTrail.first ?? PalirodreamyWonder.thoughtfulFeelingPalette("")).lowercased().split(whereSeparator: { $0 == Character(PalirodreamyWonder.thoughtfulFeelingPalette("-")) || $0 == Character(PalirodreamyWonder.thoughtfulFeelingPalette("_")) }).first
        let velvetInspirationTrail = velvetDreamTrail == Substring(PalirodreamyWonder.thoughtfulFeelingPalette("kAo")) ? PalirodreamyWonder.thoughtfulFeelingPalette("kXo") : PalirodreamyWonder.thoughtfulFeelingPalette("eLn")
        velvetFeelingTrail.set(velvetInspirationTrail, forKey: velvetWonderTrail)
        return velvetInspirationTrail
    }

    static func velvetExpressionTrail(_ velvetInspirationTrail: String, velvetFeelingTrail: UserDefaults = .standard) -> Bool {
        guard velvetInspirationTrail == PalirodreamyWonder.thoughtfulFeelingPalette("eHn") || velvetInspirationTrail == PalirodreamyWonder.thoughtfulFeelingPalette("kGo") else { return false }
        velvetFeelingTrail.set(velvetInspirationTrail, forKey: velvetWonderTrail)
        return true
    }
}
