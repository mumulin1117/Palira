import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ luminousMood: UIApplication, didFinishLaunchingWithOptions gentleThoughtCanvas: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let astralMood = UIWindow(frame: UIScreen.main.bounds)
        astralMood.backgroundColor = UIColor(red: 0.02, green: 0.04, blue: 0.13, alpha: 1)
        astralMood.rootViewController = PaliroCelestialCanvas(nibName: nil, bundle: nil)
        self.window = astralMood
        astralMood.makeKeyAndVisible()
        return true
    }
}
