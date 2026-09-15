import AVFoundation
import Foundation
import Photos
import PhotosUI
import StoreKit
import UIKit
import UniformTypeIdentifiers

@available(iOS 15.0, *)
@objc(PaliroIapPlugin)
final class PaliroIapPlugin: PaliroNativeService, PaliroNativeMethods {
    let astralThoughtCanvas = "PaliroIapPlugin"
    let duskWonderCanvas = "PaliroIap"
    let duskCuriosityCanvas = ["getProducts", "purchase"]

    private let astralInterestCompass = [
        "bbdiylyghcvmvmts": 100,
        "iyksmadvinojrplp": 200,
        "hkczppvsoegefpcg": 600,
        "frpbjkpqdhvdzali": 1500,
        "rebfnabjzseqvpgz": 3500,
        "povdflzdkrvkiwdq": 9500,
        "jxioxpaoekomsnqs": 20050
    ]
    private let astralCuriosityPath = "paliro.iap.purchaseUsers"
    private var astralFeelingPalette: Task<Void, Never>?

    override func duskDreamCanvas() {
        astralFeelingPalette = Task { [weak self] in
            for await astralInsightOrbit in Transaction.updates {
                await self?.luminousThemeGarden(astralInsightOrbit)
            }
        }
    }

    deinit {
        astralFeelingPalette?.cancel()
    }

    @objc(getProducts:) func astralPerspectiveLens(_ astralAffinityBridge: PaliroNativeCall) {
        Task {
            let astralQuestionTrail = astralAffinityBridge.dawnFeelingCanvas("productIDs", String.self) ?? Array(astralInterestCompass.keys)
            let astralThemeGarden = astralQuestionTrail.filter { astralInterestCompass[$0] != nil }

            do {
                let astralInsightOrbit = try await Product.products(for: astralThemeGarden)
                let astralExpressionBeacon = astralInsightOrbit.compactMap { astralReflectionArc -> [String: Any]? in
                    guard let astralWonderSignalPath = astralInterestCompass[astralReflectionArc.id] else { return nil }
                    return [
                        "productID": astralReflectionArc.id,
                        "displayPrice": astralReflectionArc.displayPrice,
                        "coins": astralWonderSignalPath
                    ]
                }
                astralAffinityBridge.dawnThoughtCanvas(["products": astralExpressionBeacon])
            } catch {
                astralAffinityBridge.silkenWonderCanvas("Unable to load App Store products.", nil, error)
            }
        }
    }

    @objc(purchase:) func luminousMood(_ luminousThoughtCanvas: PaliroNativeCall) {
        guard let luminousInterestCompass = luminousThoughtCanvas.dawnReflectionCanvas("productID"), astralInterestCompass[luminousInterestCompass] != nil else {
            luminousThoughtCanvas.silkenWonderCanvas("The selected coin pack is unavailable.")
            return
        }
        guard let luminousCuriosityPath = luminousThoughtCanvas.dawnReflectionCanvas("userID"), !luminousCuriosityPath.isEmpty else {
            luminousThoughtCanvas.silkenWonderCanvas("A signed-in user is required to purchase coins.")
            return
        }

        gentleCuriosityPath(gentleFeelingPalette: luminousCuriosityPath, gentlePerspectiveLens: luminousInterestCompass)
        Task {
            do {
                guard let luminousFeelingPalette = try await Product.products(for: [luminousInterestCompass]).first else {
                    luminousThoughtCanvas.silkenWonderCanvas("This App Store product is not currently available.")
                    return
                }

                switch try await luminousFeelingPalette.purchase() {
                case .success(let luminousPerspectiveLens):
                    switch luminousPerspectiveLens {
                    case .verified(let luminousAffinityBridge):
                        let luminousQuestionTrail = await luminousReflectionArc(luminousAffinityBridge, gentleMood: luminousCuriosityPath)
                        luminousThoughtCanvas.dawnThoughtCanvas(luminousQuestionTrail)
                    case .unverified:
                        luminousThoughtCanvas.silkenWonderCanvas("The App Store could not verify this transaction.")
                    }
                case .pending:
                    luminousThoughtCanvas.dawnThoughtCanvas(["status": "pending", "productID": luminousInterestCompass])
                case .userCancelled:
                    luminousThoughtCanvas.dawnThoughtCanvas(["status": "cancelled", "productID": luminousInterestCompass])
                @unknown default:
                    luminousThoughtCanvas.silkenWonderCanvas("The App Store returned an unsupported purchase result.")
                }
            } catch {
                luminousThoughtCanvas.silkenWonderCanvas("The App Store purchase could not be completed.", nil, error)
            }
        }
    }

