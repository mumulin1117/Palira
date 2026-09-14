import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.backgroundColor = UIColor(red: 5 / 255, green: 11 / 255, blue: 33 / 255, alpha: 1)
        window.rootViewController = PaliroBridgeViewController(nibName: nil, bundle: nil)
        self.window = window
        window.makeKeyAndVisible()
        return true
    }
}
