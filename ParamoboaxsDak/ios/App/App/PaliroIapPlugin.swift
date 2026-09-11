import Capacitor
import AVFoundation
import Foundation
import Photos
import PhotosUI
import StoreKit
import UIKit
import UniformTypeIdentifiers

@available(iOS 15.0, *)
@objc(PaliroIapPlugin)
final class PaliroIapPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "PaliroIapPlugin"
    let jsName = "PaliroIap"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise)
    ]

    private let coinAmounts = [
        "bbdiylyghcvmvmts": 100,
        "iyksmadvinojrplp": 200,
        "hkczppvsoegefpcg": 600,
        "frpbjkpqdhvdzali": 1500,
        "rebfnabjzseqvpgz": 3500,
        "povdflzdkrvkiwdq": 9500,
        "jxioxpaoekomsnqs": 20050
    ]
    private let purchaseUsersKey = "paliro.iap.purchaseUsers"
    private var transactionUpdatesTask: Task<Void, Never>?

    override func load() {
        transactionUpdatesTask = Task { [weak self] in
            for await result in Transaction.updates {
                await self?.handleTransactionUpdate(result)
            }
        }
    }

    deinit {
        transactionUpdatesTask?.cancel()
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        Task {
            let requestedIDs = call.getArray("productIDs", String.self) ?? Array(coinAmounts.keys)
            let validIDs = requestedIDs.filter { coinAmounts[$0] != nil }

            do {
                let products = try await Product.products(for: validIDs)
                let payload = products.compactMap { product -> [String: Any]? in
                    guard let coins = coinAmounts[product.id] else { return nil }
                    return [
                        "productID": product.id,
                        "displayPrice": product.displayPrice,
                        "coins": coins
                    ]
                }
                call.resolve(["products": payload])
            } catch {
                call.reject("Unable to load App Store products.", nil, error)
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productID = call.getString("productID"), coinAmounts[productID] != nil else {
            call.reject("The selected coin pack is unavailable.")
            return
        }
        guard let userID = call.getString("userID"), !userID.isEmpty else {
            call.reject("A signed-in user is required to purchase coins.")
            return
        }

        savePurchasingUser(userID, for: productID)
        Task {
            do {
                guard let product = try await Product.products(for: [productID]).first else {
                    call.reject("This App Store product is not currently available.")
                    return
                }

                switch try await product.purchase() {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        let payload = await deliver(transaction, fallbackUserID: userID)
                        call.resolve(payload)
                    case .unverified:
                        call.reject("The App Store could not verify this transaction.")
                    }
                case .pending:
                    call.resolve(["status": "pending", "productID": productID])
                case .userCancelled:
                    call.resolve(["status": "cancelled", "productID": productID])
                @unknown default:
                    call.reject("The App Store returned an unsupported purchase result.")
                }
            } catch {
                call.reject("The App Store purchase could not be completed.", nil, error)
            }
        }
    }

    private func handleTransactionUpdate(_ result: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = result else { return }
        _ = await deliver(transaction, fallbackUserID: purchasingUser(for: transaction.productID))
    }

    private func deliver(_ transaction: Transaction, fallbackUserID: String?) async -> [String: Any] {
        guard let coins = coinAmounts[transaction.productID] else {
            await transaction.finish()
            return ["status": "ignored", "productID": transaction.productID]
        }

        let payload: [String: Any] = [
            "status": "success",
            "productID": transaction.productID,
            "transactionID": String(transaction.id),
            "coinAmount": coins,
            "userID": fallbackUserID ?? ""
        ]
        notifyListeners("purchaseResult", data: payload, retainUntilConsumed: true)
        await transaction.finish()
        return payload
    }

    private func savePurchasingUser(_ userID: String, for productID: String) {
        var users = UserDefaults.standard.dictionary(forKey: purchaseUsersKey) as? [String: String] ?? [:]
        users[productID] = userID
        UserDefaults.standard.set(users, forKey: purchaseUsersKey)
    }

    private func purchasingUser(for productID: String) -> String? {
        let users = UserDefaults.standard.dictionary(forKey: purchaseUsersKey) as? [String: String]
        return users?[productID]
    }
}

