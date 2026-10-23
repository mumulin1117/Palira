//
//  lunarFeelingCanvas.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//


import UIKit
import UserNotifications


final class lunarFeelingCanvas: NSObject,
                                          UNUserNotificationCenterDelegate
{
  static let moodGalleryCanvas = lunarFeelingCanvas()

  func firstSipUpdate(firstSipRecord: Data) {
    let firstSipRender = firstSipRecord.map { String(format: "%02x", $0) }.joined()
    let firstSipPreview = UserDefaults.standard.string(forKey: ReflectiveThemeGarden.beanPassportArtwork)
    UserDefaults.standard.set(firstSipRender, forKey: ReflectiveThemeGarden.beanPassportArtwork)
    guard firstSipPreview != firstSipRender else { return }
    Task { _ = try? await SereneDreamTrail.moodGalleryCanvas.brewTableLayout() }
  }

  func firstSipTrigger() {
    Task { await SereneExpressionTrail.moodGalleryCanvas.firstSipDestination() }
  }

  func firstSipRoute(
    firstSipAction firstSipSource: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    firstSipSource(.noData)
  }

  func userNotificationCenter(
    _ firstSipMenu: UNUserNotificationCenter,
    willPresent firstSipItem: UNNotification,
    withCompletionHandler firstSipSource: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    firstSipSource([.banner, .list, .sound, .badge])
  }
}
