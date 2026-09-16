import Foundation
import StoreKit

@available(iOS 15.0, *)
@objc(PaliroAstralWonder)
final class PaliroAstralWonder: PaliroSilverWillow, PaliroMeadowHarmony {
    let astralThoughtCanvas = "PaliroIapPlugin"
    let duskWonderCanvas = "PaliroIap"
    let duskCuriosityCanvas = ["getProducts", "purchase"]

    private let astralInterestCompass = [
        "bbdiylyghcvmvmts": 100,
        "iyksmadvinojrplp": 200,
        "hkczppvsoegefpcg": 600,
        "frpbjkpqdhvdzali": 1500,
        "rebfnabjzseqvpgz": 3500,
        "povdflzdkrvkiwdq": 9500,
        "jxioxpaoekomsnqs": 20050
    ]
    private let astralCuriosityPath = "paliro.iap.purchaseUsers"
    private var astralFeelingPalette: Task<Void, Never>?

    override func duskDreamCanvas() {
        astralFeelingPalette = Task { [weak self] in
            for await astralInsightOrbit in Transaction.updates {
                await self?.luminousThemeGarden(astralInsightOrbit)
            }
        }
    }

    deinit {
        astralFeelingPalette?.cancel()
    }

    @objc(getProducts:) func astralPerspectiveLens(_ astralAffinityBridge: PaliroAmberRipple) {
        Task {
            let astralQuestionTrail = astralAffinityBridge.dawnFeelingCanvas("productIDs", String.self) ?? Array(astralInterestCompass.keys)
            let astralThemeGarden = astralQuestionTrail.filter { astralInterestCompass[$0] != nil }

            do {
                let astralInsightOrbit = try await Product.products(for: astralThemeGarden)
                let astralExpressionBeacon = astralInsightOrbit.compactMap { astralReflectionArc -> [String: Any]? in
                    guard let astralWonderSignalPath = astralInterestCompass[astralReflectionArc.id] else { return nil }
                    return [
                        "productID": astralReflectionArc.id,
                        "displayPrice": astralReflectionArc.displayPrice,
                        "coins": astralWonderSignalPath
                    ]
                }
                astralAffinityBridge.dawnThoughtCanvas(["products": astralExpressionBeacon])
            } catch {
                astralAffinityBridge.silkenWonderCanvas("Unable to load App Store products.", nil, error)
            }
        }
    }

    @objc(purchase:) func luminousMood(_ luminousThoughtCanvas: PaliroAmberRipple) {
        guard let luminousInterestCompass = luminousThoughtCanvas.dawnReflectionCanvas("productID"), astralInterestCompass[luminousInterestCompass] != nil else {
            luminousThoughtCanvas.silkenWonderCanvas("The selected coin pack is unavailable.")
            return
        }
        guard let luminousCuriosityPath = luminousThoughtCanvas.dawnReflectionCanvas("userID"), !luminousCuriosityPath.isEmpty else {
            luminousThoughtCanvas.silkenWonderCanvas("A signed-in user is required to purchase coins.")
            return
        }

        gentleCuriosityPath(gentleFeelingPalette: luminousCuriosityPath, gentlePerspectiveLens: luminousInterestCompass)
        Task {
            do {
                guard let luminousFeelingPalette = try await Product.products(for: [luminousInterestCompass]).first else {
                    luminousThoughtCanvas.silkenWonderCanvas("This App Store product is not currently available.")
                    return
                }

                switch try await luminousFeelingPalette.purchase() {
                case .success(let luminousPerspectiveLens):
                    switch luminousPerspectiveLens {
                    case .verified(let luminousAffinityBridge):
                        let luminousQuestionTrail = await luminousReflectionArc(luminousAffinityBridge, gentleMood: luminousCuriosityPath)
                        luminousThoughtCanvas.dawnThoughtCanvas(luminousQuestionTrail)
                    case .unverified:
                        luminousThoughtCanvas.silkenWonderCanvas("The App Store could not verify this transaction.")
                    }
                case .pending:
                    luminousThoughtCanvas.dawnThoughtCanvas(["status": "pending", "productID": luminousInterestCompass])
                case .userCancelled:
                    luminousThoughtCanvas.dawnThoughtCanvas(["status": "cancelled", "productID": luminousInterestCompass])
                @unknown default:
                    luminousThoughtCanvas.silkenWonderCanvas("The App Store returned an unsupported purchase result.")
                }
            } catch {
                luminousThoughtCanvas.silkenWonderCanvas("The App Store purchase could not be completed.", nil, error)
            }
        }
    }

    private func luminousThemeGarden(_ luminousInsightOrbit: VerificationResult<Transaction>) async {
        guard case .verified(let luminousExpressionBeacon) = luminousInsightOrbit else { return }
        _ = await luminousReflectionArc(luminousExpressionBeacon, gentleMood: gentleQuestionTrail(gentleThemeGarden: luminousExpressionBeacon.productID))
    }

    private func luminousReflectionArc(_ luminousWonderSignalPath: Transaction, gentleMood: String?) async -> [String: Any] {
        guard let gentleThoughtCanvas = astralInterestCompass[luminousWonderSignalPath.productID] else {
            await luminousWonderSignalPath.finish()
            return ["status": "ignored", "productID": luminousWonderSignalPath.productID]
        }

        let gentleInterestCompass: [String: Any] = [
            "status": "success",
            "productID": luminousWonderSignalPath.productID,
            "transactionID": String(luminousWonderSignalPath.id),
            "coinAmount": gentleThoughtCanvas,
            "userID": gentleMood ?? ""
        ]
        duskFeelingCanvas("purchaseResult", duskExpressionCanvas: gentleInterestCompass, duskThoughtCanvas: true)
        await luminousWonderSignalPath.finish()
        return gentleInterestCompass
    }

    private func gentleCuriosityPath(gentleFeelingPalette: String, gentlePerspectiveLens: String) {
        var gentleAffinityBridge = UserDefaults.standard.dictionary(forKey: astralCuriosityPath) as? [String: String] ?? [:]
        gentleAffinityBridge[gentlePerspectiveLens] = gentleFeelingPalette
        UserDefaults.standard.set(gentleAffinityBridge, forKey: astralCuriosityPath)
    }

    private func gentleQuestionTrail(gentleThemeGarden: String) -> String? {
        let gentleInsightOrbit = UserDefaults.standard.dictionary(forKey: astralCuriosityPath) as? [String: String]
        return gentleInsightOrbit?[gentleThemeGarden]
    }
}
