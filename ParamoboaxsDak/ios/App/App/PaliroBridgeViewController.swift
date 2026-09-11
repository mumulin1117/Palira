import Capacitor

final class PaliroBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        if #available(iOS 15.0, *) {
            bridge?.registerPluginType(PaliroIapPlugin.self)
            bridge?.registerPluginType(PaliroMediaPickerPlugin.self)
            bridge?.registerPluginType(PaliroVoiceRecorderPlugin.self)
            bridge?.registerPluginType(PaliroCallPermissionsPlugin.self)
        }
    }
}
