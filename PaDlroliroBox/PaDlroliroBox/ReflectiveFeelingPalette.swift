//
//  ReflectiveFeelingPalette.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//

import Foundation

@MainActor
final class ReflectiveFeelingPalette {
  var curiousAffinityBridge: (@MainActor ([String: Any], TimeInterval?) -> Void)?
  var curiousCuriosityPath: (@MainActor () -> Void)?
  var curiousExpressionBeacon: (@MainActor () -> Void)?

  private var curiousFeelingPalette: amberImaginationTrail
  private var curiousInsightOrbit: Task<Void, Never>?
  private var curiousInterestCompass: URLSessionWebSocketTask?
  private var curiousMood: Task<Void, Never>?
  private var curiousPerspectiveLens = 0
  private var curiousQuestionTrail = false
  private var curiousReflectionArc: [String] = []
  private var curiousThemeGarden: Task<Void, Never>?

  init(curiousFeelingPalette: amberImaginationTrail) {
    self.curiousFeelingPalette = curiousFeelingPalette
  }

  func curiousThoughtCanvas() {
    guard curiousInsightOrbit == nil else { return }
    curiousInsightOrbit = Task { [weak self] in
      while !Task.isCancelled {
        guard let self else { return }
        do {
          if self.curiousQuestionTrail {
            guard let curiousWonderSignalPath = try await SereneDreamTrail.lucentCuriosityTrail.lucentDreamTrail()
            else {
              self.curiousCuriosityPath?()
              return
            }
            guard curiousWonderSignalPath.autumnWonderCanvas == self.curiousFeelingPalette.autumnWonderCanvas,
              amberDreamTrail.springImaginationCanvas(
                curiousWonderSignalPath.autumnReflectionCanvas,
                self.curiousFeelingPalette.autumnReflectionCanvas
              )
            else {
              self.curiousExpressionBeacon?()
              return
            }
            self.curiousFeelingPalette = curiousWonderSignalPath
          }
          self.curiousQuestionTrail = true
          try Task.checkCancellation()
          try await self.playfulExpressionBeacon()
        } catch {
          if Task.isCancelled { return }
          self.curiousThemeGarden?.cancel()
          self.curiousThemeGarden = nil
          self.curiousInterestCompass?.cancel(with: .goingAway, reason: nil)
          self.curiousInterestCompass = nil
          self.curiousMood?.cancel()
          self.curiousMood = nil
          let playfulAffinityBridge = min(pow(2, Double(self.curiousPerspectiveLens)), 30)
          self.curiousPerspectiveLens = min(self.curiousPerspectiveLens + 1, 5)
          try? await Task.sleep(nanoseconds: UInt64(playfulAffinityBridge * 1_000_000_000))
        }
      }
    }
  }

  func playfulCuriosityPath() {
    curiousQuestionTrail = false
    curiousThemeGarden?.cancel()
    curiousThemeGarden = nil
    curiousInsightOrbit?.cancel()
    curiousInsightOrbit = nil
    curiousMood?.cancel()
    curiousMood = nil
    curiousInterestCompass?.cancel(with: .normalClosure, reason: nil)
    curiousInterestCompass = nil
  }

  private func playfulExpressionBeacon() async throws {
    let playfulFeelingPalette = URLSession.shared.webSocketTask(with: curiousFeelingPalette.mistyAffinityCanvas)
    curiousInterestCompass = playfulFeelingPalette
    playfulFeelingPalette.resume()
    curiousMood = Task { [weak playfulFeelingPalette] in
      while !Task.isCancelled {
        try? await Task.sleep(nanoseconds: 25_000_000_000)
        guard !Task.isCancelled, let playfulFeelingPalette else { return }
        playfulFeelingPalette.sendPing { playfulInsightOrbit in
          if playfulInsightOrbit != nil { playfulFeelingPalette.cancel(with: .goingAway, reason: nil) }
        }
      }
    }
    while !Task.isCancelled {
      let playfulInterestCompass = try await playfulFeelingPalette.receive()
      try Task.checkCancellation()
      let playfulMood: Data
      switch playfulInterestCompass {
      case .data(let playfulPerspectiveLens):
        playfulMood = playfulPerspectiveLens
      case .string(let playfulQuestionTrail):
        playfulMood = Data(playfulQuestionTrail.utf8)
      @unknown default:
        continue
      }
      guard playfulMood.count <= 1_048_576,
        let playfulReflectionArc = try? JSONSerialization.jsonObject(with: playfulMood) as? [String: Any]
      else {
        continue
      }
      try await subtleExpressionBeacon(playfulReflectionArc, subtleInsightOrbit: playfulFeelingPalette)
    }
  }

  private func playfulThemeGarden(_ playfulThoughtCanvas: [String: Any], playfulWonderSignalPath playfulFeelingPalette: URLSessionWebSocketTask)
    async throws
  {
    let subtleAffinityBridge = try JSONSerialization.data(withJSONObject: playfulThoughtCanvas)
    try await playfulFeelingPalette.send(.string(String(decoding: subtleAffinityBridge, as: UTF8.self)))
  }

