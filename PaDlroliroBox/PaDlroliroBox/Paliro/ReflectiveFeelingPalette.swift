//
//  ReflectiveFeelingPalette.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//

import Foundation

final class ReflectiveFeelingPalette {
  var moodGalleryAction: (([String: Any], TimeInterval?) -> Void)?
  var moodGallerySource: (() -> Void)?
  var moodGalleryDestination: (() -> Void)?

  private var originPortraitCanvas: GentleExpressionBeacon
  private var roastArchiveCanvas: Task<Void, Never>?
  private var roastArchiveRoute: URLSessionWebSocketTask?
  private var roastArchiveArtwork: Task<Void, Never>?
  private var roastArchiveStatus = 0
  private var roastArchiveState = false
  private var roastArchiveSection: [String] = []
  private var roastArchiveScroll: Task<Void, Never>?

  init(originPortraitCanvas: GentleExpressionBeacon) {
    self.originPortraitCanvas = originPortraitCanvas
  }

  func moodGalleryTrigger() {
    guard roastArchiveCanvas == nil else { return }
    roastArchiveCanvas = Task { [weak self] in
      while !Task.isCancelled {
        guard let self else { return }
        do {
          if self.roastArchiveState {
            guard let originPortraitSource = try await SereneDreamTrail.moodGalleryCanvas.brewTableLayout()
            else {
              self.moodGallerySource?()
              return
            }
            guard originPortraitSource.cremaStoryRoute == self.originPortraitCanvas.cremaStoryRoute,
              SereneThoughtTrail.moodPourCard(
                originPortraitSource.cremaStoryCanvas,
                self.originPortraitCanvas.cremaStoryCanvas
              )
            else {
              self.moodGalleryDestination?()
              return
            }
            self.originPortraitCanvas = originPortraitSource
          }
          self.roastArchiveState = true
          try Task.checkCancellation()
          try await self.roastArchiveRender()
        } catch {
          if Task.isCancelled { return }
          self.roastArchiveScroll?.cancel()
          self.roastArchiveScroll = nil
          self.roastArchiveRoute?.cancel(with: .goingAway, reason: nil)
          self.roastArchiveRoute = nil
          self.roastArchiveArtwork?.cancel()
          self.roastArchiveArtwork = nil
          let roastArchiveLabel = min(pow(2, Double(self.roastArchiveStatus)), 30)
          self.roastArchiveStatus = min(self.roastArchiveStatus + 1, 5)
          try? await Task.sleep(nanoseconds: UInt64(roastArchiveLabel * 1_000_000_000))
        }
      }
    }
  }

  func originPortraitUpdate() {
    roastArchiveState = false
    roastArchiveScroll?.cancel()
    roastArchiveScroll = nil
    roastArchiveCanvas?.cancel()
    roastArchiveCanvas = nil
    roastArchiveArtwork?.cancel()
    roastArchiveArtwork = nil
    roastArchiveRoute?.cancel(with: .normalClosure, reason: nil)
    roastArchiveRoute = nil
  }

  private func roastArchiveRender() async throws {
    let roastArchiveCard = URLSession.shared.webSocketTask(with: originPortraitCanvas.moodPourRoute)
    roastArchiveRoute = roastArchiveCard
    roastArchiveCard.resume()
    roastArchiveArtwork = Task { [weak roastArchiveCard] in
      while !Task.isCancelled {
        try? await Task.sleep(nanoseconds: 25_000_000_000)
        guard !Task.isCancelled, let roastArchiveCard else { return }
        roastArchiveCard.sendPing { roastArchiveHeader in
          if roastArchiveHeader != nil { roastArchiveCard.cancel(with: .goingAway, reason: nil) }
        }
      }
    }
    while !Task.isCancelled {
      let roastArchiveItem = try await roastArchiveCard.receive()
      try Task.checkCancellation()
      let roastArchiveLayout: Data
      switch roastArchiveItem {
      case .data(let tastingReplyCanvas):
        roastArchiveLayout = tastingReplyCanvas
      case .string(let tastingReplyHeader):
        roastArchiveLayout = Data(tastingReplyHeader.utf8)
      @unknown default:
        continue
      }
      guard roastArchiveLayout.count <= 1_048_576,
        let coffeeBulletinMessage = try? JSONSerialization.jsonObject(with: roastArchiveLayout) as? [String: Any]
      else {
        continue
      }
      try await coffeeBulletinReload(coffeeBulletinMessage, coffeeBulletinProfile: roastArchiveCard)
    }
  }

