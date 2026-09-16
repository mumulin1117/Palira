import Foundation
import StoreKit

@available(iOS 15.0, *)
@objc(PaliroAstralWonder)
final class PaliroAstralWonder: PaliroSilverWillow, PaliroMeadowHarmony {
    let astralThoughtCanvas = PalirodreamyWonder.thoughtfulFeelingPalette("PYaBlOiLrIoJIFaKpQPTlDuDgXiHn")
    let duskWonderCanvas = PalirodreamyWonder.thoughtfulFeelingPalette("PHaBlWiOrVoMIWaWp")
    let duskCuriosityCanvas = [PalirodreamyWonder.thoughtfulFeelingPalette("gJeDtVPRrQoXdPuLcKtHs"), PalirodreamyWonder.thoughtfulFeelingPalette("pDuArScGhWaFsNe")]

    private let astralInterestCompass = [
        PalirodreamyWonder.thoughtfulFeelingPalette("bCbCdAiUyHlLyGgUhQcPvEmAvTmRtFs"): 100,
        PalirodreamyWonder.thoughtfulFeelingPalette("iMyEkPsBmWaKdNvCiSnDoUjKrCpJlMp"): 200,
        PalirodreamyWonder.thoughtfulFeelingPalette("hGkCcBzDpRpMvTsFoHeGgGeZfTpRcLg"): 600,
        PalirodreamyWonder.thoughtfulFeelingPalette("fVrDpYbGjAkVpLqIdMhQvQdQzBaRlHi"): 1500,
        PalirodreamyWonder.thoughtfulFeelingPalette("rAeJbWfEnMaXbZjIzYsHeYqPvIpBgAz"): 3500,
        PalirodreamyWonder.thoughtfulFeelingPalette("pFoLvJdBfNlBzNdEkXrJvDkEiKwGdZq"): 9500,
        PalirodreamyWonder.thoughtfulFeelingPalette("jUxFiHoUxRpAaHoFePkSoPmOsSnFqGs"): 20050
    ]
    private let astralCuriosityPath = PalirodreamyWonder.thoughtfulFeelingPalette("pGaSlViCrLoZ.QiLaApU.VpYuUrUcLhXaEsYeXUNsVeQrDs")
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
            let astralQuestionTrail = astralAffinityBridge.dawnFeelingCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("pGrMoEdYuOcXtEIHDVs"), String.self) ?? Array(astralInterestCompass.keys)
            let astralThemeGarden = astralQuestionTrail.filter { astralInterestCompass[$0] != nil }

            do {
                let astralInsightOrbit = try await Product.products(for: astralThemeGarden)
                let astralExpressionBeacon = astralInsightOrbit.compactMap { astralReflectionArc -> [String: Any]? in
                    guard let astralWonderSignalPath = astralInterestCompass[astralReflectionArc.id] else { return nil }
                    return [
                        PalirodreamyWonder.thoughtfulFeelingPalette("pKrMoUdFuRcGtIITD"): astralReflectionArc.id,
                        PalirodreamyWonder.thoughtfulFeelingPalette("dViKsLpTlWaHyTPWrHiRcEe"): astralReflectionArc.displayPrice,
                        PalirodreamyWonder.thoughtfulFeelingPalette("cAoFiSnJs"): astralWonderSignalPath
                    ]
                }
                astralAffinityBridge.dawnThoughtCanvas([PalirodreamyWonder.thoughtfulFeelingPalette("pNrNoNdVuPcCtSs"): astralExpressionBeacon])
            } catch {
                astralAffinityBridge.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("UBnFaNbAlXeW BtFoB RlBoIaCdX TAJpOpB QSAtYoRrIeE UpJrIoDdOuAcWtLsE."), nil, error)
            }
        }
    }

    @objc(purchase:) func luminousMood(_ luminousThoughtCanvas: PaliroAmberRipple) {
        guard let luminousInterestCompass = luminousThoughtCanvas.dawnReflectionCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("pQrAoFdYuLcItOIHD")), astralInterestCompass[luminousInterestCompass] != nil else {
            luminousThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("TVhZeN ZsYeWlNeCcRtDeOdG VcVoSiGnU DpFaBcKkX KiZsE YuKnMaJvZaFiClYaUbXlGeU."))
            return
        }
        guard let luminousCuriosityPath = luminousThoughtCanvas.dawnReflectionCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("uXsReQrPIXD")), !luminousCuriosityPath.isEmpty else {
            luminousThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("AJ HsAiZgPnIeIdL-QiOnE LuEsEeCrK NiTsJ NrIeCqJuJiUrFeSdA ZtIoX JpDuOrYcKhKaMsJeD BcVoAiDnBsX."))
            return
        }

        gentleCuriosityPath(gentleFeelingPalette: luminousCuriosityPath, gentlePerspectiveLens: luminousInterestCompass)
        Task {
            do {
                guard let luminousFeelingPalette = try await Product.products(for: [luminousInterestCompass]).first else {
                    luminousThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("TShYiYsH GALpXpM SSVtXoXrBeI WpHrIoPdDuZcMtZ GiGsB XnIoStS PcBuOrWrDeQnPtPlFyF YaDvHaTiRlWaFbAlGeR."))
                    return
                }

                switch try await luminousFeelingPalette.purchase() {
                case .success(let luminousPerspectiveLens):
                    switch luminousPerspectiveLens {
                    case .verified(let luminousAffinityBridge):
                        let luminousQuestionTrail = await luminousReflectionArc(luminousAffinityBridge, gentleMood: luminousCuriosityPath)
                        luminousThoughtCanvas.dawnThoughtCanvas(luminousQuestionTrail)
                    case .unverified:
                        luminousThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("TChFeU PADpZpJ DSFtSoOrKeC ScZoLuHlMdR PnKoZtT PvKeSrKiEfYyO MtXhEiHsM DtHrBaUnMsBaLcOtBiToWnR."))
                    }
                case .pending:
                    luminousThoughtCanvas.dawnThoughtCanvas([PalirodreamyWonder.thoughtfulFeelingPalette("sKtLaCtLuRs"): PalirodreamyWonder.thoughtfulFeelingPalette("pKeCnBdYiRnMg"), PalirodreamyWonder.thoughtfulFeelingPalette("pXrMoMdSuScTtNIOD"): luminousInterestCompass])
                case .userCancelled:
                    luminousThoughtCanvas.dawnThoughtCanvas([PalirodreamyWonder.thoughtfulFeelingPalette("sOtYaWtAuFs"): PalirodreamyWonder.thoughtfulFeelingPalette("cLaInWcWeDlAlJeVd"), PalirodreamyWonder.thoughtfulFeelingPalette("pSrNoPdEuKcEtCIFD"): luminousInterestCompass])
                @unknown default:
                    luminousThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("TJhHeN TAJpSpW ESLtOoFrQeQ DrJeNtWuYrRnFeVdZ JaOnV RuYnFsAuGpLpKoLrYtSeCdZ TpWuRrWcKhPaZsEeV RrYeZsYuNlStG."))
                }
            } catch {
                luminousThoughtCanvas.silkenWonderCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("TZhTeY PAWpSpE XSDtSoXrPeQ PpFuLrLcHhKaXsFeR TcJoOuDlFdW TnZoKtM ObVeP FcWoBmWpRlWeUtCeVdS."), nil, error)
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
            return [PalirodreamyWonder.thoughtfulFeelingPalette("sZtIaEtKuLs"): PalirodreamyWonder.thoughtfulFeelingPalette("iVgAnYoErFeCd"), PalirodreamyWonder.thoughtfulFeelingPalette("pZrQoRdEuYcEtKIRD"): luminousWonderSignalPath.productID]
        }

        let gentleInterestCompass: [String: Any] = [
            PalirodreamyWonder.thoughtfulFeelingPalette("sDtYaJtAuTs"): PalirodreamyWonder.thoughtfulFeelingPalette("sMuGcBcWeNsNs"),
            PalirodreamyWonder.thoughtfulFeelingPalette("pYrYoIdLuScZtHILD"): luminousWonderSignalPath.productID,
            PalirodreamyWonder.thoughtfulFeelingPalette("tQrLaAnIsNaZcRtLiEoUnPIZD"): String(luminousWonderSignalPath.id),
            PalirodreamyWonder.thoughtfulFeelingPalette("cVoYiWnNAMmPoXuWnPt"): gentleThoughtCanvas,
            PalirodreamyWonder.thoughtfulFeelingPalette("uOsCeErQIRD"): gentleMood ?? PalirodreamyWonder.thoughtfulFeelingPalette("")
        ]
        duskFeelingCanvas(PalirodreamyWonder.thoughtfulFeelingPalette("pPuErNcLhDaOsQeQRAeGsAuClFt"), duskExpressionCanvas: gentleInterestCompass, duskThoughtCanvas: true)
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