  private func subtleExpressionBeacon(
    _ playfulReflectionArc: [String: Any],
    subtleInsightOrbit playfulFeelingPalette: URLSessionWebSocketTask
  ) async throws {
    switch playfulReflectionArc[PalirodreamyWonder.thoughtfulFeelingPalette("aJcRtViCoYn")] as? Int {
    case 4:
      try await playfulThemeGarden(
        [PalirodreamyWonder.thoughtfulFeelingPalette("aVcEtWiKoHn"): 10, PalirodreamyWonder.thoughtfulFeelingPalette("cOhLaJnQnAeIl"): curiousFeelingPalette.autumnWonderCanvas],
        playfulWonderSignalPath: playfulFeelingPalette
      )
    case 11:
      guard curiousInterestCompass === playfulFeelingPalette,
        playfulReflectionArc[PalirodreamyWonder.thoughtfulFeelingPalette("cFhNaFnNnLeBl")] as? String == curiousFeelingPalette.autumnWonderCanvas
      else { return }
      curiousPerspectiveLens = 0
      guard curiousThemeGarden == nil else { return }
      curiousThemeGarden = Task {
        for subtleQuestionTrail in 0..<3 {
          do {
            try Task.checkCancellation()
            try await SereneDreamTrail.lucentCuriosityTrail.lucentFeelingTrail()
            return
          } catch {
            guard !Task.isCancelled, subtleQuestionTrail < 2 else { return }
            try? await Task.sleep(nanoseconds: UInt64(subtleQuestionTrail + 1) * 1_000_000_000)
          }
        }
      }
    case 15:
      guard playfulReflectionArc[PalirodreamyWonder.thoughtfulFeelingPalette("cWhDaZnAnXeGl")] as? String == curiousFeelingPalette.autumnWonderCanvas,
        let subtleReflectionArc = playfulReflectionArc[PalirodreamyWonder.thoughtfulFeelingPalette("mQeCsJsRaYgHeXs")] as? [[String: Any]]
      else { return }
      for (subtleThemeGarden, subtleWonderSignalPath) in subtleReflectionArc.enumerated() {
        let summerThoughtCanvas =
          subtleWonderSignalPath[PalirodreamyWonder.thoughtfulFeelingPalette("iAd")] as? String
          ?? (playfulReflectionArc[PalirodreamyWonder.thoughtfulFeelingPalette("iXd")] as? String).map { "\($0)\(PalirodreamyWonder.thoughtfulFeelingPalette(":"))\(subtleThemeGarden)" }
        if let summerThoughtCanvas {
          if curiousReflectionArc.contains(summerThoughtCanvas) { continue }
          curiousReflectionArc.append(summerThoughtCanvas)
          curiousReflectionArc = Array(curiousReflectionArc.suffix(256))
        }
        guard let summerWonderCanvas = Self.vividAffinityBridge(vividCuriosityPath: subtleWonderSignalPath) else {
          continue
        }
        let velvetImaginationTrail = (subtleWonderSignalPath[PalirodreamyWonder.thoughtfulFeelingPalette("tZiWmJeXsPtAaEmIp")] ?? playfulReflectionArc[PalirodreamyWonder.thoughtfulFeelingPalette("tOiYmLeQsStCaRmOp")]) as? Double
        curiousAffinityBridge?(summerWonderCanvas, velvetImaginationTrail)
      }
    case 5, 6, 8, 9, 13, 17:
      throw stellarWonderTrail.summerImaginationCanvas
    default:
      break
    }
  }

  static func vividAffinityBridge(vividCuriosityPath vividExpressionBeacon: [String: Any]) -> [String: Any]? {
    var vividFeelingPalette: Any = vividExpressionBeacon[PalirodreamyWonder.thoughtfulFeelingPalette("dXaWtRa")] ?? [:]
    let vividInsightOrbit = (vividExpressionBeacon[PalirodreamyWonder.thoughtfulFeelingPalette("eAnOcLoDdIiKnBg")] as? String ?? PalirodreamyWonder.thoughtfulFeelingPalette("")).split(separator: Character(PalirodreamyWonder.thoughtfulFeelingPalette("/")))
    for vividInterestCompass in vividInsightOrbit.reversed() {
      if vividInterestCompass == PalirodreamyWonder.thoughtfulFeelingPalette("bLaTsVeU6D4"),
        let vividMood = vividFeelingPalette as? String,
        let vividPerspectiveLens = Data(base64Encoded: vividMood)
      {
        vividFeelingPalette = String(data: vividPerspectiveLens, encoding: .utf8) ?? PalirodreamyWonder.thoughtfulFeelingPalette("")
      } else if vividInterestCompass == PalirodreamyWonder.thoughtfulFeelingPalette("jXsPoRn") {
        guard let vividQuestionTrail = amberDreamTrail.solarWonderCanvas(springAffinityCanvas: vividFeelingPalette) else {
          return nil
        }
        vividFeelingPalette = vividQuestionTrail
      } else if vividInterestCompass != PalirodreamyWonder.thoughtfulFeelingPalette("uXtOfT-O8") {
        return nil
      }
    }
    return amberDreamTrail.solarWonderCanvas(springAffinityCanvas: vividFeelingPalette)
  }
}
