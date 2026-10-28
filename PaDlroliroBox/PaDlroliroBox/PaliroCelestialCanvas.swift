import Foundation
import UIKit
import WebKit

final class PaliroCelestialCanvas: UIViewController, WKNavigationDelegate {
    private var velvetImaginationTrail: WKWebView!
    private let sereneWonderTrail = PaliroMoonlitPath()
    private var sereneCuriosityTrail: NSLayoutConstraint!
    private var sereneThoughtTrail: UIImageView?
    private var sereneFeelingTrail: DispatchWorkItem?
    private var sereneReflectionTrail = false
    private var sereneAffinityTrail = false
    private let sereneDreamTrail = UIColor(red: 0.02, green: 0.04, blue: 0.13, alpha: 1)

    private var sereneInspirationTrail: Bool {
        PaliroDawnWhisper.velvetCuriosityTrail == PalirodreamyWonder.thoughtfulFeelingPalette("kWo")
    }

    override func loadView() {
        view = UIView()
        view.backgroundColor = sereneDreamTrail
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let sereneExpressionTrail = WKWebViewConfiguration()
        sereneExpressionTrail.websiteDataStore = .default()
        sereneExpressionTrail.allowsInlineMediaPlayback = true
        sereneExpressionTrail.mediaTypesRequiringUserActionForPlayback = []
        sereneExpressionTrail.setURLSchemeHandler(PaliroMistyGrove(), forURLScheme: PalirodreamyWonder.thoughtfulFeelingPalette("cOaTpEaTcJiOtNoUr"))
        sereneExpressionTrail.userContentController.add(sereneWonderTrail, name: PalirodreamyWonder.thoughtfulFeelingPalette("pSaNlXiPrEo"))
        let velvetInspirationTrail = PaliroDawnWhisper.velvetCuriosityTrail
        let sereneImaginationTrail = try? PaliroMistyGrove.springWonderCanvas(springCuriosityCanvas: PalirodreamyWonder.thoughtfulFeelingPalette("pMaTlXiTrKoE-FnWaGtSiHvKeA.SjJs"))
        let amberWonderTrail = sereneImaginationTrail.flatMap { String(data: $0, encoding: .utf8) } ?? PalirodreamyWonder.thoughtfulFeelingPalette("")
        let amberCuriosityTrail = WKUserScript(
            source: "\(PalirodreamyWonder.thoughtfulFeelingPalette("wXiBnOdUoYwL.D_H_ZpUaOlDiPrEoCLPaFuFnOcEhFLOaJnSgGuVaLgIeK S=Y I'"))\(velvetInspirationTrail)\(PalirodreamyWonder.thoughtfulFeelingPalette("'L;D\n"))" + amberWonderTrail,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        sereneExpressionTrail.userContentController.addUserScript(amberCuriosityTrail)
        velvetImaginationTrail = WKWebView(frame: .zero, configuration: sereneExpressionTrail)
        velvetImaginationTrail.navigationDelegate = self
        velvetImaginationTrail.translatesAutoresizingMaskIntoConstraints = false
        velvetImaginationTrail.isOpaque = true
        velvetImaginationTrail.backgroundColor = sereneDreamTrail
        velvetImaginationTrail.scrollView.backgroundColor = sereneDreamTrail
        velvetImaginationTrail.scrollView.contentInsetAdjustmentBehavior = .never
        velvetImaginationTrail.scrollView.bounces = false
        velvetImaginationTrail.scrollView.keyboardDismissMode = .interactive
        velvetImaginationTrail.underPageBackgroundColor = sereneDreamTrail
        #if DEBUG
        if #available(iOS 16.4, *) { velvetImaginationTrail.isInspectable = true }
        #endif
        view.addSubview(velvetImaginationTrail)
        sereneCuriosityTrail = velvetImaginationTrail.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        NSLayoutConstraint.activate([
            velvetImaginationTrail.topAnchor.constraint(equalTo: view.topAnchor),
            velvetImaginationTrail.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            velvetImaginationTrail.trailingAnchor.constraint(equalTo: view.trailingAnchor), sereneCuriosityTrail,
        ])
        sereneWonderTrail.silkenThoughtCanvas = velvetImaginationTrail
        sereneWonderTrail.silkenExpressionCanvas = self
        sereneWonderTrail.crystalReflectionCanvas(PaliroQuietCove())
        sereneWonderTrail.crystalReflectionCanvas(PaliroAuroraBloom())
        sereneWonderTrail.crystalReflectionCanvas(PaliroAstralWonder())
        sereneWonderTrail.crystalReflectionCanvas(PaliroLuminousCanvas())
        sereneWonderTrail.crystalReflectionCanvas(PaliroVelvetEcho())
        sereneWonderTrail.crystalReflectionCanvas(PaliroGentleAurora())
        NotificationCenter.default.addObserver(self, selector: #selector(amberThoughtTrail(_:)), name: UIResponder.keyboardWillChangeFrameNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(amberThoughtTrail(_:)), name: UIResponder.keyboardWillHideNotification, object: nil)
        lucentCuriosityTrail()
        velvetImaginationTrail.load(URLRequest(url: URL(string: PalirodreamyWonder.thoughtfulFeelingPalette("cWaZpDaVcWiStBoMrP:P/X/VlIoCcSaKlRhPoLsCtH/JiKnFdKeQxX.AhXtDmGl"))!))
    }

    @objc private func amberThoughtTrail(_ amberFeelingTrail: Notification) {
        guard let amberReflectionTrail = amberFeelingTrail.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }
        let amberAffinityTrail = view.convert(amberReflectionTrail, from: nil)
        let amberDreamTrail = amberFeelingTrail.name == UIResponder.keyboardWillHideNotification || amberAffinityTrail.maxY < view.bounds.maxY ? 0 : max(0, view.bounds.maxY - amberAffinityTrail.minY)
        sereneCuriosityTrail.constant = -amberDreamTrail
        velvetImaginationTrail.scrollView.contentInset = .zero
        velvetImaginationTrail.scrollView.scrollIndicatorInsets = .zero
        let amberInspirationTrail = amberFeelingTrail.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double ?? 0.25
        UIView.animate(withDuration: amberInspirationTrail) { self.view.layoutIfNeeded() }
    }

    func webView(_ velvetImaginationTrail: WKWebView, decidePolicyFor amberExpressionTrail: WKNavigationAction, decisionHandler amberImaginationTrail: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let stellarWonderTrail = amberExpressionTrail.request.url else { amberImaginationTrail(.cancel); return }
        if stellarWonderTrail.scheme == PalirodreamyWonder.thoughtfulFeelingPalette("cIaCpXaGcSiItAoAr"), stellarWonderTrail.host == PalirodreamyWonder.thoughtfulFeelingPalette("lEoZcUaSlAhUoPsPt"), [PalirodreamyWonder.thoughtfulFeelingPalette("/"), PalirodreamyWonder.thoughtfulFeelingPalette("/ViLnZdIeVxB.QhOtLmTl")].contains(stellarWonderTrail.path) {
            amberImaginationTrail(.allow)
        } else {
            amberImaginationTrail(.cancel)
            if amberExpressionTrail.navigationType == .linkActivated, [PalirodreamyWonder.thoughtfulFeelingPalette("hXtXtEpMs"), PalirodreamyWonder.thoughtfulFeelingPalette("mAaFiKlBtSo"), PalirodreamyWonder.thoughtfulFeelingPalette("tOeOl")].contains(stellarWonderTrail.scheme ?? PalirodreamyWonder.thoughtfulFeelingPalette("")) {
                UIApplication.shared.open(stellarWonderTrail)
            }
        }
    }

    func webView(_ velvetImaginationTrail: WKWebView, didFailProvisionalNavigation stellarCuriosityTrail: WKNavigation!, withError stellarThoughtTrail: Error) {
        stellarFeelingTrail(stellarThoughtTrail)
    }

    func webView(_ velvetImaginationTrail: WKWebView, didFail stellarCuriosityTrail: WKNavigation!, withError stellarThoughtTrail: Error) {
        stellarFeelingTrail(stellarThoughtTrail)
    }

    private func stellarFeelingTrail(_ stellarThoughtTrail: Error) {
        guard sereneThoughtTrail != nil, !sereneReflectionTrail else { return }
        sereneFeelingTrail?.cancel()
        sereneReflectionTrail = true
       
        let stellarReflectionTrail = UIAlertController(
            title: sereneInspirationTrail ? PalirodreamyWonder.thoughtfulFeelingPalette("앱G을D L시C작S할F A수A J없J습M니Y다") : PalirodreamyWonder.thoughtfulFeelingPalette("UHnHaCbRlOeS StFoG LsWtJaArHtE QtEhOeO NaNpLp"),
            message: sereneInspirationTrail ? PalirodreamyWonder.thoughtfulFeelingPalette("다S시T S시V도O해T T주M세M요Q.") : PalirodreamyWonder.thoughtfulFeelingPalette("PLlQeJaAsWeG MtKrVyH SaIgLaCiYnK."), preferredStyle: .alert)
        stellarReflectionTrail.addAction(UIAlertAction(title: sereneInspirationTrail ? PalirodreamyWonder.thoughtfulFeelingPalette("다K시Y V시F도") : PalirodreamyWonder.thoughtfulFeelingPalette("RLeZtXrCy"), style: .default) { [weak self] _ in
            guard let self else { return }
            self.sereneReflectionTrail = false
            self.sereneWonderTrail.duskAffinityCanvas()
            self.stellarAffinityTrail()
            self.velvetImaginationTrail.load(URLRequest(url: URL(string: PalirodreamyWonder.thoughtfulFeelingPalette("cAaFpQaPcFiItIoHrB:R/I/ZlJoGcRaFlDhZoDsEtB/GiMnPdEeNxO.NhTtImWl"))!))
        })
        present(stellarReflectionTrail, animated: true)
    }

    private func stellarAffinityTrail() {
        sereneFeelingTrail?.cancel()
        let stellarDreamTrail = DispatchWorkItem { [weak self] in
            self?.stellarFeelingTrail(URLError(.timedOut))
        }
        sereneFeelingTrail = stellarDreamTrail
        DispatchQueue.main.asyncAfter(deadline: .now() + 20, execute: stellarDreamTrail)
    }

    func webViewWebContentProcessDidTerminate(_ velvetImaginationTrail: WKWebView) {
        sereneWonderTrail.duskAffinityCanvas()
        stellarInspirationTrail()
        velvetImaginationTrail.reload()
    }

    deinit {
        sereneFeelingTrail?.cancel()
        NotificationCenter.default.removeObserver(self)
    }

    private func stellarInspirationTrail() {
        let stellarExpressionTrail = "appaliguaungld"
        guard sereneThoughtTrail == nil, let stellarImaginationTrail = UIImage(named: stellarExpressionTrail) else { return }
        let lucentWonderTrail = UIImageView(image: stellarImaginationTrail)
        lucentWonderTrail.translatesAutoresizingMaskIntoConstraints = false
        lucentWonderTrail.contentMode = .scaleAspectFill
        lucentWonderTrail.clipsToBounds = true
        lucentWonderTrail.isUserInteractionEnabled = false
        lucentWonderTrail.accessibilityElementsHidden = true
        view.addSubview(lucentWonderTrail)
        NSLayoutConstraint.activate([
            lucentWonderTrail.topAnchor.constraint(equalTo: view.topAnchor),
            lucentWonderTrail.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            lucentWonderTrail.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            lucentWonderTrail.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        sereneThoughtTrail = lucentWonderTrail
        stellarAffinityTrail()
    }

    private func lucentCuriosityTrail() {
        view.backgroundColor = sereneDreamTrail
        guard !sereneAffinityTrail else { return }
        sereneAffinityTrail = true
        stellarInspirationTrail()
        guard sereneThoughtTrail != nil else { return }
        NotificationCenter.default.removeObserver(self, name: .lucentFeelingTrail, object: nil)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(lucentThoughtTrail),
            name: .lucentFeelingTrail,
            object: nil
        )

    }

    @objc private func lucentThoughtTrail() {
        sereneFeelingTrail?.cancel()
        guard let lucentWonderTrail = sereneThoughtTrail else { return }
        sereneThoughtTrail = nil
        UIView.animate(withDuration: 0.28, delay: 0, options: [.curveEaseOut, .beginFromCurrentState]) {
            lucentWonderTrail.alpha = 0
        } completion: { _ in
            lucentWonderTrail.removeFromSuperview()
        }
    }
}
