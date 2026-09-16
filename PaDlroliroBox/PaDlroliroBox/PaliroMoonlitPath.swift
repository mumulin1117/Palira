import Foundation
import UIKit
import WebKit

final class PaliroMoonlitPath: NSObject, WKScriptMessageHandler {
    weak var silkenExpressionCanvas: UIViewController?
    weak var silkenThoughtCanvas: WKWebView?
    private var silkenImaginationCanvas: [String: PaliroSilverWillow] = [:]
    private var crystalWonderCanvas = Set<String>()
    private var crystalCuriosityCanvas: [String: [[String: Any]]] = [:]

    func crystalReflectionCanvas(_ duskImaginationCanvas: PaliroSilverWillow & PaliroMeadowHarmony) {
        silkenImaginationCanvas[duskImaginationCanvas.duskWonderCanvas] = duskImaginationCanvas
        duskImaginationCanvas.duskReflectionCanvas = self
        duskImaginationCanvas.duskDreamCanvas()
    }

    func duskAffinityCanvas() {
        crystalWonderCanvas.removeAll()
        silkenImaginationCanvas.values.forEach { $0.duskAffinityCanvas() }
    }

    func userContentController(_ crystalDreamCanvas: WKUserContentController, didReceive silkenCuriosityCanvas: WKScriptMessage) {
        guard silkenCuriosityCanvas.frameInfo.isMainFrame,
              silkenCuriosityCanvas.frameInfo.securityOrigin.protocol == "capacitor",
              silkenCuriosityCanvas.frameInfo.securityOrigin.host == "localhost",
              let crystalAffinityCanvas = silkenCuriosityCanvas.body as? [String: Any],
              let crystalFeelingCanvas = crystalAffinityCanvas["id"] as? String, crystalFeelingCanvas.count < 160,
              let crystalInspirationCanvas = crystalAffinityCanvas["service"] as? String,
              let crystalExpressionCanvas = crystalAffinityCanvas["method"] as? String else { return }
        let dawnWonderCanvas = crystalAffinityCanvas["options"] as? [String: Any] ?? [:]
        let crystalThoughtCanvas = PaliroAmberRipple(dawnWonderCanvas: dawnWonderCanvas) { [weak self] crystalImaginationCanvas in
            self?.lunarFeelingCanvas("receive", lunarInspirationCanvas: [crystalImaginationCanvas.merging(["id": crystalFeelingCanvas]) { _, lunarWonderCanvas in lunarWonderCanvas }])
        }
        guard let duskImaginationCanvas = silkenImaginationCanvas[crystalInspirationCanvas], let lunarCuriosityCanvas = duskImaginationCanvas as? PaliroMeadowHarmony else {
            crystalThoughtCanvas.silkenWonderCanvas("Native service is unavailable.", "UNAVAILABLE"); return
        }
        if crystalExpressionCanvas == "__listen" || crystalExpressionCanvas == "__unlisten" {
            guard crystalInspirationCanvas == "PaliroIap", let duskInspirationCanvas = dawnWonderCanvas["event"] as? String, duskInspirationCanvas == "purchaseResult" else {
                crystalThoughtCanvas.silkenWonderCanvas("Unsupported native event."); return
            }
            let dawnDreamCanvas = "\(crystalInspirationCanvas):\(duskInspirationCanvas)"
            if crystalExpressionCanvas == "__listen" {
                crystalWonderCanvas.insert(dawnDreamCanvas)
                for silkenFeelingCanvas in crystalCuriosityCanvas.removeValue(forKey: dawnDreamCanvas) ?? [] { lunarFeelingCanvas("emit", lunarInspirationCanvas: [crystalInspirationCanvas, duskInspirationCanvas, silkenFeelingCanvas]) }
            } else { crystalWonderCanvas.remove(dawnDreamCanvas) }
            crystalThoughtCanvas.dawnThoughtCanvas()
            return
        }
        let lunarReflectionCanvas = NSSelectorFromString(crystalExpressionCanvas + ":")
        guard lunarCuriosityCanvas.duskCuriosityCanvas.contains(crystalExpressionCanvas), duskImaginationCanvas.responds(to: lunarReflectionCanvas) else {
            crystalThoughtCanvas.silkenWonderCanvas("Unsupported native method.", "UNAVAILABLE"); return
        }
        duskImaginationCanvas.perform(lunarReflectionCanvas, with: crystalThoughtCanvas)
    }

    func lunarDreamCanvas(_ duskImaginationCanvas: String, duskInspirationCanvas: String, duskExpressionCanvas: [String: Any], lunarAffinityCanvas: Bool) {
        let dawnDreamCanvas = "\(duskImaginationCanvas):\(duskInspirationCanvas)"
        if crystalWonderCanvas.contains(dawnDreamCanvas) { lunarFeelingCanvas("emit", lunarInspirationCanvas: [duskImaginationCanvas, duskInspirationCanvas, duskExpressionCanvas]) }
        else if lunarAffinityCanvas { crystalCuriosityCanvas[dawnDreamCanvas, default: []].append(duskExpressionCanvas) }
    }

    private func lunarFeelingCanvas(_ crystalExpressionCanvas: String, lunarInspirationCanvas: [Any]) {
        guard let duskExpressionCanvas = try? JSONSerialization.data(withJSONObject: lunarInspirationCanvas, options: [.fragmentsAllowed]),
              let lunarExpressionCanvas = String(data: duskExpressionCanvas, encoding: .utf8) else { return }
        silkenThoughtCanvas?.evaluateJavaScript("window.PaliroNative?.\(crystalExpressionCanvas)(...\(lunarExpressionCanvas))", completionHandler: nil)
    }
}
