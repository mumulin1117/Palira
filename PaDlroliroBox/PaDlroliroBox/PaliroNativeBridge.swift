import Foundation
import CryptoKit
import UIKit
import WebKit
import UniformTypeIdentifiers

protocol PaliroNativeMethods {
    var jsName: String { get }
    var methods: [String] { get }
}

class PaliroNativeService: NSObject {
    weak var bridge: PaliroNativeBridge?
    func load() {}
    func resetPage() {}
    func notifyListeners(_ event: String, data: [String: Any], retainUntilConsumed: Bool = false) {
        guard let service = self as? PaliroNativeMethods else { return }
        DispatchQueue.main.async { [weak self] in
            self?.bridge?.emit(service.jsName, event: event, data: data, retain: retainUntilConsumed)
        }
    }
}

final class PaliroNativeCall: NSObject {
    private let options: [String: Any]
    private var completion: (([String: Any]) -> Void)?
    init(options: [String: Any], completion: @escaping ([String: Any]) -> Void) {
        self.options = options
        self.completion = completion
    }
    func getString(_ key: String) -> String? { options[key] as? String }
    func getBool(_ key: String) -> Bool? { options[key] as? Bool }
    func getArray<T>(_ key: String, _ type: T.Type) -> [T]? { options[key] as? [T] }
    func resolve(_ value: [String: Any] = [:]) { finish(["value": value]) }
    func reject(_ message: String, _ code: String? = nil, _ error: Error? = nil) {
        finish(["error": ["message": message, "code": code ?? "NATIVE_ERROR"]])
    }
    private func finish(_ payload: [String: Any]) {
        DispatchQueue.main.async { [self] in
            let callback = completion
            completion = nil
            callback?(payload)
        }
    }
}

final class PaliroNativeBridge: NSObject, WKScriptMessageHandler {
    weak var viewController: UIViewController?
    weak var webView: WKWebView?
    private var services: [String: PaliroNativeService] = [:]
    private var subscriptions = Set<String>()
    private var retained: [String: [[String: Any]]] = [:]

    func register(_ service: PaliroNativeService & PaliroNativeMethods) {
        services[service.jsName] = service
        service.bridge = self
        service.load()
    }

    func resetPage() {
        subscriptions.removeAll()
        services.values.forEach { $0.resetPage() }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.protocol == "capacitor",
              message.frameInfo.securityOrigin.host == "localhost",
              let body = message.body as? [String: Any],
              let id = body["id"] as? String, id.count < 160,
              let name = body["service"] as? String,
              let method = body["method"] as? String else { return }
        let options = body["options"] as? [String: Any] ?? [:]
        let call = PaliroNativeCall(options: options) { [weak self] result in
            self?.send("receive", arguments: [result.merging(["id": id]) { _, new in new }])
        }
        guard let service = services[name], let api = service as? PaliroNativeMethods else {
            call.reject("Native service is unavailable.", "UNAVAILABLE"); return
        }
        if method == "__listen" || method == "__unlisten" {
            guard name == "PaliroIap", let event = options["event"] as? String, event == "purchaseResult" else {
                call.reject("Unsupported native event."); return
            }
            let key = "\(name):\(event)"
            if method == "__listen" {
                subscriptions.insert(key)
                for payload in retained.removeValue(forKey: key) ?? [] { send("emit", arguments: [name, event, payload]) }
            } else { subscriptions.remove(key) }
            call.resolve()
            return
        }
        let selector = NSSelectorFromString(method + ":")
        guard api.methods.contains(method), service.responds(to: selector) else {
            call.reject("Unsupported native method.", "UNAVAILABLE"); return
        }
        service.perform(selector, with: call)
    }

    func emit(_ service: String, event: String, data: [String: Any], retain: Bool) {
        let key = "\(service):\(event)"
        if subscriptions.contains(key) { send("emit", arguments: [service, event, data]) }
        else if retain { retained[key, default: []].append(data) }
    }

    private func send(_ method: String, arguments: [Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: arguments, options: [.fragmentsAllowed]),
              let json = String(data: data, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.PaliroNative?.\(method)(...\(json))", completionHandler: nil)
    }
}


final class PaliroLocalResources: NSObject, WKURLSchemeHandler {
    private enum Resource {
        case memory(Data, String)
        case file(URL)
    }

    private struct ArchiveCursor {
        let data: Data
        var offset = 0