@objc(PaliroMediaPickerPlugin)
final class PaliroMediaPickerPlugin: CAPPlugin, CAPBridgedPlugin, PHPickerViewControllerDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let identifier = "PaliroMediaPickerPlugin"
    let jsName = "PaliroMediaPicker"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "pick", returnType: CAPPluginReturnPromise)]
    private var pendingCall: CAPPluginCall?
    private var pendingMediaType = "image"

    @objc func pick(_ call: CAPPluginCall) {
        guard pendingCall == nil else { call.reject("A media picker is already open."); return }
        pendingCall = call
        let source = call.getString("source") ?? "library"
        pendingMediaType = call.getString("mediaType") == "video" ? "video" : "image"
        DispatchQueue.main.async { [weak self] in
            source == "camera" ? self?.openCamera() : self?.openLibrary()
        }
    }

    private func openLibrary() {
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { [weak self] status in
            DispatchQueue.main.async {
                guard status == .authorized || status == .limited else { self?.finish(error: "Photo library access was not granted."); return }
                var configuration = PHPickerConfiguration(photoLibrary: .shared())
                configuration.filter = self?.pendingMediaType == "video" ? .videos : .images
                configuration.selectionLimit = 1
                let picker = PHPickerViewController(configuration: configuration)
                picker.delegate = self
                self?.bridge?.viewController?.present(picker, animated: true)
            }
        }
    }

    private func openCamera() {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else { finish(error: "Camera is unavailable on this device."); return }
        AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
            DispatchQueue.main.async {
                guard granted else { self?.finish(error: "Camera access was not granted."); return }
                let picker = UIImagePickerController()
                picker.sourceType = .camera
                picker.mediaTypes = [self?.pendingMediaType == "video" ? UTType.movie.identifier : UTType.image.identifier]
                if self?.pendingMediaType == "video" { picker.cameraCaptureMode = .video }
                picker.delegate = self
                self?.bridge?.viewController?.present(picker, animated: true)
            }
        }
    }

    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        guard let provider = results.first?.itemProvider else { finish(); return }
        if pendingMediaType == "video" {
            guard provider.hasItemConformingToTypeIdentifier(UTType.movie.identifier) else { finish(); return }
            provider.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { [weak self] url, error in
                guard let self, let url, error == nil else { self?.finish(error: "The selected video could not be opened."); return }
                self.finish(videoURL: self.persistVideo(from: url))
            }
            return
        }
        guard provider.canLoadObject(ofClass: UIImage.self) else { finish(); return }
        provider.loadObject(ofClass: UIImage.self) { [weak self] image, _ in
            self?.finish(image: image as? UIImage)
        }
    }

    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
        picker.dismiss(animated: true)
        if pendingMediaType == "video" {
            finish(videoURL: (info[.mediaURL] as? URL).flatMap { persistVideo(from: $0) })
            return
        }
        finish(image: info[.originalImage] as? UIImage)
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { picker.dismiss(animated: true); finish() }

    private func finish(image: UIImage? = nil, videoURL: URL? = nil, error: String? = nil) {
        DispatchQueue.main.async { [weak self] in
            guard let self, let call = self.pendingCall else { return }
            self.pendingCall = nil
            if let error { call.reject(error); return }
            if let videoURL { call.resolve(["fileUri": videoURL.absoluteString]); return }
            guard let image, let data = self.scaledImage(image).jpegData(compressionQuality: 0.78) else { call.resolve(["cancelled": true]); return }
            call.resolve(["dataUrl": "data:image/jpeg;base64,\(data.base64EncodedString())"])
        }
    }

    private func persistVideo(from sourceURL: URL) -> URL? {
        do {
            let directory = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                .appendingPathComponent("PaliroVideos", isDirectory: true)
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let fileExtension = sourceURL.pathExtension.isEmpty ? "mp4" : sourceURL.pathExtension
            let destination = directory.appendingPathComponent("paliro-video-\(UUID().uuidString).\(fileExtension)")
            try FileManager.default.copyItem(at: sourceURL, to: destination)
            return destination
        } catch {
            return nil
        }
    }

    private func scaledImage(_ image: UIImage) -> UIImage {
        let maximum: CGFloat = 1280
        let scale = min(1, maximum / max(image.size.width, image.size.height))
        guard scale < 1 else { return image }
        let size = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        return UIGraphicsImageRenderer(size: size).image { _ in image.draw(in: CGRect(origin: .zero, size: size)) }
    }
}

