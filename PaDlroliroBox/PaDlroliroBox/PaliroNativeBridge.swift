import Foundation
import CryptoKit
import UIKit
import WebKit
import UniformTypeIdentifiers

protocol PaliroNativeMethods {
    var duskWonderCanvas: String { get }
    var duskCuriosityCanvas: [String] { get }
}

class PaliroNativeService: NSObject {
    weak var duskReflectionCanvas: PaliroNativeBridge?
    func duskDreamCanvas() {}
    func duskAffinityCanvas() {}
    func duskFeelingCanvas(_ duskInspirationCanvas: String, duskExpressionCanvas: [String: Any], duskThoughtCanvas: Bool = false) {
        guard let duskImaginationCanvas = self as? PaliroNativeMethods else { return }
        DispatchQueue.main.async { [weak self] in
            self?.duskReflectionCanvas?.lunarDreamCanvas(duskImaginationCanvas.duskWonderCanvas, duskInspirationCanvas: duskInspirationCanvas, duskExpressionCanvas: duskExpressionCanvas, lunarAffinityCanvas: duskThoughtCanvas)
        }
    }
}

final class PaliroNativeCall: NSObject {
    private let dawnWonderCanvas: [String: Any]
    private var dawnCuriosityCanvas: (([String: Any]) -> Void)?
    init(dawnWonderCanvas: [String: Any], dawnCuriosityCanvas: @escaping ([String: Any]) -> Void) {
        self.dawnWonderCanvas = dawnWonderCanvas
        self.dawnCuriosityCanvas = dawnCuriosityCanvas
    }
    func dawnReflectionCanvas(_ dawnDreamCanvas: String) -> String? { dawnWonderCanvas[dawnDreamCanvas] as? String }
    func dawnAffinityCanvas(_ dawnDreamCanvas: String) -> Bool? { dawnWonderCanvas[dawnDreamCanvas] as? Bool }
    func dawnFeelingCanvas<dawnInspirationCanvas>(_ dawnDreamCanvas: String, _ dawnExpressionCanvas: dawnInspirationCanvas.Type) -> [dawnInspirationCanvas]? { dawnWonderCanvas[dawnDreamCanvas] as? [dawnInspirationCanvas] }
    func dawnThoughtCanvas(_ dawnImaginationCanvas: [String: Any] = [:]) { silkenAffinityCanvas(["value": dawnImaginationCanvas]) }
    func silkenWonderCanvas(_ silkenCuriosityCanvas: String, _ silkenReflectionCanvas: String? = nil, _ silkenDreamCanvas: Error? = nil) {
        silkenAffinityCanvas(["error": ["message": silkenCuriosityCanvas, "code": silkenReflectionCanvas ?? "NATIVE_ERROR"]])
    }
    private func silkenAffinityCanvas(_ silkenFeelingCanvas: [String: Any]) {
        DispatchQueue.main.async { [self] in
            let silkenInspirationCanvas = dawnCuriosityCanvas
            dawnCuriosityCanvas = nil
            silkenInspirationCanvas?(silkenFeelingCanvas)
        }
    }
}

final class PaliroNativeBridge: NSObject, WKScriptMessageHandler {
    weak var silkenExpressionCanvas: UIViewController?
    weak var silkenThoughtCanvas: WKWebView?
    private var silkenImaginationCanvas: [String: PaliroNativeService] = [:]
    private var crystalWonderCanvas = Set<String>()
    private var crystalCuriosityCanvas: [String: [[String: Any]]] = [:]

