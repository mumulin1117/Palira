import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.backgroundColor = UIColor(red: 0.02, green: 0.04, blue: 0.13, alpha: 1)
        window.rootViewController = PaliroBridgeViewController(nibName: nil, bundle: nil)
        self.window = window
        window.makeKeyAndVisible()
        return true
    }
}
