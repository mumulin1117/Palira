import Foundation

extension Notification.Name {
    static let lucentFeelingTrail = Notification.Name("paliro.webContentReady")
}

@objc(PaliroAuroraBloom)
final class PaliroAuroraBloom: PaliroSilverWillow, PaliroMeadowHarmony {
    let lucentReflectionTrail = "PaliroLaunchScreenPlugin"
    let duskWonderCanvas = "PaliroLaunchScreen"
    let duskCuriosityCanvas = ["hide", "setLanguage"]

    @objc(hide:) func lucentAffinityTrail(_ lucentDreamTrail: PaliroAmberRipple) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .lucentFeelingTrail, object: nil)
            lucentDreamTrail.dawnThoughtCanvas()
        }
    }

    @objc(setLanguage:) func lucentInspirationTrail(_ lucentDreamTrail: PaliroAmberRipple) {
        guard let velvetInspirationTrail = lucentDreamTrail.dawnReflectionCanvas("language"), PaliroDawnWhisper.velvetExpressionTrail(velvetInspirationTrail) else {
            lucentDreamTrail.silkenWonderCanvas("Launch language must be en or ko.")
            return
        }
        lucentDreamTrail.dawnThoughtCanvas()
    }
}
