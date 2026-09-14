import Foundation
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
                case .failure(let error): urlSchemeTask.didFailWithError(error)
                }
            }
        }
    }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        tasks.remove(ObjectIdentifier(urlSchemeTask))
    }

    private static func response(for request: URLRequest) throws -> (URLResponse, Data) {
        guard let url = request.url, url.host == "localhost", ["GET", "HEAD"].contains(request.httpMethod ?? "GET"),
              let webRoot = Bundle.main.resourceURL?.appendingPathComponent("public") else { throw URLError(.badURL) }
        let path = url.path
        let file: URL
        let roots: [URL]
        if let prefix = ["/_paliro_file_", "/_capacitor_file_"].first(where: { path.hasPrefix($0) }) {
            file = URL(fileURLWithPath: String(path.dropFirst(prefix.count)))
            let support = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            roots = [support.appendingPathComponent("PaliroVideos"), support.appendingPathComponent("PaliroVoiceMessages")]
        } else {
            file = webRoot.appendingPathComponent(path == "/" ? "index.html" : String(path.dropFirst()))
            roots = [webRoot]
        }
        let canonical = file.resolvingSymlinksInPath().standardizedFileURL
        guard roots.contains(where: { canonical.path.hasPrefix($0.resolvingSymlinksInPath().standardizedFileURL.path + "/") }) else {
            throw URLError(.noPermissionsToReadFile)
        }
        let data = try Data(contentsOf: canonical, options: .mappedIfSafe)
        var headers = ["Content-Type": UTType(filenameExtension: canonical.pathExtension)?.preferredMIMEType ?? "application/octet-stream",
                       "Accept-Ranges": "bytes", "Cache-Control": "no-cache"]
        var status = 200
        var range = 0..<data.count
        if let value = request.value(forHTTPHeaderField: "Range") {
            let bounds = value.replacingOccurrences(of: "bytes=", with: "").split(separator: "-", omittingEmptySubsequences: false)
            if value.hasPrefix("bytes="), bounds.count == 2, !value.contains(",") {
                let start = bounds[0].isEmpty ? max(0, data.count - (Int(bounds[1]) ?? 0)) : (Int(bounds[0]) ?? -1)
                let end = bounds[0].isEmpty || bounds[1].isEmpty ? data.count - 1 : min(Int(bounds[1]) ?? -1, data.count - 1)
                if start >= 0, end >= start, start < data.count { range = start..<(end + 1); status = 206 }
                else { status = 416; range = 0..<0 }
            } else { status = 416; range = 0..<0 }
            headers["Content-Range"] = status == 206 ? "bytes \(range.lowerBound)-\(range.upperBound - 1)/\(data.count)" : "bytes */\(data.count)"
        }
        headers["Content-Length"] = String(range.count)
        guard let response = HTTPURLResponse(url: url, statusCode: status, httpVersion: "HTTP/1.1", headerFields: headers) else { throw URLError(.badServerResponse) }
        return (response, request.httpMethod == "HEAD" ? Data() : data.subdata(in: range))
    }
}
