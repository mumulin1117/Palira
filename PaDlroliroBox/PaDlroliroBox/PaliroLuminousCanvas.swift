import Foundation
import UIKit
import PhotosUI
import AVFoundation
import UniformTypeIdentifiers

@objc(PaliroLuminousCanvas)
final class PaliroLuminousCanvas: PaliroSilverWillow, PaliroMeadowHarmony, PHPickerViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let gentleExpressionBeacon = PalirodreamyWonder.thoughtfulFeelingPalette("PJaAlCiCrCoWMIeAdJiXaLPHiIcIkEeTrMPJlPuEgEiNn")
    let duskWonderCanvas = PalirodreamyWonder.thoughtfulFeelingPalette("PAaGlXiErQoVMReIdWiLaLPUiTcZkTeVr")
    let duskCuriosityCanvas = [PalirodreamyWonder.thoughtfulFeelingPalette("pViZcXk")]
    private var gentleReflectionArc: PaliroAmberRipple?
    private var gentleWonderSignalPath = PalirodreamyWonder.thoughtfulFeelingPalette("iWmLaVgUe")

    @objc(pick:) func quietMood(_ quietThoughtCanvas: PaliroAmberRipple) {
        guard gentleReflectionArc == nil else { quietThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("AY AmBeEdBiNaG QpUiUcAkZeKrH LiVsJ UaPlZrEeVaIdXyJ JoIpNeNnJ.")); return }
        gentleReflectionArc = quietThoughtCanvas
        let quietInterestCompass = quietThoughtCanvas.dawnReflectionCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("sSoGuSrMcSe")) ?? PalirodreamyWonder.thoughtfulFeelingPalette("lRiPbPrNaKrZy")
        gentleWonderSignalPath = quietThoughtCanvas.dawnReflectionCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("mPeSdPiOaLTXyDpLe")) == PalirodreamyWonder.thoughtfulFeelingPalette("vWiQdPeCo") ? PalirodreamyWonder.thoughtfulFeelingPalette("vKiDdKeNo") : PalirodreamyWonder.thoughtfulFeelingPalette("iDmIaLgSe")
        DispatchQueue.main.async { [weak self] in
            quietInterestCompass == PalirodreamyWonder.thoughtfulFeelingPalette("cVaTmAeGrAa") ? self?.quietQuestionTrail() : self?.quietCuriosityPath()
        }
    }

    private func quietCuriosityPath() {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { [weak self] quietFeelingPalette in
            DispatchQueue.main.async {
                guard quietFeelingPalette == .authorized || quietFeelingPalette == .limited else { self?.vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("PZhLoAtEoY GlDiZbFrAaCrAyV RaIcDcNeBsGsQ QwOaWsE XnWoBtM ZgWrSaYnPtAeZdR.")); return }
                var quietPerspectiveLens = PHPickerConfiguration(photoLibrary: .shared())
                quietPerspectiveLens.filter = self?.gentleWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("vDiUdIeEo") ? .videos : .images
                quietPerspectiveLens.selectionLimit = 1
                let quietAffinityBridge = PHPickerViewController(configuration: quietPerspectiveLens)
                quietAffinityBridge.delegate = self
                self?.duskReflectionCanvas?.silkenExpressionCanvas?.present(quietAffinityBridge, animated: true)
            }
        }
    }

    private func quietQuestionTrail() {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else { vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("CXaYmPeNrSaM MiQsM CuTnXaQvWaXiNlXaHbMlTeP GoDnV KtXhIiTsG WdDeKvUiVcGeN.")); return }
        AVCaptureDevice.requestAccess(for: .video) { [weak self] quietThemeGarden in
            DispatchQueue.main.async {
                guard quietThemeGarden else { self?.vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("CSaAmIeGrBaI QaCcPcQeDsPsS KwMaWsL QnAoOtG LgWrQaEnStNeKdC.")); return }
                if self?.gentleWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("vTiTdNeVo") {
                    AVCaptureDevice.requestAccess(for: .audio) { quietInsightOrbit in
                        DispatchQueue.main.async {
                            guard quietInsightOrbit else { self?.vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("MFiScTrOoXpPhBoTnUeP GaLcBcZeQsZsO BwWaXsQ NnQoStI KgJrIaCnDtOeCdK.")); return }
                            self?.quietExpressionBeacon()
                        }
                    }
                } else { self?.quietExpressionBeacon() }
            }
        }
    }

    private func quietExpressionBeacon() {
        let quietReflectionArc = UIImagePickerController()
        quietReflectionArc.sourceType = .camera
        quietReflectionArc.mediaTypes = [gentleWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("vNiCdLeCo") ? UTType.movie.identifier : UTType.image.identifier]
        if gentleWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("vZiQdDeMo") { quietReflectionArc.cameraCaptureMode = .video }
        quietReflectionArc.delegate = self
        duskReflectionCanvas?.silkenExpressionCanvas?.present(quietReflectionArc, animated: true)
    }

    func picker(_ quietWonderSignalPath: PHPickerViewController, didFinishPicking vividMood: [PHPickerResult]) {
        quietWonderSignalPath.dismiss(animated: true)
        guard let vividThoughtCanvas = vividMood.first?.itemProvider else { vividThemeGarden(); return }
        if gentleWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("vGiRdOeGo") {
            guard vividThoughtCanvas.hasItemConformingToTypeIdentifier(UTType.movie.identifier) else { vividThemeGarden(); return }
            vividThoughtCanvas.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { [weak self] vividInterestCompass, vividCuriosityPath in
                guard let self, let vividInterestCompass, vividCuriosityPath == nil else { self?.vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("TXhFeN GsOeDlMeKcHtWeLdK JvRiLdPeZoP QcJoVuDlGdU OnZoQtU GbVeD RoSpDeSnOeLdJ.")); return }
                self.playfulCuriosityPath(playfulFeelingPalette: vividInterestCompass)
            }
            return
        }
        guard vividThoughtCanvas.canLoadObject(ofClass: UIImage.self) else { vividThemeGarden(); return }
        vividThoughtCanvas.loadObject(ofClass: UIImage.self) { [weak self] vividFeelingPalette, _ in
            self?.vividThemeGarden(vividInsightOrbit: vividFeelingPalette as? UIImage)
        }
    }

    func imagePickerController(_ vividPerspectiveLens: UIImagePickerController, didFinishPickingMediaWithInfo vividAffinityBridge: [UIImagePickerController.InfoKey: Any]) {
        vividPerspectiveLens.dismiss(animated: true)
        if gentleWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("vAiZdEeZo") {
            guard let vividQuestionTrail = vividAffinityBridge[.mediaURL] as? URL else { vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("TXhAeM OrKeXcUoCrQdBeVdM LvFiWdJeJoZ YcRoGuSlPdQ KnRoAtH PbDeW PoJpFeTnCeTdU.")); return }
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in self?.playfulCuriosityPath(playfulFeelingPalette: vividQuestionTrail) }
            return
        }
        vividThemeGarden(vividInsightOrbit: vividAffinityBridge[.originalImage] as? UIImage)
    }

    func imagePickerControllerDidCancel(_ vividReflectionArc: UIImagePickerController) { vividReflectionArc.dismiss(animated: true); vividThemeGarden() }

    private func vividThemeGarden(vividInsightOrbit: UIImage? = nil, vividExpressionBeacon: URL? = nil, vividReflectionArc: String? = nil, vividWonderSignalPath: String? = nil) {
        DispatchQueue.main.async { [weak self] in
            guard let self, let playfulMood = self.gentleReflectionArc else { return }
            self.gentleReflectionArc = nil
            if let vividWonderSignalPath {
                let playfulThoughtCanvas = vividWonderSignalPath.contains(PalirodreamyWonder.thoughtfulFeelingPalette("nMoWtI BgJrAaHnTtGeFd")) ? PalirodreamyWonder.thoughtfulFeelingPalette("PHEARRMZIYSNSVISOBNN_CDTEONRIWEPD") : vividWonderSignalPath == PalirodreamyWonder.thoughtfulFeelingPalette("VFiEdQeSoR ReXxFcQeCeWdKsI X3Y2H XMKBE.") ? PalirodreamyWonder.thoughtfulFeelingPalette("VWIYDGEQOU_OTNOAOF_KLEAMRCGWE") : PalirodreamyWonder.thoughtfulFeelingPalette("MHEWDYIIAK_WFOANICLOEWD")
                playfulMood.silkenWonderCanvas(vividWonderSignalPath, playfulThoughtCanvas)
                return
            }
            if let vividExpressionBeacon, let vividReflectionArc { playfulMood.dawnThoughtCanvas([PalirodreamyWonder.thoughtfulFeelingPalette("fTiElVeNUArTi"): vividExpressionBeacon.absoluteString, PalirodreamyWonder.thoughtfulFeelingPalette("tAhUuZmLbWnMaOiOl"): vividReflectionArc]); return }
            guard let vividInsightOrbit, let playfulInterestCompass = self.curiousCuriosityPath(curiousFeelingPalette: vividInsightOrbit).jpegData(compressionQuality: 0.78) else { playfulMood.dawnThoughtCanvas([PalirodreamyWonder.thoughtfulFeelingPalette("cFaTnVcMeRlVlOeKd"): true]); return }
            playfulMood.dawnThoughtCanvas([PalirodreamyWonder.thoughtfulFeelingPalette("dVaAtSaVUNrVl"): "\(PalirodreamyWonder.thoughtfulFeelingPalette("dIaJtAaJ:DiEmUaSgNeR/EjHpJeXgU;KbCaZsSeH6X4V,"))\(playfulInterestCompass.base64EncodedString())"])
        }
    }

    private func playfulCuriosityPath(playfulFeelingPalette: URL) {
        do {
            let playfulPerspectiveLens = try playfulFeelingPalette.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
            guard playfulPerspectiveLens <= 32 * 1024 * 1024 else { vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("VQiDdQeXoF VeSxWcIeOeQdWsZ Z3R2Z SMNBI.")); return }
           
            guard let playfulAffinityBridge = playfulReflectionArc(playfulWonderSignalPath: playfulFeelingPalette) else {
                vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("TWhNeY XsBeJlQeWcPtNeWdH GvRiKdYeUoQ LcEoEuRlJdJ CnUoDtO CbCeP OsCaKvVeGdG.")); return
            }
            let playfulQuestionTrail = AVAssetImageGenerator(asset: AVURLAsset(url: playfulAffinityBridge))
            playfulQuestionTrail.appliesPreferredTrackTransform = true
            playfulQuestionTrail.maximumSize = CGSize(width: 720, height: 720)
            playfulQuestionTrail.generateCGImagesAsynchronously(forTimes: [NSValue(time: .zero)]) { [weak self, playfulQuestionTrail] _, playfulThemeGarden, _, playfulInsightOrbit, _ in
                _ = playfulQuestionTrail // Keep the generator alive until the requested frame completes.
                guard playfulInsightOrbit == .succeeded, let playfulThemeGarden,
                      let playfulExpressionBeacon = UIImage(cgImage: playfulThemeGarden).jpegData(compressionQuality: 0.75) else {
                    try? FileManager.default.removeItem(at: playfulAffinityBridge)
                    self?.vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("TOhMeS TsReKlIeKcKtAeWdG NvTiMdEeUoY RcMoUuLlRdM SnRoKtC FbPeB AoKpEeEnHeHdN."))
                    return
                }
                self?.vividThemeGarden(vividExpressionBeacon: playfulAffinityBridge, vividReflectionArc: "\(PalirodreamyWonder.thoughtfulFeelingPalette("dSaYtIaY:SiGmQaGgMeE/BjYpYeCgB;QbPaNsNeA6F4N,"))\(playfulExpressionBeacon.base64EncodedString())")
            }
        } catch { vividThemeGarden(vividWonderSignalPath: PalirodreamyWonder.thoughtfulFeelingPalette("TNhWeO LsPeUlIeAcOtGeEdS KvCiJdDeLoE AcCoWuBlTdM WnToRtN ZbQeV KoDpFeZnCeTdB.")) }
    }

    private func playfulReflectionArc(playfulWonderSignalPath: URL) -> URL? {
        do {
            let curiousMood = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                .appendingPathComponent(PalirodreamyWonder.thoughtfulFeelingPalette("PPaElHiSrIoLVEiSdZeRoHs"), isDirectory: true)
            try FileManager.default.createDirectory(at: curiousMood, withIntermediateDirectories: true)
            let curiousThoughtCanvas = playfulWonderSignalPath.pathExtension.isEmpty ? PalirodreamyWonder.thoughtfulFeelingPalette("mWpD4") : playfulWonderSignalPath.pathExtension
            let curiousInterestCompass = curiousMood.appendingPathComponent("\(PalirodreamyWonder.thoughtfulFeelingPalette("pQaTlZiBrGoX-VvIiJdNeIoN-"))\(UUID().uuidString)\(PalirodreamyWonder.thoughtfulFeelingPalette("."))\(curiousThoughtCanvas)")
            try FileManager.default.copyItem(at: playfulWonderSignalPath, to: curiousInterestCompass)
            return curiousInterestCompass
        } catch {
            return nil
        }
    }

    private func curiousCuriosityPath(curiousFeelingPalette: UIImage) -> UIImage {
        let curiousPerspectiveLens: CGFloat = 1280
        let curiousAffinityBridge = min(1, curiousPerspectiveLens / max(curiousFeelingPalette.size.width, curiousFeelingPalette.size.height))
        guard curiousAffinityBridge < 1 else { return curiousFeelingPalette }
        let curiousQuestionTrail = CGSize(width: curiousFeelingPalette.size.width * curiousAffinityBridge, height: curiousFeelingPalette.size.height * curiousAffinityBridge)
        return UIGraphicsImageRenderer(size: curiousQuestionTrail).image { _ in curiousFeelingPalette.draw(in: CGRect(origin: .zero, size: curiousQuestionTrail)) }
    }
}