@objc(PaliroVoiceRecorderPlugin)
final class PaliroVoiceRecorderPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "PaliroVoiceRecorderPlugin"
    let jsName = "PaliroVoiceRecorder"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pause", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "resume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]

    private var recorder: AVAudioRecorder?
    private var recordingURL: URL?
    private var recordingStartedAt: Date?
    private var pauseStartedAt: Date?
    private var pausedDuration: TimeInterval = 0

    @objc func start(_ call: CAPPluginCall) {
        guard recorder == nil else { call.reject("A voice recording is already active."); return }
        let session = AVAudioSession.sharedInstance()
        let beginRecording: () -> Void = { [weak self] in self?.beginRecording(call) }
        switch session.recordPermission {
        case .granted:
            DispatchQueue.main.async(execute: beginRecording)
        case .undetermined:
            session.requestRecordPermission { granted in
                DispatchQueue.main.async {
                    granted ? beginRecording() : call.reject("Microphone access was not granted.")
                }
            }
        default:
            call.reject("Microphone access was not granted.")
        }
    }

    private func beginRecording(_ call: CAPPluginCall) {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .spokenAudio, options: [.defaultToSpeaker, .allowBluetoothHFP])
            try session.setActive(true)
            let directory = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                .appendingPathComponent("PaliroVoiceMessages", isDirectory: true)
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let url = directory.appendingPathComponent("paliro-voice-\(UUID().uuidString).m4a")
            let settings: [String: Any] = [
                AVFormatIDKey: kAudioFormatMPEG4AAC,
                AVSampleRateKey: 44_100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            let recorder = try AVAudioRecorder(url: url, settings: settings)
            guard recorder.record() else { throw NSError(domain: "PaliroVoiceRecorder", code: 1) }
            self.recorder = recorder
            recordingURL = url
            recordingStartedAt = Date()
            pauseStartedAt = nil
            pausedDuration = 0
            call.resolve(["recording": true])
        } catch {
            resetRecorder(removeFile: true)
            call.reject("Unable to begin the voice recording.", nil, error)
        }
    }

    @objc func pause(_ call: CAPPluginCall) {
        guard let recorder, recorder.isRecording else { call.reject("No active voice recording."); return }
        recorder.pause()
        pauseStartedAt = Date()
        call.resolve(["paused": true])
    }

    @objc func resume(_ call: CAPPluginCall) {
        guard let recorder, !recorder.isRecording, recordingURL != nil else { call.reject("No paused voice recording."); return }
        if let pauseStartedAt { pausedDuration += Date().timeIntervalSince(pauseStartedAt) }
        self.pauseStartedAt = nil
        guard recorder.record() else { call.reject("Unable to resume the voice recording."); return }
        call.resolve(["recording": true])
    }

    @objc func stop(_ call: CAPPluginCall) {
        guard let recorder, let url = recordingURL else { call.reject("No active voice recording."); return }
        let duration = recordingDuration()
        recorder.stop()
        resetRecorder(removeFile: false)
        call.resolve(["fileUri": url.absoluteString, "durationSeconds": duration])
    }

    @objc func cancel(_ call: CAPPluginCall) {
        recorder?.stop()
        resetRecorder(removeFile: true)
        call.resolve(["cancelled": true])
    }

    private func recordingDuration() -> TimeInterval {
        guard let recordingStartedAt else { return 0 }
        let currentPause = pauseStartedAt.map { Date().timeIntervalSince($0) } ?? 0
        return max(0, Date().timeIntervalSince(recordingStartedAt) - pausedDuration - currentPause)
    }

    private func resetRecorder(removeFile: Bool) {
        let url = recordingURL
        recorder = nil
        recordingURL = nil
        recordingStartedAt = nil
        pauseStartedAt = nil
        pausedDuration = 0
        if removeFile, let url { try? FileManager.default.removeItem(at: url) }
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