        mutating func read(_ count: Int) throws -> Data {
            guard count >= 0, offset >= 0, offset <= data.count, count <= data.count - offset else {
                throw URLError(.cannotDecodeContentData)
            }
            defer { offset += count }
            return data.subdata(in: offset..<(offset + count))
        }

        mutating func readUInt32() throws -> Int {
            let bytes = try read(4)
            return bytes.reduce(0) { ($0 << 8) | Int($1) }
        }

        mutating func readUInt64() throws -> Int {
            let bytes = try read(8)
            let value = bytes.reduce(UInt64(0)) { ($0 << 8) | UInt64($1) }
            guard value <= UInt64(Int.max) else { throw URLError(.cannotDecodeContentData) }
            return Int(value)
        }
    }

    private static let vaultMagic = Data("PALIRO3\0".utf8)
    private static let archiveMagic = Data("PALIROPACK1\0".utf8)
    private static let innerKey = SymmetricKey(data: Data([
        0xc2, 0xf7, 0x13, 0x51, 0x97, 0xde, 0x12, 0x42, 0x0a, 0x3c, 0x49, 0x4c, 0x42, 0x58, 0x88, 0x31,
        0x82, 0x65, 0x66, 0xbe, 0x47, 0x0a, 0xac, 0x89, 0x67, 0x40, 0xb5, 0x8f, 0xf2, 0xdd, 0xf2, 0xec,
    ]))
    private static let outerKey = SymmetricKey(data: Data([
        0x3d, 0xf1, 0xae, 0x98, 0xe2, 0x6c, 0x4f, 0xdc, 0x4a, 0xfd, 0xaf, 0x45, 0x49, 0x0c, 0xe4, 0xb5,
        0xb7, 0x31, 0x52, 0xf7, 0x96, 0xc0, 0x76, 0x91, 0xaa, 0x51, 0xec, 0x63, 0x4d, 0x86, 0x25, 0x50,
    ]))
    private static let archiveLock = NSLock()
    private static var bootstrapResources: [String: Data]?
    private static var preparedAssetCache: URL?
    private var tasks = Set<ObjectIdentifier>()
    private let queue = DispatchQueue(label: "site.paliro.local-resources", qos: .userInitiated, attributes: .concurrent)

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let id = ObjectIdentifier(urlSchemeTask)
        tasks.insert(id)
        let request = urlSchemeTask.request
        queue.async { [weak self] in
            let result = Result { try Self.response(for: request) }
            DispatchQueue.main.async {
                guard let self, self.tasks.remove(id) != nil else { return }
                switch result {
                case .success(let (response, data)):
                    urlSchemeTask.didReceive(response)
                    urlSchemeTask.didReceive(data)
                    urlSchemeTask.didFinish()
                case .failure(let error):
                    NSLog("Paliro resource load failed: %@ (%@ %ld)", request.url?.path ?? "", (error as NSError).domain, (error as NSError).code)
                    urlSchemeTask.didFailWithError(error)
                }
            }
        }
    }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        tasks.remove(ObjectIdentifier(urlSchemeTask))
    }

    static func bundledData(for relativePath: String) throws -> Data {
        guard let webRoot = Bundle.main.resourceURL?.appendingPathComponent("public") else { throw URLError(.badURL) }
        switch try resource(for: relativePath, webRoot: webRoot) {
        case .memory(let data, _): return data
        case .file(let file): return try Data(contentsOf: file, options: .mappedIfSafe)
        }
    }

    private static func resource(for relativePath: String, webRoot: URL) throws -> Resource {
        guard !relativePath.isEmpty, !relativePath.hasPrefix("/"), !relativePath.split(separator: "/").contains("..") else {
            throw URLError(.noPermissionsToReadFile)
        }
        let file = webRoot.appendingPathComponent(relativePath)
        // Archived resources have no individual file. Foundation does not resolve
        // parent symlinks consistently for nonexistent paths (notably /var on iOS).
        // Apply filesystem containment only to real files, then use validated archive keys.
        if FileManager.default.fileExists(atPath: file.path) {
            let canonical = file.resolvingSymlinksInPath().standardizedFileURL
            let rootPath = webRoot.resolvingSymlinksInPath().standardizedFileURL.path + "/"
            guard canonical.path.hasPrefix(rootPath) else { throw URLError(.noPermissionsToReadFile) }
            return .file(canonical)
        }

        archiveLock.lock()
        defer { archiveLock.unlock() }
        let bootstrap = try loadBootstrapResources(webRoot: webRoot)
        if let data = bootstrap[relativePath] { return .memory(data, relativePath) }
        let cache = try prepareAssetCache(webRoot: webRoot)
        let cachedFile = cache.appendingPathComponent(relativePath)
        let cachedCanonical = cachedFile.resolvingSymlinksInPath().standardizedFileURL
        guard cachedCanonical.path.hasPrefix(cache.resolvingSymlinksInPath().standardizedFileURL.path + "/"),
              FileManager.default.fileExists(atPath: cachedCanonical.path) else { throw URLError(.fileDoesNotExist) }
        return .file(cachedCanonical)
    }

    private static func loadBootstrapResources(webRoot: URL) throws -> [String: Data] {
        if let bootstrapResources { return bootstrapResources }
        let archive = webRoot.appendingPathComponent("PaliroWebVault/paliro-bootstrap.pwb")
        var resources: [String: Data] = [:]
        try parseArchive(openArchive(archive)) { path, data in resources[path] = data }
        bootstrapResources = resources
        return resources
    }

    private static func prepareAssetCache(webRoot: URL) throws -> URL {
        if let preparedAssetCache { return preparedAssetCache }
        let manager = FileManager.default
        let vault = webRoot.appendingPathComponent("PaliroWebVault")
        let assetName = try manager.contentsOfDirectory(atPath: vault.path)
            .first { $0.hasPrefix("paliro-assets-") && $0.hasSuffix(".pwb") }
        guard let assetName else { throw URLError(.fileDoesNotExist) }
        let version = String(assetName.dropFirst("paliro-assets-".count).dropLast(".pwb".count))
        let support = try manager.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let root = support.appendingPathComponent("PaliroWebCache", isDirectory: true)
        let target = root.appendingPathComponent(version, isDirectory: true)
        let ready = target.appendingPathComponent(".ready")
        try manager.createDirectory(at: root, withIntermediateDirectories: true)
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        var mutableRoot = root
        try? mutableRoot.setResourceValues(values)
        if manager.fileExists(atPath: ready.path) {
            preparedAssetCache = target
            return target
        }

        let temporary = root.appendingPathComponent(".\(version)-\(UUID().uuidString)", isDirectory: true)
        try? manager.removeItem(at: temporary)
        try manager.createDirectory(at: temporary, withIntermediateDirectories: true)
        do {
            let archive = vault.appendingPathComponent(assetName)
            try parseArchive(openArchive(archive)) { path, data in
                let output = temporary.appendingPathComponent(path)
                let canonical = output.standardizedFileURL
                guard canonical.path.hasPrefix(temporary.standardizedFileURL.path + "/") else {
                    throw URLError(.noPermissionsToReadFile)
                }
                try manager.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
                try data.write(to: output, options: .atomic)
                try manager.setAttributes([.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication], ofItemAtPath: output.path)
            }
            try Data().write(to: temporary.appendingPathComponent(".ready"), options: .atomic)
            try? manager.removeItem(at: target)
            try manager.moveItem(at: temporary, to: target)
            try removeOldAssetCaches(in: root, keepingVersion: version)
            preparedAssetCache = target
            return target
        } catch {
            try? manager.removeItem(at: temporary)
            throw error
        }
    }

    private static func removeOldAssetCaches(in root: URL, keepingVersion version: String) throws {
        let manager = FileManager.default
        // Directory enumeration may return /private/var while our URL uses /var.
        // These are immediate children of the same root; compare their version names.
        for item in try manager.contentsOfDirectory(at: root, includingPropertiesForKeys: nil)
            where item.lastPathComponent != version {
            try? manager.removeItem(at: item)
        }
    }

    private static func openArchive(_ url: URL) throws -> Data {
        let protectedData = try Data(contentsOf: url, options: .mappedIfSafe)
        guard protectedData.starts(with: vaultMagic) else { throw URLError(.cannotDecodeContentData) }
        let outerBox = try AES.GCM.SealedBox(combined: protectedData.dropFirst(vaultMagic.count))
        let innerData = try AES.GCM.open(outerBox, using: outerKey)
        let innerBox = try AES.GCM.SealedBox(combined: innerData)
        let compressed = try AES.GCM.open(innerBox, using: innerKey)
        return try (compressed as NSData).decompressed(using: .zlib) as Data
    }

    private static func parseArchive(_ archive: Data, consume: (String, Data) throws -> Void) throws {
        var cursor = ArchiveCursor(data: archive)
        guard try cursor.read(archiveMagic.count) == archiveMagic else { throw URLError(.cannotDecodeContentData) }
        let count = try cursor.readUInt32()
        guard count > 0, count <= 20_000 else { throw URLError(.cannotDecodeContentData) }
        for _ in 0..<count {
            let pathLength = try cursor.readUInt32()
            let dataLength = try cursor.readUInt64()
            guard pathLength > 0, pathLength <= 4_096,
                  let path = String(data: try cursor.read(pathLength), encoding: .utf8),
                  !path.hasPrefix("/"), !path.split(separator: "/").contains("..") else {
                throw URLError(.cannotDecodeContentData)
            }
            try consume(path, try cursor.read(dataLength))
        }
        guard cursor.offset == archive.count else { throw URLError(.cannotDecodeContentData) }
    }

    private static func response(for request: URLRequest) throws -> (URLResponse, Data) {
        guard let url = request.url, url.host == "localhost", ["GET", "HEAD"].contains(request.httpMethod ?? "GET"),
              let webRoot = Bundle.main.resourceURL?.appendingPathComponent("public") else { throw URLError(.badURL) }
        let path = url.path
        let resource: Resource
        if let prefix = ["/_paliro_file_", "/_capacitor_file_"].first(where: { path.hasPrefix($0) }) {
            let file = URL(fileURLWithPath: String(path.dropFirst(prefix.count)))
            let support = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            let roots = [support.appendingPathComponent("PaliroVideos"), support.appendingPathComponent("PaliroVoiceMessages")]
            let canonical = file.resolvingSymlinksInPath().standardizedFileURL
            guard roots.contains(where: { canonical.path.hasPrefix($0.resolvingSymlinksInPath().standardizedFileURL.path + "/") }) else {
                throw URLError(.noPermissionsToReadFile)
            }
            resource = .file(canonical)
        } else {
            let relativePath = path == "/" ? "index.html" : String(path.dropFirst())
            resource = try self.resource(for: relativePath, webRoot: webRoot)
        }

        let total: Int
        let extensionPath: String
        switch resource {
        case .memory(let data, let path):
            total = data.count
            extensionPath = path
        case .file(let file):
            total = (try FileManager.default.attributesOfItem(atPath: file.path)[.size] as? NSNumber)?.intValue ?? 0
            extensionPath = file.path
        }
        var headers = ["Content-Type": UTType(filenameExtension: URL(fileURLWithPath: extensionPath).pathExtension)?.preferredMIMEType ?? "application/octet-stream",
                       "Accept-Ranges": "bytes", "Cache-Control": "no-cache"]
        var status = 200
        var range = 0..<total
        if let value = request.value(forHTTPHeaderField: "Range") {
            let bounds = value.replacingOccurrences(of: "bytes=", with: "").split(separator: "-", omittingEmptySubsequences: false)
            if value.hasPrefix("bytes="), bounds.count == 2, !value.contains(",") {
                let start = bounds[0].isEmpty ? max(0, total - (Int(bounds[1]) ?? 0)) : (Int(bounds[0]) ?? -1)
                let end = bounds[0].isEmpty || bounds[1].isEmpty ? total - 1 : min(Int(bounds[1]) ?? -1, total - 1)
                if start >= 0, end >= start, start < total { range = start..<(end + 1); status = 206 }
                else { status = 416; range = 0..<0 }
            } else { status = 416; range = 0..<0 }
            headers["Content-Range"] = status == 206 ? "bytes \(range.lowerBound)-\(range.upperBound - 1)/\(total)" : "bytes */\(total)"
        }
        headers["Content-Length"] = String(range.count)
        guard let response = HTTPURLResponse(url: url, statusCode: status, httpVersion: "HTTP/1.1", headerFields: headers) else { throw URLError(.badServerResponse) }
        if request.httpMethod == "HEAD" || range.isEmpty { return (response, Data()) }
        switch resource {
        case .memory(let data, _): return (response, data.subdata(in: range))
        case .file(let file):
            let handle = try FileHandle(forReadingFrom: file)
            defer { try? handle.close() }
            try handle.seek(toOffset: UInt64(range.lowerBound))
            return (response, try handle.read(upToCount: range.count) ?? Data())
        }
    }
}
