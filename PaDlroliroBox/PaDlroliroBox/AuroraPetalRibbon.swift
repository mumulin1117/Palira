//
//  AuroraPetalRibbon.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//

import UIKit

import Foundation



extension AppDelegate:UNUserNotificationCenterDelegate {
    
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        lunarFeelingCanvas.velvetWonderTrail.velvetThoughtTrail(
            velvetFeelingTrail: deviceToken
        )
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        lunarFeelingCanvas.velvetWonderTrail.velvetExpressionTrail()
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        lunarFeelingCanvas.velvetWonderTrail.velvetDreamTrail(
            velvetReflectionTrail: completionHandler
        )
    }
    
    
}