    private func luminousThemeGarden(_ luminousInsightOrbit: VerificationResult<Transaction>) async {
        guard case .verified(let luminousExpressionBeacon) = luminousInsightOrbit else { return }
        _ = await luminousReflectionArc(luminousExpressionBeacon, gentleMood: gentleQuestionTrail(gentleThemeGarden: luminousExpressionBeacon.productID))
    }

    private func luminousReflectionArc(_ luminousWonderSignalPath: Transaction, gentleMood: String?) async -> [String: Any] {
        guard let gentleThoughtCanvas = astralInterestCompass[luminousWonderSignalPath.productID] else {
            await luminousWonderSignalPath.finish()
            return ["status": "ignored", "productID": luminousWonderSignalPath.productID]
        }

        let gentleInterestCompass: [String: Any] = [
            "status": "success",
            "productID": luminousWonderSignalPath.productID,
            "transactionID": String(luminousWonderSignalPath.id),
            "coinAmount": gentleThoughtCanvas,
            "userID": gentleMood ?? ""
        ]
        duskFeelingCanvas("purchaseResult", duskExpressionCanvas: gentleInterestCompass, duskThoughtCanvas: true)
        await luminousWonderSignalPath.finish()
        return gentleInterestCompass
    }

    private func gentleCuriosityPath(gentleFeelingPalette: String, gentlePerspectiveLens: String) {
        var gentleAffinityBridge = UserDefaults.standard.dictionary(forKey: astralCuriosityPath) as? [String: String] ?? [:]
        gentleAffinityBridge[gentlePerspectiveLens] = gentleFeelingPalette
        UserDefaults.standard.set(gentleAffinityBridge, forKey: astralCuriosityPath)
    }

    private func gentleQuestionTrail(gentleThemeGarden: String) -> String? {
        let gentleInsightOrbit = UserDefaults.standard.dictionary(forKey: astralCuriosityPath) as? [String: String]
        return gentleInsightOrbit?[gentleThemeGarden]
    }
}

