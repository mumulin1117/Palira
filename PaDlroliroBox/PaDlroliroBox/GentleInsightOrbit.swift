//
//  GentleInsightOrbit.swift
//  PaDlroliroBox
//
//  Created by PaDlroliroBox on 2026/10/23.
//

import UIKit
import WebKit


 class GentleInsightOrbit {
  static let tranquilWonderTrail = GentleInsightOrbit()

  private weak var tranquilFeelingTrail: UIWindow?
  private var tranquilReflectionTrail: (() -> UIViewController)?

  static var tranquilCuriosityTrail: Bool {
    get {
      UserDefaults.standard.object(forKey: amberExpressionTrail.stellarAffinityTrail) as? Bool
        ?? !UserDefaults.standard.bool(
          forKey: amberExpressionTrail.stellarCuriosityTrail
        )
    }
    set { UserDefaults.standard.set(newValue, forKey: amberExpressionTrail.stellarAffinityTrail) }
  }

  func tranquilThoughtTrail(
    tranquilAffinityTrail tranquilFeelingTrail: UIWindow,
    tranquilReflectionTrail: @escaping () -> UIViewController
  ) {
    self.tranquilFeelingTrail = tranquilFeelingTrail
    self.tranquilReflectionTrail = tranquilReflectionTrail
    tranquilDreamTrail()
  }

  private func tranquilDreamTrail(tranquilInspirationTrail: Bool = true) {
    let tranquilExpressionTrail =
      (tranquilFeelingTrail?.rootViewController as? UINavigationController)?.viewControllers
      .compactMap { $0 as? CosmicReflectionArc } ?? []
    for tranquilImaginationTrail in tranquilExpressionTrail {
      tranquilImaginationTrail.gentleExpressionBeacon()
    }
    tranquilFeelingTrail?.rootViewController = CelestialRhythm(
      celestialWonderTrail: tranquilInspirationTrail
    ) { [weak self] celestialCuriosityTrail, celestialThoughtTrail in
      self?.celestialFeelingTrail(
        celestialCuriosityTrail: celestialCuriosityTrail, celestialReflectionTrail: !tranquilInspirationTrail,
        celestialThoughtTrail: celestialThoughtTrail
      )
    }
  }

  private func celestialFeelingTrail(
    celestialCuriosityTrail: amberImaginationTrail?, celestialReflectionTrail: Bool, celestialThoughtTrail: WKWebView?
  ) {
    guard let celestialCuriosityTrail else {
      celestialInspirationTrail()
      return
    }
    if !celestialReflectionTrail && !Self.tranquilCuriosityTrail {
      tranquilDreamTrail(tranquilInspirationTrail: false)
      return
    }
    let celestialAffinityTrail = CosmicReflectionArc(
      luminousThoughtCanvas: celestialCuriosityTrail,
      luminousPerspectiveLens: celestialReflectionTrail,
      reflectiveInterestCompass: celestialThoughtTrail,
      luminousCuriosityPath: { [weak self] in self?.celestialInspirationTrail() },
      luminousFeelingPalette: { [weak self] in self?.tranquilDreamTrail(tranquilInspirationTrail: false) }
    )
    let celestialDreamTrail = UINavigationController(rootViewController: celestialAffinityTrail)
    celestialDreamTrail.setNavigationBarHidden(true, animated: false)
    tranquilFeelingTrail?.rootViewController = celestialDreamTrail
  }

  private func celestialInspirationTrail() {
    guard let celestialExpressionTrail = tranquilReflectionTrail?() else { return }
    tranquilFeelingTrail?.rootViewController = celestialExpressionTrail
  }
}

 class CelestialRhythm: UIViewController {
  private let celestialWonderTrail: Bool
  private let celestialImaginationTrail: (amberImaginationTrail?, WKWebView?) -> Void
  private var mellowWonderTrail: Task<Void, Never>?
  private let mellowCuriosityTrail = VandidFeelingPalette()
  private var mellowThoughtTrail: Bool
  private var mellowFeelingTrail: WKWebView?
  private var mellowReflectionTrail: DispatchWorkItem?

  init(
    celestialWonderTrail: Bool,
    celestialImaginationTrail: @escaping (amberImaginationTrail?, WKWebView?) -> Void
  ) {
    self.celestialWonderTrail = celestialWonderTrail
    mellowThoughtTrail = !celestialWonderTrail
    self.celestialImaginationTrail = celestialImaginationTrail
    super.init(nibName: nil, bundle: nil)
  }

  required init?(coder mellowAffinityTrail: NSCoder) { nil }

  override func viewDidLoad() {
    super.viewDidLoad()
    mellowCuriosityTrail.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(mellowCuriosityTrail)
    NSLayoutConstraint.activate([
      mellowCuriosityTrail.topAnchor.constraint(equalTo: view.topAnchor),
      mellowCuriosityTrail.bottomAnchor.constraint(equalTo: view.bottomAnchor),
      mellowCuriosityTrail.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      mellowCuriosityTrail.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    ])
    mellowCuriosityTrail.stellarInspirationTrail(
      stellarReflectionTrail: mellowThoughtTrail,
      stellarThoughtTrail: !celestialWonderTrail
    )
    mellowCuriosityTrail.sereneImaginationTrail.addTarget(
      self, action: #selector(mellowDreamTrail), for: .touchUpInside)
    if celestialWonderTrail { mellowDreamTrail() }
  }

  deinit {
    mellowWonderTrail?.cancel()
    mellowReflectionTrail?.cancel()
  }

  override func viewDidDisappear(_ mellowExpressionTrail: Bool) {
    super.viewDidDisappear(mellowExpressionTrail)
    celestialThoughtTrail()
  }

  private func celestialThoughtTrail() {
    mellowReflectionTrail?.cancel()
    mellowReflectionTrail = nil
    mellowFeelingTrail = nil
  }

  @objc private func mellowDreamTrail() {
    guard mellowWonderTrail == nil else { return }
    mellowCuriosityTrail.stellarInspirationTrail(
      stellarReflectionTrail: mellowThoughtTrail,
      stellarThoughtTrail: !celestialWonderTrail
    )
    mellowCuriosityTrail.stellarWonderTrail(true)
    mellowWonderTrail = Task { [weak self] in
      guard let self else { return }
      let mellowInspirationTrail = DispatchWorkItem { [weak self] in
        guard let self, self.mellowWonderTrail != nil, self.mellowFeelingTrail == nil else { return }
        self.mellowFeelingTrail = CosmicReflectionArc.gentleWonderSignalPath()
      }
      self.mellowReflectionTrail = mellowInspirationTrail
      DispatchQueue.main.async(execute: mellowInspirationTrail)

      do {
        let mellowImaginationTrail = try await self.etherealWonderTrail()
        try Task.checkCancellation()

        self.etherealCuriosityTrail(etherealThoughtTrail: mellowImaginationTrail)
      } catch {
        self.celestialThoughtTrail()
        if !Task.isCancelled { self.mellowWonderTrail = nil }
      }
    }
  }

  private func etherealWonderTrail() async throws -> amberImaginationTrail? {
    while !Task.isCancelled {
      do {
        return try await SereneDreamTrail.lucentCuriosityTrail.lucentDreamTrail()
      } catch {
        try Task.checkCancellation()
        mellowCuriosityTrail.stellarWonderTrail(true, velvetCuriosityTrail: PalirodreamyWonder.thoughtfulFeelingPalette("ROeTcNoKnXnLeVcLtDiKnDgX…"))
        try await Task.sleep(nanoseconds: 2_000_000_000)
      }
    }
    throw CancellationError()
  }

  private func etherealCuriosityTrail(etherealThoughtTrail mellowImaginationTrail: amberImaginationTrail?) {
    mellowWonderTrail = nil
    mellowThoughtTrail = mellowImaginationTrail != nil
    mellowCuriosityTrail.stellarInspirationTrail(
      stellarReflectionTrail: mellowImaginationTrail != nil,
      stellarThoughtTrail: !celestialWonderTrail
    )
    let mellowInspirationTrail = mellowImaginationTrail == nil ? nil : mellowFeelingTrail
    celestialThoughtTrail()
    celestialImaginationTrail(mellowImaginationTrail, mellowInspirationTrail)
  }
}
