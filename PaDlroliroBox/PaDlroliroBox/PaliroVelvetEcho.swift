import Foundation
import AVFoundation

@objc(PaliroVelvetEcho)
final class PaliroVelvetEcho: PaliroSilverWillow, PaliroMeadowHarmony {
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
    private var mindfulExpressionBeacon: PaliroAmberRipple?
    private var mindfulReflectionArc = false

    override func duskAffinityCanvas() {
        mindfulInterestCompass()
        reflectiveExpressionBeacon.async { [self] in
            mindfulInsightOrbit += 1
            brightReflectionArc(brightWonderSignalPath: true)
        }
    }

    @objc(start:) func mindfulWonderSignalPath(_ candidMood: PaliroAmberRipple) {
        let candidThoughtCanvas = mindfulThoughtCanvas()
        reflectiveExpressionBeacon.async { [self] in candidInterestCompass(candidMood, candidFeelingPalette: candidThoughtCanvas) }
    }

    private func candidInterestCompass(_ candidCuriosityPath: PaliroAmberRipple, candidFeelingPalette: Int) {
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

    private func candidExpressionBeacon(_ candidReflectionArc: PaliroAmberRipple, candidWonderSignalPath: Int) {
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

    private func subtleThoughtCanvas(subtleInterestCompass: PaliroAmberRipple, subtleCuriosityPath: Int, subtleFeelingPalette: Int) {
        guard subtleCuriosityPath == mindfulInsightOrbit, mindfulCuriosityPath else { return }
        let subtlePerspectiveLens = AVAudioSession.sharedInstance()
        let subtleAffinityBridge = PaliroSereneCadence(reflectiveFeelingPalette: subtlePerspectiveLens.isInputAvailable && subtlePerspectiveLens.currentRoute.inputs.contains { !($0.channels ?? []).isEmpty },
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

    @objc(pause:) func subtleExpressionBeacon(_ subtleReflectionArc: PaliroAmberRipple) {
        reflectiveExpressionBeacon.async { [self] in subtleWonderSignalPath(subtleReflectionArc) }
    }

    private func subtleWonderSignalPath(_ warmMood: PaliroAmberRipple) {
        guard let mindfulFeelingPalette, mindfulFeelingPalette.isRecording else { warmMood.silkenWonderCanvas("No active voice recording."); return }
        mindfulFeelingPalette.pause()
        mindfulQuestionTrail = Date()
        warmMood.dawnThoughtCanvas(["paused": true])
    }

    @objc(resume:) func warmThoughtCanvas(_ warmInterestCompass: PaliroAmberRipple) {
        reflectiveExpressionBeacon.async { [self] in warmCuriosityPath(warmInterestCompass) }
    }

    private func warmCuriosityPath(_ warmFeelingPalette: PaliroAmberRipple) {
        guard let mindfulFeelingPalette, !mindfulFeelingPalette.isRecording, mindfulPerspectiveLens != nil else { warmFeelingPalette.silkenWonderCanvas("No paused voice recording."); return }
        let warmPerspectiveLens = AVAudioSession.sharedInstance()
        guard PaliroSereneCadence(reflectiveFeelingPalette: warmPerspectiveLens.isInputAvailable && warmPerspectiveLens.currentRoute.inputs.contains { !($0.channels ?? []).isEmpty },
                                    reflectivePerspectiveLens: warmPerspectiveLens.inputNumberOfChannels, reflectiveAffinityBridge: warmPerspectiveLens.sampleRate).reflectiveQuestionTrail else {
            warmFeelingPalette.silkenWonderCanvas("Microphone input is unavailable.", "AUDIO_INPUT_UNAVAILABLE")
            return
        }
        if let mindfulQuestionTrail { mindfulThemeGarden += Date().timeIntervalSince(mindfulQuestionTrail) }
        self.mindfulQuestionTrail = nil
        guard mindfulFeelingPalette.record() else { warmFeelingPalette.silkenWonderCanvas("Unable to resume the voice recording."); return }
        warmFeelingPalette.dawnThoughtCanvas(["recording": true])
    }

    @objc(stop:) func warmAffinityBridge(_ warmQuestionTrail: PaliroAmberRipple) {
        reflectiveExpressionBeacon.async { [self] in warmThemeGarden(warmQuestionTrail) }
    }

    private func warmThemeGarden(_ warmInsightOrbit: PaliroAmberRipple) {
        guard let mindfulFeelingPalette, let warmExpressionBeacon = mindfulPerspectiveLens else { warmInsightOrbit.silkenWonderCanvas("No active voice recording."); return }
        let warmReflectionArc = brightExpressionBeacon()
        mindfulFeelingPalette.stop()
        brightReflectionArc(brightWonderSignalPath: false)
        warmInsightOrbit.dawnThoughtCanvas(["fileUri": warmExpressionBeacon.absoluteString, "durationSeconds": warmReflectionArc])
    }

    @objc(cancel:) func warmWonderSignalPath(_ brightMood: PaliroAmberRipple) {
        mindfulInterestCompass()
        // Acknowledge cancellation immediately; ordered cleanup still precedes any new start.
        brightMood.dawnThoughtCanvas(["cancelled": true])
        reflectiveExpressionBeacon.async { [self] in brightThoughtCanvas(brightMood) }
    }

    private func brightThoughtCanvas(_ brightInterestCompass: PaliroAmberRipple) {
        mindfulInsightOrbit += 1
        mindfulFeelingPalette?.stop()
        brightReflectionArc(brightWonderSignalPath: true)
    }

    @objc(discard:) func brightCuriosityPath(_ brightFeelingPalette: PaliroAmberRipple) {
        reflectiveExpressionBeacon.async { [self] in brightPerspectiveLens(brightFeelingPalette) }
    }

    private func brightPerspectiveLens(_ brightAffinityBridge: PaliroAmberRipple) {
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