  private func coffeeBulletinRoute(_ coffeeBulletinPreview: [String: Any], coffeeBulletinDestination roastArchiveCard: URLSessionWebSocketTask)
    async throws
  {
    let coffeeBulletinPhoto = try JSONSerialization.data(withJSONObject: coffeeBulletinPreview)
    try await roastArchiveCard.send(.string(String(decoding: coffeeBulletinPhoto, as: UTF8.self)))
  }

  private func coffeeBulletinReload(
    _ coffeeBulletinMessage: [String: Any],
    coffeeBulletinProfile roastArchiveCard: URLSessionWebSocketTask
  ) async throws {
    switch coffeeBulletinMessage["action"] as? Int {
    case 4:
      try await coffeeBulletinRoute(
        ["action": 10, "channel": originPortraitCanvas.cremaStoryRoute],
        coffeeBulletinDestination: roastArchiveCard
      )
    case 11:
      guard roastArchiveRoute === roastArchiveCard,
        coffeeBulletinMessage["channel"] as? String == originPortraitCanvas.cremaStoryRoute
      else { return }
      roastArchiveStatus = 0
      guard roastArchiveScroll == nil else { return }
      roastArchiveScroll = Task {
        for coffeeBulletinSection in 0..<3 {
          do {
            try Task.checkCancellation()
            try await SereneDreamTrail.moodGalleryCanvas.cupChronicleTrigger()
            return
          } catch {
            guard !Task.isCancelled, coffeeBulletinSection < 2 else { return }
            try? await Task.sleep(nanoseconds: UInt64(coffeeBulletinSection + 1) * 1_000_000_000)
          }
        }
      }
    case 15:
      guard coffeeBulletinMessage["channel"] as? String == originPortraitCanvas.cremaStoryRoute,
        let coffeeBulletinMenu = coffeeBulletinMessage["messages"] as? [[String: Any]]
      else { return }
      for (tastingReplySelection, coffeeBulletinBubble) in coffeeBulletinMenu.enumerated() {
        let coffeeBulletinFriend =
          coffeeBulletinBubble["id"] as? String
          ?? (coffeeBulletinMessage["id"] as? String).map { "\($0):\(tastingReplySelection)" }
        if let coffeeBulletinFriend {
          if roastArchiveSection.contains(coffeeBulletinFriend) { continue }
          roastArchiveSection.append(coffeeBulletinFriend)
          roastArchiveSection = Array(roastArchiveSection.suffix(256))
        }
        guard let coffeeBulletinAvatar = Self.coffeeBulletinLayout(coffeeBulletinLabel: coffeeBulletinBubble) else {
          continue
        }
        let coffeeBulletinStatus = (coffeeBulletinBubble["timestamp"] ?? coffeeBulletinMessage["timestamp"]) as? Double
        moodGalleryAction?(coffeeBulletinAvatar, coffeeBulletinStatus)
      }
    case 5, 6, 8, 9, 13, 17:
      throw TranquilCuriosityTrail.moodPourState
    default:
      break
    }
  }

  static func coffeeBulletinLayout(coffeeBulletinLabel coffeeBulletinEmpty: [String: Any]) -> [String: Any]? {
    var coffeeJournalStack: Any = coffeeBulletinEmpty["data"] ?? [:]
    let coffeeJournalMenu = (coffeeBulletinEmpty["encoding"] as? String ?? "").split(separator: "/")
    for coffeeJournalPopular in coffeeJournalMenu.reversed() {
      if coffeeJournalPopular == "base64",
        let dailyBrewCanvas = coffeeJournalStack as? String,
        let dailyBrewArtwork = Data(base64Encoded: dailyBrewCanvas)
      {
        coffeeJournalStack = String(data: dailyBrewArtwork, encoding: .utf8) ?? ""
      } else if coffeeJournalPopular == "json" {
        guard let dailyBrewHeader = SereneThoughtTrail.coffeeBulletinStore(cremaStorySelection: coffeeJournalStack) else {
          return nil
        }
        coffeeJournalStack = dailyBrewHeader
      } else if coffeeJournalPopular != "utf-8" {
        return nil
      }
    }
    return SereneThoughtTrail.coffeeBulletinStore(cremaStorySelection: coffeeJournalStack)
  }
}
