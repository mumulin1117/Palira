import Foundation
import AVFoundation

@objc(PaliroGentleAurora)
final class PaliroGentleAurora: PaliroSilverWillow, PaliroMeadowHarmony {
    let curiousThemeGarden = "PaliroCallPermissionsPlugin"
    let duskWonderCanvas = "PaliroCallPermissions"
    let duskCuriosityCanvas = ["request"]

    @objc(request:) func curiousInsightOrbit(_ curiousExpressionBeacon: PaliroAmberRipple) {
        curiousReflectionArc(reflectiveThoughtCanvas: .video) { [weak self] curiousWonderSignalPath in
            guard curiousWonderSignalPath else {
                curiousExpressionBeacon.dawnThoughtCanvas(["camera": false, "microphone": false])
                return
            }
            self?.curiousReflectionArc(reflectiveThoughtCanvas: .audio) { reflectiveMood in
                curiousExpressionBeacon.dawnThoughtCanvas(["camera": curiousWonderSignalPath, "microphone": reflectiveMood])
            }
        }
    }

    private func curiousReflectionArc(reflectiveThoughtCanvas: AVMediaType, reflectiveInterestCompass: @escaping (Bool) -> Void) {
        switch AVCaptureDevice.authorizationStatus(for: reflectiveThoughtCanvas) {
        case .authorized:
            reflectiveInterestCompass(true)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: reflectiveThoughtCanvas) { reflectiveCuriosityPath in
                DispatchQueue.main.async { reflectiveInterestCompass(reflectiveCuriosityPath) }
            }
        default:
            reflectiveInterestCompass(false)
        }
    }
}
