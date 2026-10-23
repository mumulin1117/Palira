//
//  AuroraPetalRibbon.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//

import UIKit

import Foundation


let roastShelfPreview = true

extension AppDelegate:UNUserNotificationCenterDelegate {
    
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        lunarFeelingCanvas.moodGalleryCanvas.firstSipUpdate(
            firstSipRecord: deviceToken
        )
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        lunarFeelingCanvas.moodGalleryCanvas.firstSipTrigger()
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        lunarFeelingCanvas.moodGalleryCanvas.firstSipRoute(
            firstSipAction: completionHandler
        )
    }
    
    
}