    func crystalReflectionCanvas(_ duskImaginationCanvas: PaliroNativeService & PaliroNativeMethods) {
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
        let crystalThoughtCanvas = PaliroNativeCall(dawnWonderCanvas: dawnWonderCanvas) { [weak self] crystalImaginationCanvas in
            self?.lunarFeelingCanvas("receive", lunarInspirationCanvas: [crystalImaginationCanvas.merging(["id": crystalFeelingCanvas]) { _, lunarWonderCanvas in lunarWonderCanvas }])
        }
        guard let duskImaginationCanvas = silkenImaginationCanvas[crystalInspirationCanvas], let lunarCuriosityCanvas = duskImaginationCanvas as? PaliroNativeMethods else {
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


final class PaliroLocalResources: NSObject, WKURLSchemeHandler {
    private enum lunarThoughtCanvas {
        case lunarImaginationCanvas(Data, String)
        case solarWonderCanvas(URL)
    }

    private struct solarCuriosityCanvas {
        let duskExpressionCanvas: Data
        var solarReflectionCanvas = 0

        mutating func solarDreamCanvas(_ solarAffinityCanvas: Int) throws -> Data {
            guard solarAffinityCanvas >= 0, solarReflectionCanvas >= 0, solarReflectionCanvas <= duskExpressionCanvas.count, solarAffinityCanvas <= duskExpressionCanvas.count - solarReflectionCanvas else {
                throw URLError(.cannotDecodeContentData)
            }
            defer { solarReflectionCanvas += solarAffinityCanvas }
            return duskExpressionCanvas.subdata(in: solarReflectionCanvas..<(solarReflectionCanvas + solarAffinityCanvas))
        }

        mutating func solarFeelingCanvas() throws -> Int {
            let solarInspirationCanvas = try solarDreamCanvas(4)
            return solarInspirationCanvas.reduce(0) { ($0 << 8) | Int($1) }
        }

        mutating func solarExpressionCanvas() throws -> Int {
            let solarInspirationCanvas = try solarDreamCanvas(8)
            let dawnImaginationCanvas = solarInspirationCanvas.reduce(UInt64(0)) { ($0 << 8) | UInt64($1) }
            guard dawnImaginationCanvas <= UInt64(Int.max) else { throw URLError(.cannotDecodeContentData) }
            return Int(dawnImaginationCanvas)
        }
    }

    private static let solarThoughtCanvas = Data("PALIRO3\0".utf8)
    private static let solarImaginationCanvas = Data("PALIROPACK1\0".utf8)
    private static let autumnWonderCanvas = SymmetricKey(data: Data([
        0xc2, 0xf7, 0x13, 0x51, 0x97, 0xde, 0x12, 0x42, 0x0a, 0x3c, 0x49, 0x4c, 0x42, 0x58, 0x88, 0x31,
        0x82, 0x65, 0x66, 0xbe, 0x47, 0x0a, 0xac, 0x89, 0x67, 0x40, 0xb5, 0x8f, 0xf2, 0xdd, 0xf2, 0xec,
    ]))
    private static let autumnCuriosityCanvas = SymmetricKey(data: Data([
        0x3d, 0xf1, 0xae, 0x98, 0xe2, 0x6c, 0x4f, 0xdc, 0x4a, 0xfd, 0xaf, 0x45, 0x49, 0x0c, 0xe4, 0xb5,
        0xb7, 0x31, 0x52, 0xf7, 0x96, 0xc0, 0x76, 0x91, 0xaa, 0x51, 0xec, 0x63, 0x4d, 0x86, 0x25, 0x50,
    ]))
    private static let autumnReflectionCanvas = NSLock()
    private static var autumnDreamCanvas: [String: Data]?
    private static var autumnAffinityCanvas: URL?
    private var autumnFeelingCanvas = Set<ObjectIdentifier>()
    private let autumnInspirationCanvas = DispatchQueue(label: "site.paliro.local-resources", qos: .userInitiated, attributes: .concurrent)

    func webView(_ silkenThoughtCanvas: WKWebView, start autumnExpressionCanvas: WKURLSchemeTask) {
        let crystalFeelingCanvas = ObjectIdentifier(autumnExpressionCanvas)
        autumnFeelingCanvas.insert(crystalFeelingCanvas)
        let autumnThoughtCanvas = autumnExpressionCanvas.request
        autumnInspirationCanvas.async { [weak self] in
            let crystalImaginationCanvas = Result { try Self.autumnImaginationCanvas(autumnThoughtCanvas: autumnThoughtCanvas) }
            DispatchQueue.main.async {
                guard let self, self.autumnFeelingCanvas.remove(crystalFeelingCanvas) != nil else { return }
                switch crystalImaginationCanvas {
                case .success(let (autumnImaginationCanvas, duskExpressionCanvas)):
                    autumnExpressionCanvas.didReceive(autumnImaginationCanvas)
                    autumnExpressionCanvas.didReceive(duskExpressionCanvas)
                    autumnExpressionCanvas.didFinish()
                case .failure(let silkenDreamCanvas):
                    NSLog("Paliro resource load failed: %@ (%@ %ld)", autumnThoughtCanvas.url?.path ?? "", (silkenDreamCanvas as NSError).domain, (silkenDreamCanvas as NSError).code)
                    autumnExpressionCanvas.didFailWithError(silkenDreamCanvas)
                }
            }
        }
    }
    func webView(_ silkenThoughtCanvas: WKWebView, stop autumnExpressionCanvas: WKURLSchemeTask) {
        autumnFeelingCanvas.remove(ObjectIdentifier(autumnExpressionCanvas))
    }

    static func springWonderCanvas(springCuriosityCanvas: String) throws -> Data {
        guard let springReflectionCanvas = Bundle.main.resourceURL?.appendingPathComponent("public") else { throw URLError(.badURL) }
        switch try springDreamCanvas(springCuriosityCanvas: springCuriosityCanvas, springReflectionCanvas: springReflectionCanvas) {
        case .lunarImaginationCanvas(let duskExpressionCanvas, _): return duskExpressionCanvas
        case .solarWonderCanvas(let solarWonderCanvas): return try Data(contentsOf: solarWonderCanvas, options: .mappedIfSafe)
        }
    }

    private static func springDreamCanvas(springCuriosityCanvas: String, springReflectionCanvas: URL) throws -> lunarThoughtCanvas {
        guard !springCuriosityCanvas.isEmpty, !springCuriosityCanvas.hasPrefix("/"), !springCuriosityCanvas.split(separator: "/").contains("..") else {
            throw URLError(.noPermissionsToReadFile)
        }
        let solarWonderCanvas = springReflectionCanvas.appendingPathComponent(springCuriosityCanvas)
       
        if FileManager.default.fileExists(atPath: solarWonderCanvas.path) {
            let springAffinityCanvas = solarWonderCanvas.resolvingSymlinksInPath().standardizedFileURL
            let springFeelingCanvas = springReflectionCanvas.resolvingSymlinksInPath().standardizedFileURL.path + "/"
            guard springAffinityCanvas.path.hasPrefix(springFeelingCanvas) else { throw URLError(.noPermissionsToReadFile) }
            return .solarWonderCanvas(springAffinityCanvas)
        }

        autumnReflectionCanvas.lock()
        defer { autumnReflectionCanvas.unlock() }
        let springInspirationCanvas = try springExpressionCanvas(springReflectionCanvas: springReflectionCanvas)
        if let duskExpressionCanvas = springInspirationCanvas[springCuriosityCanvas] { return .lunarImaginationCanvas(duskExpressionCanvas, springCuriosityCanvas) }
        let springThoughtCanvas = try springImaginationCanvas(springReflectionCanvas: springReflectionCanvas)
        let winterWonderCanvas = springThoughtCanvas.appendingPathComponent(springCuriosityCanvas)
        let winterCuriosityCanvas = winterWonderCanvas.resolvingSymlinksInPath().standardizedFileURL
        guard winterCuriosityCanvas.path.hasPrefix(springThoughtCanvas.resolvingSymlinksInPath().standardizedFileURL.path + "/"),
              FileManager.default.fileExists(atPath: winterCuriosityCanvas.path) else { throw URLError(.fileDoesNotExist) }
        return .solarWonderCanvas(winterCuriosityCanvas)
    }

    private static func springExpressionCanvas(springReflectionCanvas: URL) throws -> [String: Data] {
        if let autumnDreamCanvas { return autumnDreamCanvas }
        let winterReflectionCanvas = springReflectionCanvas.appendingPathComponent("PaliroWebVault/paliro-bootstrap.pwb")
        var winterDreamCanvas: [String: Data] = [:]
        try winterAffinityCanvas(winterFeelingCanvas(winterReflectionCanvas)) { winterInspirationCanvas, duskExpressionCanvas in winterDreamCanvas[winterInspirationCanvas] = duskExpressionCanvas }
        autumnDreamCanvas = winterDreamCanvas
        return winterDreamCanvas
    }

    private static func springImaginationCanvas(springReflectionCanvas: URL) throws -> URL {
        if let autumnAffinityCanvas { return autumnAffinityCanvas }
        let winterExpressionCanvas = FileManager.default
        let winterThoughtCanvas = springReflectionCanvas.appendingPathComponent("PaliroWebVault")
        let winterImaginationCanvas = try winterExpressionCanvas.contentsOfDirectory(atPath: winterThoughtCanvas.path)
            .first { $0.hasPrefix("paliro-assets-") && $0.hasSuffix(".pwb") }
        guard let winterImaginationCanvas else { throw URLError(.fileDoesNotExist) }
        let summerWonderCanvas = String(winterImaginationCanvas.dropFirst("paliro-assets-".count).dropLast(".pwb".count))
        let summerCuriosityCanvas = try winterExpressionCanvas.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let summerReflectionCanvas = summerCuriosityCanvas.appendingPathComponent("PaliroWebCache", isDirectory: true)
        let summerDreamCanvas = summerReflectionCanvas.appendingPathComponent(summerWonderCanvas, isDirectory: true)
        let summerAffinityCanvas = summerDreamCanvas.appendingPathComponent(".ready")
        try winterExpressionCanvas.createDirectory(at: summerReflectionCanvas, withIntermediateDirectories: true)
        var summerFeelingCanvas = URLResourceValues()
        summerFeelingCanvas.isExcludedFromBackup = true
        var summerInspirationCanvas = summerReflectionCanvas
        try? summerInspirationCanvas.setResourceValues(summerFeelingCanvas)
        if winterExpressionCanvas.fileExists(atPath: summerAffinityCanvas.path) {
            autumnAffinityCanvas = summerDreamCanvas
            return summerDreamCanvas
        }

        let summerExpressionCanvas = summerReflectionCanvas.appendingPathComponent(".\(summerWonderCanvas)-\(UUID().uuidString)", isDirectory: true)
        try? winterExpressionCanvas.removeItem(at: summerExpressionCanvas)
        try winterExpressionCanvas.createDirectory(at: summerExpressionCanvas, withIntermediateDirectories: true)
        do {
            let winterReflectionCanvas = winterThoughtCanvas.appendingPathComponent(winterImaginationCanvas)
            try winterAffinityCanvas(winterFeelingCanvas(winterReflectionCanvas)) { winterInspirationCanvas, duskExpressionCanvas in
                let summerThoughtCanvas = summerExpressionCanvas.appendingPathComponent(winterInspirationCanvas)
                let springAffinityCanvas = summerThoughtCanvas.standardizedFileURL
                guard springAffinityCanvas.path.hasPrefix(summerExpressionCanvas.standardizedFileURL.path + "/") else {
                    throw URLError(.noPermissionsToReadFile)
                }
                try winterExpressionCanvas.createDirectory(at: summerThoughtCanvas.deletingLastPathComponent(), withIntermediateDirectories: true)
                try duskExpressionCanvas.write(to: summerThoughtCanvas, options: .atomic)
                try winterExpressionCanvas.setAttributes([.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication], ofItemAtPath: summerThoughtCanvas.path)
            }
            try Data().write(to: summerExpressionCanvas.appendingPathComponent(".ready"), options: .atomic)
            try? winterExpressionCanvas.removeItem(at: summerDreamCanvas)
            try winterExpressionCanvas.moveItem(at: summerExpressionCanvas, to: summerDreamCanvas)
            try summerImaginationCanvas(summerReflectionCanvas: summerReflectionCanvas, summerWonderCanvas: summerWonderCanvas)
            autumnAffinityCanvas = summerDreamCanvas
            return summerDreamCanvas
        } catch let silkenDreamCanvas {
            try? winterExpressionCanvas.removeItem(at: summerExpressionCanvas)
            throw silkenDreamCanvas
        }
    }

    private static func summerImaginationCanvas(summerReflectionCanvas: URL, summerWonderCanvas: String) throws {
        let winterExpressionCanvas = FileManager.default
       
        for mistyWonderCanvas in try winterExpressionCanvas.contentsOfDirectory(at: summerReflectionCanvas, includingPropertiesForKeys: nil)
            where mistyWonderCanvas.lastPathComponent != summerWonderCanvas {
            try? winterExpressionCanvas.removeItem(at: mistyWonderCanvas)
        }
    }

    private static func winterFeelingCanvas(_ mistyCuriosityCanvas: URL) throws -> Data {
        let mistyReflectionCanvas = try Data(contentsOf: mistyCuriosityCanvas, options: .mappedIfSafe)
        guard mistyReflectionCanvas.starts(with: solarThoughtCanvas) else { throw URLError(.cannotDecodeContentData) }
        let mistyDreamCanvas = try AES.GCM.SealedBox(combined: mistyReflectionCanvas.dropFirst(solarThoughtCanvas.count))
        let mistyAffinityCanvas = try AES.GCM.open(mistyDreamCanvas, using: autumnCuriosityCanvas)
        let mistyFeelingCanvas = try AES.GCM.SealedBox(combined: mistyAffinityCanvas)
        let mistyInspirationCanvas = try AES.GCM.open(mistyFeelingCanvas, using: autumnWonderCanvas)
        return try (mistyInspirationCanvas as NSData).decompressed(using: .zlib) as Data
    }

    private static func winterAffinityCanvas(_ winterReflectionCanvas: Data, mistyExpressionCanvas: (String, Data) throws -> Void) throws {
        var mistyThoughtCanvas = solarCuriosityCanvas(duskExpressionCanvas: winterReflectionCanvas)
        guard try mistyThoughtCanvas.solarDreamCanvas(solarImaginationCanvas.count) == solarImaginationCanvas else { throw URLError(.cannotDecodeContentData) }
        let solarAffinityCanvas = try mistyThoughtCanvas.solarFeelingCanvas()
        guard solarAffinityCanvas > 0, solarAffinityCanvas <= 20_000 else { throw URLError(.cannotDecodeContentData) }
        for _ in 0..<solarAffinityCanvas {
            let mistyImaginationCanvas = try mistyThoughtCanvas.solarFeelingCanvas()
            let rosyWonderCanvas = try mistyThoughtCanvas.solarExpressionCanvas()
            guard mistyImaginationCanvas > 0, mistyImaginationCanvas <= 4_096,
                  let winterInspirationCanvas = String(data: try mistyThoughtCanvas.solarDreamCanvas(mistyImaginationCanvas), encoding: .utf8),
                  !winterInspirationCanvas.hasPrefix("/"), !winterInspirationCanvas.split(separator: "/").contains("..") else {
                throw URLError(.cannotDecodeContentData)
            }
            try mistyExpressionCanvas(winterInspirationCanvas, try mistyThoughtCanvas.solarDreamCanvas(rosyWonderCanvas))
        }
        guard mistyThoughtCanvas.solarReflectionCanvas == winterReflectionCanvas.count else { throw URLError(.cannotDecodeContentData) }
    }

    private static func autumnImaginationCanvas(autumnThoughtCanvas: URLRequest) throws -> (URLResponse, Data) {
        guard let mistyCuriosityCanvas = autumnThoughtCanvas.url, mistyCuriosityCanvas.host == "localhost", ["GET", "HEAD"].contains(autumnThoughtCanvas.httpMethod ?? "GET"),
              let springReflectionCanvas = Bundle.main.resourceURL?.appendingPathComponent("public") else { throw URLError(.badURL) }
        let winterInspirationCanvas = mistyCuriosityCanvas.path
        let springDreamCanvas: lunarThoughtCanvas
        if let rosyCuriosityCanvas = ["/_paliro_file_", "/_capacitor_file_"].first(where: { winterInspirationCanvas.hasPrefix($0) }) {
            let solarWonderCanvas = URL(fileURLWithPath: String(winterInspirationCanvas.dropFirst(rosyCuriosityCanvas.count)))
            let summerCuriosityCanvas = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            let rosyReflectionCanvas = [summerCuriosityCanvas.appendingPathComponent("PaliroVideos"), summerCuriosityCanvas.appendingPathComponent("PaliroVoiceMessages")]
            let springAffinityCanvas = solarWonderCanvas.resolvingSymlinksInPath().standardizedFileURL
            guard rosyReflectionCanvas.contains(where: { springAffinityCanvas.path.hasPrefix($0.resolvingSymlinksInPath().standardizedFileURL.path + "/") }) else {
                throw URLError(.noPermissionsToReadFile)
            }
            springDreamCanvas = .solarWonderCanvas(springAffinityCanvas)
        } else {
            let springCuriosityCanvas = winterInspirationCanvas == "/" ? "index.html" : String(winterInspirationCanvas.dropFirst())
            springDreamCanvas = try self.springDreamCanvas(springCuriosityCanvas: springCuriosityCanvas, springReflectionCanvas: springReflectionCanvas)
        }

        let rosyDreamCanvas: Int
        let rosyAffinityCanvas: String
        switch springDreamCanvas {
        case .lunarImaginationCanvas(let duskExpressionCanvas, let winterInspirationCanvas):
            rosyDreamCanvas = duskExpressionCanvas.count
            rosyAffinityCanvas = winterInspirationCanvas
        case .solarWonderCanvas(let solarWonderCanvas):
            rosyDreamCanvas = (try FileManager.default.attributesOfItem(atPath: solarWonderCanvas.path)[.size] as? NSNumber)?.intValue ?? 0
            rosyAffinityCanvas = solarWonderCanvas.path
        }
        var rosyFeelingCanvas = ["Content-Type": UTType(filenameExtension: URL(fileURLWithPath: rosyAffinityCanvas).pathExtension)?.preferredMIMEType ?? "application/octet-stream",
                       "Accept-Ranges": "bytes", "Cache-Control": "no-cache"]
        var rosyInspirationCanvas = 200
        var rosyExpressionCanvas = 0..<rosyDreamCanvas
        if let dawnImaginationCanvas = autumnThoughtCanvas.value(forHTTPHeaderField: "Range") {
            let rosyThoughtCanvas = dawnImaginationCanvas.replacingOccurrences(of: "bytes=", with: "").split(separator: "-", omittingEmptySubsequences: false)
            if dawnImaginationCanvas.hasPrefix("bytes="), rosyThoughtCanvas.count == 2, !dawnImaginationCanvas.contains(",") {
                let rosyImaginationCanvas = rosyThoughtCanvas[0].isEmpty ? max(0, rosyDreamCanvas - (Int(rosyThoughtCanvas[1]) ?? 0)) : (Int(rosyThoughtCanvas[0]) ?? -1)
                let airyWonderCanvas = rosyThoughtCanvas[0].isEmpty || rosyThoughtCanvas[1].isEmpty ? rosyDreamCanvas - 1 : min(Int(rosyThoughtCanvas[1]) ?? -1, rosyDreamCanvas - 1)
                if rosyImaginationCanvas >= 0, airyWonderCanvas >= rosyImaginationCanvas, rosyImaginationCanvas < rosyDreamCanvas { rosyExpressionCanvas = rosyImaginationCanvas..<(airyWonderCanvas + 1); rosyInspirationCanvas = 206 }
                else { rosyInspirationCanvas = 416; rosyExpressionCanvas = 0..<0 }
            } else { rosyInspirationCanvas = 416; rosyExpressionCanvas = 0..<0 }
            rosyFeelingCanvas["Content-Range"] = rosyInspirationCanvas == 206 ? "bytes \(rosyExpressionCanvas.lowerBound)-\(rosyExpressionCanvas.upperBound - 1)/\(rosyDreamCanvas)" : "bytes */\(rosyDreamCanvas)"
        }
        rosyFeelingCanvas["Content-Length"] = String(rosyExpressionCanvas.count)
        guard let autumnImaginationCanvas = HTTPURLResponse(url: mistyCuriosityCanvas, statusCode: rosyInspirationCanvas, httpVersion: "HTTP/1.1", headerFields: rosyFeelingCanvas) else { throw URLError(.badServerResponse) }
        if autumnThoughtCanvas.httpMethod == "HEAD" || rosyExpressionCanvas.isEmpty { return (autumnImaginationCanvas, Data()) }
        switch springDreamCanvas {
        case .lunarImaginationCanvas(let duskExpressionCanvas, _): return (autumnImaginationCanvas, duskExpressionCanvas.subdata(in: rosyExpressionCanvas))
        case .solarWonderCanvas(let solarWonderCanvas):
            let airyCuriosityCanvas = try FileHandle(forReadingFrom: solarWonderCanvas)
            defer { try? airyCuriosityCanvas.close() }
            try airyCuriosityCanvas.seek(toOffset: UInt64(rosyExpressionCanvas.lowerBound))
            return (autumnImaginationCanvas, try airyCuriosityCanvas.read(upToCount: rosyExpressionCanvas.count) ?? Data())
        }
    }
}
