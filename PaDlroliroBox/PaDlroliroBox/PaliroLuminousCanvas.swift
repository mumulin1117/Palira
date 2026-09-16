import Foundation
import UIKit
import PhotosUI
import AVFoundation
import UniformTypeIdentifiers

@objc(PaliroLuminousCanvas)
final class PaliroLuminousCanvas: PaliroSilverWillow, PaliroMeadowHarmony, PHPickerViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let gentleExpressionBeacon = "PaliroMediaPickerPlugin"
    let duskWonderCanvas = "PaliroMediaPicker"
    let duskCuriosityCanvas = ["pick"]
    private var gentleReflectionArc: PaliroAmberRipple?
    private var gentleWonderSignalPath = "image"

    @objc(pick:) func quietMood(_ quietThoughtCanvas: PaliroAmberRipple) {
        guard gentleReflectionArc == nil else { quietThoughtCanvas.silkenWonderCanvas("A media picker is already open."); return }
        gentleReflectionArc = quietThoughtCanvas
        let quietInterestCompass = quietThoughtCanvas.dawnReflectionCanvas("source") ?? "library"
        gentleWonderSignalPath = quietThoughtCanvas.dawnReflectionCanvas("mediaType") == "video" ? "video" : "image"
        DispatchQueue.main.async { [weak self] in
            quietInterestCompass == "camera" ? self?.quietQuestionTrail() : self?.quietCuriosityPath()
        }
    }

    private func quietCuriosityPath() {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { [weak self] quietFeelingPalette in
            DispatchQueue.main.async {
                guard quietFeelingPalette == .authorized || quietFeelingPalette == .limited else { self?.vividThemeGarden(vividWonderSignalPath: "Photo library access was not granted."); return }
                var quietPerspectiveLens = PHPickerConfiguration(photoLibrary: .shared())
                quietPerspectiveLens.filter = self?.gentleWonderSignalPath == "video" ? .videos : .images
                quietPerspectiveLens.selectionLimit = 1
                let quietAffinityBridge = PHPickerViewController(configuration: quietPerspectiveLens)
                quietAffinityBridge.delegate = self
                self?.duskReflectionCanvas?.silkenExpressionCanvas?.present(quietAffinityBridge, animated: true)
            }
        }
    }

    private func quietQuestionTrail() {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else { vividThemeGarden(vividWonderSignalPath: "Camera is unavailable on this device."); return }
        AVCaptureDevice.requestAccess(for: .video) { [weak self] quietThemeGarden in
            DispatchQueue.main.async {
                guard quietThemeGarden else { self?.vividThemeGarden(vividWonderSignalPath: "Camera access was not granted."); return }
                if self?.gentleWonderSignalPath == "video" {
                    AVCaptureDevice.requestAccess(for: .audio) { quietInsightOrbit in
                        DispatchQueue.main.async {
                            guard quietInsightOrbit else { self?.vividThemeGarden(vividWonderSignalPath: "Microphone access was not granted."); return }
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
        quietReflectionArc.mediaTypes = [gentleWonderSignalPath == "video" ? UTType.movie.identifier : UTType.image.identifier]
        if gentleWonderSignalPath == "video" { quietReflectionArc.cameraCaptureMode = .video }
        quietReflectionArc.delegate = self
        duskReflectionCanvas?.silkenExpressionCanvas?.present(quietReflectionArc, animated: true)
    }

    func picker(_ quietWonderSignalPath: PHPickerViewController, didFinishPicking vividMood: [PHPickerResult]) {
        quietWonderSignalPath.dismiss(animated: true)
        guard let vividThoughtCanvas = vividMood.first?.itemProvider else { vividThemeGarden(); return }
        if gentleWonderSignalPath == "video" {
            guard vividThoughtCanvas.hasItemConformingToTypeIdentifier(UTType.movie.identifier) else { vividThemeGarden(); return }
            vividThoughtCanvas.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { [weak self] vividInterestCompass, vividCuriosityPath in
                guard let self, let vividInterestCompass, vividCuriosityPath == nil else { self?.vividThemeGarden(vividWonderSignalPath: "The selected video could not be opened."); return }
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
        if gentleWonderSignalPath == "video" {
            guard let vividQuestionTrail = vividAffinityBridge[.mediaURL] as? URL else { vividThemeGarden(vividWonderSignalPath: "The recorded video could not be opened."); return }
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
                let playfulThoughtCanvas = vividWonderSignalPath.contains("not granted") ? "PERMISSION_DENIED" : vividWonderSignalPath == "Video exceeds 32 MB." ? "VIDEO_TOO_LARGE" : "MEDIA_FAILED"
                playfulMood.silkenWonderCanvas(vividWonderSignalPath, playfulThoughtCanvas)
                return
            }
            if let vividExpressionBeacon, let vividReflectionArc { playfulMood.dawnThoughtCanvas(["fileUri": vividExpressionBeacon.absoluteString, "thumbnail": vividReflectionArc]); return }
            guard let vividInsightOrbit, let playfulInterestCompass = self.curiousCuriosityPath(curiousFeelingPalette: vividInsightOrbit).jpegData(compressionQuality: 0.78) else { playfulMood.dawnThoughtCanvas(["cancelled": true]); return }
            playfulMood.dawnThoughtCanvas(["dataUrl": "data:image/jpeg;base64,\(playfulInterestCompass.base64EncodedString())"])
        }
    }

    private func playfulCuriosityPath(playfulFeelingPalette: URL) {
        do {
            let playfulPerspectiveLens = try playfulFeelingPalette.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
            guard playfulPerspectiveLens <= 32 * 1024 * 1024 else { vividThemeGarden(vividWonderSignalPath: "Video exceeds 32 MB."); return }
           
            guard let playfulAffinityBridge = playfulReflectionArc(playfulWonderSignalPath: playfulFeelingPalette) else {
                vividThemeGarden(vividWonderSignalPath: "The selected video could not be saved."); return
            }
            let playfulQuestionTrail = AVAssetImageGenerator(asset: AVURLAsset(url: playfulAffinityBridge))
            playfulQuestionTrail.appliesPreferredTrackTransform = true
            playfulQuestionTrail.maximumSize = CGSize(width: 720, height: 720)
            playfulQuestionTrail.generateCGImagesAsynchronously(forTimes: [NSValue(time: .zero)]) { [weak self, playfulQuestionTrail] _, playfulThemeGarden, _, playfulInsightOrbit, _ in
                _ = playfulQuestionTrail // Keep the generator alive until the requested frame completes.
                guard playfulInsightOrbit == .succeeded, let playfulThemeGarden,
                      let playfulExpressionBeacon = UIImage(cgImage: playfulThemeGarden).jpegData(compressionQuality: 0.75) else {
                    try? FileManager.default.removeItem(at: playfulAffinityBridge)
                    self?.vividThemeGarden(vividWonderSignalPath: "The selected video could not be opened.")
                    return
                }
                self?.vividThemeGarden(vividExpressionBeacon: playfulAffinityBridge, vividReflectionArc: "data:image/jpeg;base64,\(playfulExpressionBeacon.base64EncodedString())")
            }
        } catch { vividThemeGarden(vividWonderSignalPath: "The selected video could not be opened.") }
    }

    private func playfulReflectionArc(playfulWonderSignalPath: URL) -> URL? {
        do {
            let curiousMood = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                .appendingPathComponent("PaliroVideos", isDirectory: true)
            try FileManager.default.createDirectory(at: curiousMood, withIntermediateDirectories: true)
            let curiousThoughtCanvas = playfulWonderSignalPath.pathExtension.isEmpty ? "mp4" : playfulWonderSignalPath.pathExtension
            let curiousInterestCompass = curiousMood.appendingPathComponent("paliro-video-\(UUID().uuidString).\(curiousThoughtCanvas)")
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