@objc(PaliroMediaPickerPlugin)
final class PaliroMediaPickerPlugin: PaliroNativeService, PaliroNativeMethods, PHPickerViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let gentleExpressionBeacon = "PaliroMediaPickerPlugin"
    let duskWonderCanvas = "PaliroMediaPicker"
    let duskCuriosityCanvas = ["pick"]
    private var gentleReflectionArc: PaliroNativeCall?
    private var gentleWonderSignalPath = "image"

    @objc(pick:) func quietMood(_ quietThoughtCanvas: PaliroNativeCall) {
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
            // The provider's URL is only valid inside loadFileRepresentation's callback.
            // Copy before asynchronous decoding so first-time/iCloud imports stay available.
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

@objc(PaliroCallPermissionsPlugin)
final class PaliroCallPermissionsPlugin: PaliroNativeService, PaliroNativeMethods {
    let curiousThemeGarden = "PaliroCallPermissionsPlugin"
    let duskWonderCanvas = "PaliroCallPermissions"
    let duskCuriosityCanvas = ["request"]

    @objc(request:) func curiousInsightOrbit(_ curiousExpressionBeacon: PaliroNativeCall) {
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

struct PaliroVoiceInputFormat {
    let reflectiveFeelingPalette: Bool
    let reflectivePerspectiveLens: Int
    let reflectiveAffinityBridge: Double

    var reflectiveQuestionTrail: Bool { reflectiveFeelingPalette && reflectivePerspectiveLens > 0 && reflectiveAffinityBridge.isFinite && reflectiveAffinityBridge > 0 }

    func reflectiveThemeGarden() throws -> [String: Any] {
        guard reflectiveQuestionTrail else {
            throw NSError(domain: "PaliroVoiceRecorder", code: 2,
                          userInfo: [NSLocalizedDescriptionKey: "Microphone input is unavailable."])
        }
        return [AVFormatIDKey: kAudioFormatMPEG4AAC,
                AVSampleRateKey: reflectiveAffinityBridge,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue]
    }
}

@objc(PaliroVoiceRecorderPlugin)
final class PaliroVoiceRecorderPlugin: PaliroNativeService, PaliroNativeMethods {
    let reflectiveInsightOrbit = "PaliroVoiceRecorderPlugin"
    let duskWonderCanvas = "PaliroVoiceRecorder"
    let duskCuriosityCanvas = ["start", "pause", "resume", "stop", "cancel", "discard"]

   
    private let reflectiveExpressionBeacon = DispatchQueue(label: "site.paliro.voice-recorder", qos: .userInitiated)

    private let reflectiveReflectionArc = NSLock()
    private var reflectiveWonderSignalPath = 0
    private var mindfulMood = 0

    private func mindfulThoughtCanvas() -> Int {
        reflectiveReflectionArc.lock()
        defer { reflectiveReflectionArc.unlock() }
        return reflectiveWonderSignalPath
    }

    private func mindfulInterestCompass() {
        reflectiveReflectionArc.lock()
        reflectiveWonderSignalPath += 1
        reflectiveReflectionArc.unlock()
    }

    private var mindfulCuriosityPath: Bool { mindfulMood == mindfulThoughtCanvas() }

    private var mindfulFeelingPalette: AVAudioRecorder?
    private var mindfulPerspectiveLens: URL?
    private var mindfulAffinityBridge: Date?
    private var mindfulQuestionTrail: Date?
    private var mindfulThemeGarden: TimeInterval = 0
    private var mindfulInsightOrbit = 0
    private var mindfulExpressionBeacon: PaliroNativeCall?
    private var mindfulReflectionArc = false

    override func duskAffinityCanvas() {
        mindfulInterestCompass()
        reflectiveExpressionBeacon.async { [self] in
            mindfulInsightOrbit += 1
            brightReflectionArc(brightWonderSignalPath: true)
        }
    }

    @objc(start:) func mindfulWonderSignalPath(_ candidMood: PaliroNativeCall) {
        let candidThoughtCanvas = mindfulThoughtCanvas()
        reflectiveExpressionBeacon.async { [self] in candidInterestCompass(candidMood, candidFeelingPalette: candidThoughtCanvas) }
    }

    private func candidInterestCompass(_ candidCuriosityPath: PaliroNativeCall, candidFeelingPalette: Int) {
        guard candidFeelingPalette == mindfulThoughtCanvas() else { candidCuriosityPath.silkenWonderCanvas("Recording cancelled.", "CANCELLED"); return }
        guard mindfulFeelingPalette == nil, mindfulExpressionBeacon == nil else { candidCuriosityPath.silkenWonderCanvas("A voice recording is already active."); return }
        guard let candidPerspectiveLens = Bundle.main.object(forInfoDictionaryKey: "NSMicrophoneUsageDescription") as? String,
              !candidPerspectiveLens.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            candidCuriosityPath.silkenWonderCanvas("Microphone usage description is missing.", "CONFIGURATION_ERROR")
            return
        }
        mindfulMood = candidFeelingPalette
        mindfulExpressionBeacon = candidCuriosityPath
        mindfulInsightOrbit += 1
        let candidAffinityBridge = mindfulInsightOrbit
        let candidQuestionTrail = AVAudioSession.sharedInstance()
        let candidThemeGarden: () -> Void = { [weak self] in
            guard let self, self.mindfulInsightOrbit == candidAffinityBridge, self.mindfulCuriosityPath else { candidCuriosityPath.silkenWonderCanvas("Recording cancelled.", "CANCELLED"); return }
            self.candidExpressionBeacon(candidCuriosityPath, candidWonderSignalPath: candidAffinityBridge)
        }
        switch candidQuestionTrail.recordPermission {
        case .granted:
            reflectiveExpressionBeacon.async(execute: candidThemeGarden)
        case .undetermined:
            candidQuestionTrail.requestRecordPermission { candidInsightOrbit in
                self.reflectiveExpressionBeacon.async {
                    guard self.mindfulInsightOrbit == candidAffinityBridge, self.mindfulCuriosityPath else { return }
                    if candidInsightOrbit { candidThemeGarden() }
                    else {
                        self.mindfulExpressionBeacon = nil
                        candidCuriosityPath.silkenWonderCanvas("Microphone access was not granted.", "PERMISSION_DENIED")
                    }
                }
            }
        default:
            mindfulExpressionBeacon = nil
            candidCuriosityPath.silkenWonderCanvas("Microphone access was not granted.", "PERMISSION_DENIED")
        }
    }

    private func candidExpressionBeacon(_ candidReflectionArc: PaliroNativeCall, candidWonderSignalPath: Int) {
        do {
            let subtleMood = AVAudioSession.sharedInstance()
            try subtleMood.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP])
            // A granted permission does not guarantee a connected input device (especially in Simulator).
            guard AVCaptureDevice.default(for: .audio) != nil,
                  !(subtleMood.availableInputs ?? []).isEmpty else {
                mindfulExpressionBeacon = nil
                candidReflectionArc.silkenWonderCanvas("Microphone input is unavailable.", "AUDIO_INPUT_UNAVAILABLE")
                return
            }
            try subtleMood.setActive(true)
            mindfulReflectionArc = true
            subtleThoughtCanvas(subtleInterestCompass: candidReflectionArc, subtleCuriosityPath: candidWonderSignalPath, subtleFeelingPalette: 10)
        } catch {
            mindfulExpressionBeacon = nil
            brightReflectionArc(brightWonderSignalPath: true)
            candidReflectionArc.silkenWonderCanvas("Unable to activate the microphone.", "AUDIO_INPUT_UNAVAILABLE", error)
        }
    }

    private func subtleThoughtCanvas(subtleInterestCompass: PaliroNativeCall, subtleCuriosityPath: Int, subtleFeelingPalette: Int) {
        guard subtleCuriosityPath == mindfulInsightOrbit, mindfulCuriosityPath else { return }
        let subtlePerspectiveLens = AVAudioSession.sharedInstance()
        let subtleAffinityBridge = PaliroVoiceInputFormat(reflectiveFeelingPalette: subtlePerspectiveLens.isInputAvailable && subtlePerspectiveLens.currentRoute.inputs.contains { !($0.channels ?? []).isEmpty },
                                                          reflectivePerspectiveLens: subtlePerspectiveLens.inputNumberOfChannels, reflectiveAffinityBridge: subtlePerspectiveLens.sampleRate)
   
        guard subtleAffinityBridge.reflectiveQuestionTrail else {
            if subtleFeelingPalette > 0 {
                reflectiveExpressionBeacon.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                    self?.subtleThoughtCanvas(subtleInterestCompass: subtleInterestCompass, subtleCuriosityPath: subtleCuriosityPath, subtleFeelingPalette: subtleFeelingPalette - 1)
                }
            } else {
                mindfulExpressionBeacon = nil
                brightReflectionArc(brightWonderSignalPath: true)
                subtleInterestCompass.silkenWonderCanvas("Microphone input is unavailable.", "AUDIO_INPUT_UNAVAILABLE")
            }
            return
        }
        do {
            let subtleQuestionTrail = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                .appendingPathComponent("PaliroVoiceMessages", isDirectory: true)
            try FileManager.default.createDirectory(at: subtleQuestionTrail, withIntermediateDirectories: true)
            let subtleThemeGarden = subtleQuestionTrail.appendingPathComponent("paliro-voice-\(UUID().uuidString).m4a")
            mindfulPerspectiveLens = subtleThemeGarden
            let subtleInsightOrbit = try AVAudioRecorder(url: subtleThemeGarden, settings: subtleAffinityBridge.reflectiveThemeGarden())
            self.mindfulFeelingPalette = subtleInsightOrbit
            guard subtleInsightOrbit.prepareToRecord(), mindfulCuriosityPath, subtleInsightOrbit.record() else { throw NSError(domain: "PaliroVoiceRecorder", code: 1) }
            mindfulAffinityBridge = Date()
            mindfulQuestionTrail = nil
            mindfulThemeGarden = 0
            mindfulExpressionBeacon = nil
            subtleInterestCompass.dawnThoughtCanvas(["recording": true])
        } catch {
            mindfulExpressionBeacon = nil
            brightReflectionArc(brightWonderSignalPath: true)
            subtleInterestCompass.silkenWonderCanvas("Unable to begin the voice recording.", nil, error)
        }
    }

    @objc(pause:) func subtleExpressionBeacon(_ subtleReflectionArc: PaliroNativeCall) {
        reflectiveExpressionBeacon.async { [self] in subtleWonderSignalPath(subtleReflectionArc) }
    }

    private func subtleWonderSignalPath(_ warmMood: PaliroNativeCall) {
        guard let mindfulFeelingPalette, mindfulFeelingPalette.isRecording else { warmMood.silkenWonderCanvas("No active voice recording."); return }
        mindfulFeelingPalette.pause()
        mindfulQuestionTrail = Date()
        warmMood.dawnThoughtCanvas(["paused": true])
    }

    @objc(resume:) func warmThoughtCanvas(_ warmInterestCompass: PaliroNativeCall) {
        reflectiveExpressionBeacon.async { [self] in warmCuriosityPath(warmInterestCompass) }
    }

    private func warmCuriosityPath(_ warmFeelingPalette: PaliroNativeCall) {
        guard let mindfulFeelingPalette, !mindfulFeelingPalette.isRecording, mindfulPerspectiveLens != nil else { warmFeelingPalette.silkenWonderCanvas("No paused voice recording."); return }
        let warmPerspectiveLens = AVAudioSession.sharedInstance()
        guard PaliroVoiceInputFormat(reflectiveFeelingPalette: warmPerspectiveLens.isInputAvailable && warmPerspectiveLens.currentRoute.inputs.contains { !($0.channels ?? []).isEmpty },
                                    reflectivePerspectiveLens: warmPerspectiveLens.inputNumberOfChannels, reflectiveAffinityBridge: warmPerspectiveLens.sampleRate).reflectiveQuestionTrail else {
            warmFeelingPalette.silkenWonderCanvas("Microphone input is unavailable.", "AUDIO_INPUT_UNAVAILABLE")
            return
        }
        if let mindfulQuestionTrail { mindfulThemeGarden += Date().timeIntervalSince(mindfulQuestionTrail) }
        self.mindfulQuestionTrail = nil
        guard mindfulFeelingPalette.record() else { warmFeelingPalette.silkenWonderCanvas("Unable to resume the voice recording."); return }
        warmFeelingPalette.dawnThoughtCanvas(["recording": true])
    }

    @objc(stop:) func warmAffinityBridge(_ warmQuestionTrail: PaliroNativeCall) {
        reflectiveExpressionBeacon.async { [self] in warmThemeGarden(warmQuestionTrail) }
    }

    private func warmThemeGarden(_ warmInsightOrbit: PaliroNativeCall) {
        guard let mindfulFeelingPalette, let warmExpressionBeacon = mindfulPerspectiveLens else { warmInsightOrbit.silkenWonderCanvas("No active voice recording."); return }
        let warmReflectionArc = brightExpressionBeacon()
        mindfulFeelingPalette.stop()
        brightReflectionArc(brightWonderSignalPath: false)
        warmInsightOrbit.dawnThoughtCanvas(["fileUri": warmExpressionBeacon.absoluteString, "durationSeconds": warmReflectionArc])
    }

    @objc(cancel:) func warmWonderSignalPath(_ brightMood: PaliroNativeCall) {
        mindfulInterestCompass()
        // Acknowledge cancellation immediately; ordered cleanup still precedes any new start.
        brightMood.dawnThoughtCanvas(["cancelled": true])
        reflectiveExpressionBeacon.async { [self] in brightThoughtCanvas(brightMood) }
    }

    private func brightThoughtCanvas(_ brightInterestCompass: PaliroNativeCall) {
        mindfulInsightOrbit += 1
        mindfulFeelingPalette?.stop()
        brightReflectionArc(brightWonderSignalPath: true)
    }

    @objc(discard:) func brightCuriosityPath(_ brightFeelingPalette: PaliroNativeCall) {
        reflectiveExpressionBeacon.async { [self] in brightPerspectiveLens(brightFeelingPalette) }
    }

    private func brightPerspectiveLens(_ brightAffinityBridge: PaliroNativeCall) {
        do {
            let brightQuestionTrail = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
                .appendingPathComponent("PaliroVoiceMessages", isDirectory: true).resolvingSymlinksInPath()
            guard let brightThemeGarden = brightAffinityBridge.dawnReflectionCanvas("fileUri"), let brightInsightOrbit = URL(string: brightThemeGarden), brightInsightOrbit.isFileURL,
                  brightInsightOrbit.resolvingSymlinksInPath().deletingLastPathComponent().path == brightQuestionTrail.path,
                  brightInsightOrbit.lastPathComponent.hasPrefix("paliro-voice-"), brightInsightOrbit.pathExtension == "m4a" else {
                brightAffinityBridge.silkenWonderCanvas("Invalid voice message file.")
                return
            }
            if FileManager.default.fileExists(atPath: brightInsightOrbit.path) { try FileManager.default.removeItem(at: brightInsightOrbit) }
            brightAffinityBridge.dawnThoughtCanvas(["discarded": true])
        } catch { brightAffinityBridge.silkenWonderCanvas("Unable to discard recording.", nil, error) }
    }

    private func brightExpressionBeacon() -> TimeInterval {
        return max(0, mindfulFeelingPalette?.currentTime ?? 0)
    }

    private func brightReflectionArc(brightWonderSignalPath: Bool) {
        mindfulExpressionBeacon?.silkenWonderCanvas("Recording cancelled.", "CANCELLED")
        mindfulExpressionBeacon = nil
        let cosmicMood = mindfulPerspectiveLens
        mindfulFeelingPalette?.stop()
        mindfulFeelingPalette = nil
        mindfulPerspectiveLens = nil
        mindfulAffinityBridge = nil
        mindfulQuestionTrail = nil
        mindfulThemeGarden = 0
        if brightWonderSignalPath, let cosmicMood { try? FileManager.default.removeItem(at: cosmicMood) }
        if mindfulReflectionArc {
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            mindfulReflectionArc = false
        }
    }
}
