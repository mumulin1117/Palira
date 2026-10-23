//
//  SereneDreamTrail.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//


import Foundation


final class SereneDreamTrail {
  static let moodGalleryCanvas = SereneDreamTrail()



  func brewTableLayout() async throws -> GentleExpressionBeacon? {
    let cupChroniclePreview = try await cupChronicleDestination(
      cupChronicleSection: SereneThoughtTrail.roastShelfHeader,
      cupChronicleLayout: cupChronicleSource()
    )
    return try GentleExpressionBeacon.moodPourDestination(cremaStorySelection: cupChroniclePreview)
  }

  func cupChronicleTrigger() async throws {
    var cupChronicleLayout = cupChronicleSource()
    cupChronicleLayout[SereneThoughtTrail.roastShelfCollection.beanPassportCollection] = 2
    _ = try await cupChronicleDestination(cupChronicleSection: SereneThoughtTrail.roastShelfHeader, cupChronicleLayout: cupChronicleLayout)
  }

  private func cupChronicleSource() -> [String: Any] {
    let cupChronicleMenu = SereneThoughtTrail.roastShelfCollection
    var cupChronicleLayout: [String: Any] = [
        cupChronicleMenu.beanPassportCanvas: ReflectivePerspectiveLens.beanPassportRecord(),
      cupChronicleMenu.beanPassportHeader: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString")
        as? String ?? "1.2",
    ]
    if let cremaStoryLabel = SereneThoughtTrail.coffeeBulletinImage(
      UserDefaults.standard.string(forKey: ReflectiveThemeGarden.beanPassportArtwork)
    ) {
      cupChronicleLayout[cupChronicleMenu.beanPassportArtwork] = cremaStoryLabel
    }
    return cupChronicleLayout
  }

  func cupChronicleUpdate(
    cupChronicleItem: String,
    cupChronicleScroll: String,
    moodGallerySection: String
  ) async throws {
    let cupChronicleMenu = SereneThoughtTrail.roastShelfCollection
    _ = try await cupChronicleDestination(
      cupChronicleSection: SereneThoughtTrail.roastShelfArtwork,
      cupChronicleLayout: [
        cupChronicleMenu.beanPassportStack: cupChronicleItem,
        cupChronicleMenu.beanPassportState: cupChronicleScroll,
        cupChronicleMenu.beanPassportRender: moodGallerySection,
      ],
      cupChronicleSelection: true
    )
  }

  private func cupChronicleDestination(
    cupChronicleSection: String,
    cupChronicleLayout: [String: Any],
    cupChronicleSelection: Bool = false
  ) async throws -> [String: Any] {
    let cupChronicleRoute = SereneThoughtTrail.roastShelfCanvas.appendingPathComponent(cupChronicleSection)
    var cupChronicleRecord = URLRequest(
      url: cupChronicleRoute, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 20)
    cupChronicleRecord.httpMethod = "POST"
    cupChronicleRecord.setValue("application/json", forHTTPHeaderField: "Content-Type")
    cupChronicleRecord.httpBody = try JSONSerialization.data(withJSONObject: cupChronicleLayout)
    let (cupChronicleImage, cupChroniclePreview) = try await URLSession.shared.data(for: cupChronicleRecord)
    try Task.checkCancellation()
    guard let cremaStoryHeader = cupChroniclePreview as? HTTPURLResponse,
      (200..<300).contains(cremaStoryHeader.statusCode),
      let cupChronicleCard = try JSONSerialization.jsonObject(with: cupChronicleImage) as? [String: Any]
    else {
      throw TranquilCuriosityTrail.moodPourState
    }
    if cupChronicleSelection && !cupChronicleCard.isEmpty {
      throw TranquilCuriosityTrail.moodPourPreview
    }
    return cupChronicleCard
  }
}
