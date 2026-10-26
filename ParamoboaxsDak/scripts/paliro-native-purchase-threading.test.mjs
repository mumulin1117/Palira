import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const native = path.join(root, 'PaDlroliroBox/PaDlroliroBox/PaliroEloa')
const simulator = process.argv.find(value => value.startsWith('--simulator='))?.split('=')[1]
const directory = mkdtempSync(path.join(tmpdir(), 'paliro-purchase-threading-'))
const stubs = String.raw`
import Foundation
#if canImport(UIKit)
import UIKit
#endif

let roastShelfPreview = true
enum PaliroThreadProbe {
    static let suite = "paliro-threading-test-" + UUID().uuidString
    static let preferences = UserDefaults(suiteName: suite)!
    static let receiptURL: URL? = URL(fileURLWithPath: CommandLine.arguments[1])
}

protocol SKRequestDelegate: AnyObject {
    func requestDidFinish(_ request: SKRequest)
    func request(_ request: SKRequest, didFailWithError error: Error)
}
extension SKRequestDelegate {
    func requestDidFinish(_ request: SKRequest) {}
}
protocol SKProductsRequestDelegate: SKRequestDelegate {
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse)
}
protocol SKPaymentTransactionObserver: AnyObject {
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction])
}
class SKRequest: NSObject {
    weak var delegate: SKRequestDelegate?
    func start() {}
    func cancel() {}
}
final class SKProduct {
    let productIdentifier: String
    init(_ identifier: String) { productIdentifier = identifier }
}
final class SKProductsResponse {
    let products: [SKProduct]
    init(_ products: [SKProduct]) { self.products = products }
}
final class SKProductsRequest: SKRequest {
    let identifiers: Set<String>
    init(productIdentifiers: Set<String>) { identifiers = productIdentifiers }
    override func start() {
        precondition(Thread.isMainThread, "Product request started off the main thread")
        DispatchQueue.global().async {
            if self.identifiers.contains("product-failure") {
                self.delegate?.request(self, didFailWithError: NSError(domain: "test", code: 1))
            } else {
                (self.delegate as? SKProductsRequestDelegate)?.productsRequest(
                    self, didReceive: SKProductsResponse(self.identifiers.map(SKProduct.init)))
            }
        }
    }
}
final class SKReceiptRefreshRequest: SKRequest {
    override func start() {
        precondition(Thread.isMainThread, "Receipt request started off the main thread")
        DispatchQueue.global().async { self.delegate?.requestDidFinish(self) }
    }
}
class SKPayment {
    let productIdentifier: String
    var applicationUsername: String?
    init(product: SKProduct) { productIdentifier = product.productIdentifier }
}
final class SKMutablePayment: SKPayment {}
struct SKError: Error {
    enum Code { case paymentCancelled }
    let code: Code
}
enum SKPaymentTransactionState {
    case purchasing, deferred, purchased, restored, failed
}
final class SKPaymentTransaction {
    let payment: SKPayment
    let transactionState: SKPaymentTransactionState
    let transactionIdentifier: String?
    let error: Error?
    init(_ payment: SKPayment) {
        self.payment = payment
        transactionIdentifier = "transaction-" + payment.productIdentifier
        transactionState = payment.productIdentifier == "cancelled" ? .failed
            : payment.productIdentifier == "deferred" ? .deferred : .purchased
        error = payment.productIdentifier == "cancelled" ? SKError(code: .paymentCancelled) : nil
    }
}
final class SKPaymentQueue {
    static let instance = SKPaymentQueue()
    static func ${'`'}default${'`'}() -> SKPaymentQueue { instance }
    static func canMakePayments() -> Bool { true }
    weak var observer: SKPaymentTransactionObserver?
    var transactions: [SKPaymentTransaction] = []
    var finished: [String] = []
    func add(_ observer: SKPaymentTransactionObserver) {
        precondition(Thread.isMainThread)
        self.observer = observer
    }
    func add(_ payment: SKPayment) {
        precondition(Thread.isMainThread, "Payment was added off the main thread")
        let transaction = SKPaymentTransaction(payment)
        transactions.append(transaction)
        DispatchQueue.global().async {
            self.observer?.paymentQueue(self, updatedTransactions: [transaction])
        }
    }
    func finishTransaction(_ transaction: SKPaymentTransaction) {
        precondition(Thread.isMainThread, "Transaction finished off the main thread")
        finished.append(transaction.payment.productIdentifier)
        transactions.removeAll { $0 === transaction }
    }
}

actor SereneDreamTrail {
    static let lucentCuriosityTrail = SereneDreamTrail()
    var failedRetry = false
    func lucentDreamTrail() async throws -> amberImaginationTrail? { nil }
    func lucentFeelingTrail() async throws {}
    func lucentWonderTrail(mindfulAffinityBridge: String, mindfulCuriosityPath: String,
                          mindfulExpressionBeacon: String) async throws {
        try await Task.sleep(nanoseconds: 10_000_000)
        if mindfulAffinityBridge == "transaction-retry", !failedRetry {
            failedRetry = true
            throw NSError(domain: "test-verification", code: 1)
        }
    }
}
final class URLSession {
    static let shared = URLSession()
    func webSocketTask(with url: URL) -> URLSessionWebSocketTask { URLSessionWebSocketTask() }
}
final class URLSessionWebSocketTask {
    enum Message { case data(Data), string(String) }
    enum CloseCode { case goingAway, normalClosure }
    func resume() {}
    func cancel(with code: CloseCode, reason: Data?) {}
    func sendPing(pongReceiveHandler: @escaping (Error?) -> Void) { pongReceiveHandler(nil) }
    func send(_ message: Message) async throws {}
    func receive() async throws -> Message {
        try await Task.sleep(nanoseconds: 10_000_000)
        let payload: [String: Any] = ["action": 15, "channel": "test-scope", "messages": [
            ["id": "socket-result", "data": ["event": "payResult", "status": "verified"]]
        ]]
        return .data(try JSONSerialization.data(withJSONObject: payload))
    }
}
`

const tests = String.raw`
@MainActor
func runPurchaseThreadingChecks() async throws {
    defer { PaliroThreadProbe.preferences.removePersistentDomain(forName: PaliroThreadProbe.suite) }
    let originalRequired: [String: Any] = [
        "airyWonderCanvaspaliro": "original-order", "auroraPetalRibbonpaliro": "original-product",
        "brightMoodpaliro": "test-scope", "brightWonderSignalPathpaliro": "0C4C2201-2708-4B92-96DC-411C2E83B0D1",
        "candidMoodpaliro": false,
    ]
    let originalOptional: [String: Any] = [
        "celestialRhythmpaliro": 42, "cosmicMoodpaliro": "original-transaction",
        "cosmicReflectionArcpaliro": "purchasePending", "crystalAffinityCanvasepaliro": true,
    ]
    for original in [originalRequired, originalRequired.merging(originalOptional) { _, value in value }] {
        let data = try JSONSerialization.data(withJSONObject: original)
        let decoded = try JSONDecoder().decode(SereneExpressionTrail.airyCuriosityCanvas.self, from: data)
        precondition(decoded.airyWonderCanvas == "original-order" && decoded.auroraPetalRibbon == "original-product")
        let encoded = try JSONEncoder().encode(decoded)
        let restored = try JSONSerialization.jsonObject(with: encoded) as! [String: Any]
        precondition(NSDictionary(dictionary: original).isEqual(to: restored), "Persisted purchase keys changed")
    }
    print("PASS old purchase records decode and re-encode with identical keys and values")
    let service = SereneExpressionTrail.crystalDreamCanvas
    var results: [[String: Any]] = []
#if canImport(UIKit)
    let container = UIView(frame: CGRect(x: 0, y: 0, width: 320, height: 568))
    container.layoutIfNeeded()
#endif
    service.crystalExpressionCanvas = { scope, result in
        precondition(Thread.isMainThread, "Purchase UI callback ran on a background thread")
#if canImport(UIKit)
        let feedback = UILabel()
        feedback.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(feedback)
        NSLayoutConstraint.activate([
            feedback.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            feedback.centerYAnchor.constraint(equalTo: container.centerYAnchor),
        ])
        container.layoutIfNeeded()
        feedback.removeFromSuperview()
#endif
        results.append(result)
        return true
    }
    service.gentleMood()
    for product in ["", "product-failure", "paid", "cancelled", "deferred", "retry"] {
        let initialCount = results.count
        await Task.detached {
            await service.lunarReflectionArc(auroraPetalRibbon: product,
                airyWonderCanvas: "order-" + product, brightMood: "test-scope")
        }.value
        let deadline = Date().addingTimeInterval(3)
        while results.count == initialCount, Date() < deadline {
            try await Task.sleep(nanoseconds: 5_000_000)
        }
        precondition(results.count > initialCount, "Missing purchase result")
        let status = results.last?["status"] as? String
        let expected = product.isEmpty || product == "product-failure" ? "failed"
            : product == "cancelled" ? "cancelled"
            : product == "deferred" || product == "retry" ? "pending" : "verified"
        precondition(status == expected, "Unexpected purchase state")
        precondition(!service.crystalInspirationCanvas, "Purchase busy state did not reset")
        print("PASS background StoreKit / awaited verification: " + (product.isEmpty ? "invalid input" : product))
    }
    precondition(SKPaymentQueue.instance.finished.filter { $0 == "paid" }.count == 1)
    precondition(!SKPaymentQueue.instance.finished.contains("retry"))
    let previousCount = results.count
    await Task.detached { await service.luminousPath(lunarAffinityCanvas: true, auroraPetalRibbon: "retry") }.value
    precondition(results.count > previousCount && results.last?["status"] as? String == "verified")
    precondition(SKPaymentQueue.instance.finished.filter { $0 == "retry" }.count == 1)
    print("PASS verification failure keeps transaction available; retry finishes exactly once")

    let socket = ReflectiveFeelingPalette(curiousFeelingPalette: amberImaginationTrail(
        autumnReflectionCanvas: URL(string: "https://example.invalid")!, autumnWonderCanvas: "test-scope",
        mistyAffinityCanvas: URL(string: "wss://example.invalid")!))
    var socketDelivered = false
    socket.curiousAffinityBridge = { payload, timestamp in
        precondition(Thread.isMainThread, "WebSocket UI callback ran on a background thread")
        socketDelivered = payload["status"] as? String == "verified"
        socket.playfulCuriosityPath()
    }
    socket.curiousThoughtCanvas()
    let socketDeadline = Date().addingTimeInterval(3)
    while !socketDelivered, Date() < socketDeadline {
        try await Task.sleep(nanoseconds: 5_000_000)
    }
    precondition(socketDelivered, "Missing WebSocket UI callback")
    print("PASS awaited WebSocket result is delivered on the main thread")
}

var finished = false
Task { @MainActor in
    do {
        try await runPurchaseThreadingChecks()
        finished = true
    } catch {
        print("FAIL: \(error)")
        exit(1)
    }
}
let deadline = Date().addingTimeInterval(20)
while !finished, Date() < deadline {
    RunLoop.main.run(until: Date().addingTimeInterval(0.01))
}
precondition(finished, "Threading regression tests timed out")
print("PASS B-package purchase and WebSocket threading regression checks")
`

try {
  const files = [path.join(native, '../PalirodreamyWonder.swift'),
    ...['LucentImaginationTrail', 'SereneExpressionTrail', 'ReflectiveFeelingPalette']
      .map(name => path.join(native, `${name}.swift`))]
  const sources = files.map(file => {
    let source = readFileSync(file, 'utf8')
      .split('\n').filter(line => !line.startsWith('import ')).join('\n')
    source = source.replaceAll('UserDefaults.standard', 'PaliroThreadProbe.preferences')
      .replaceAll('Bundle.main.appStoreReceiptURL', 'PaliroThreadProbe.receiptURL')
    return source
  }).join('\n')
  const source = path.join(directory, 'main.swift')
  const executable = path.join(directory, 'purchase-threading')
  const receipt = path.join(directory, 'receipt.dat')
  writeFileSync(receipt, 'isolated-test-receipt')
  writeFileSync(source, stubs + sources + tests)
  const options = [...(simulator ? ['--sdk', 'iphonesimulator'] : []), 'swiftc', '-swift-version', '5', '-module-cache-path', path.join(directory, 'modules'),
    '-Xfrontend', '-enable-actor-data-race-checks']
  if (simulator) {
    const sdk = execFileSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path'], { encoding: 'utf8' }).trim()
    options.push('-sdk', sdk, '-target', `${process.arch === 'arm64' ? 'arm64' : 'x86_64'}-apple-ios17.0-simulator`)
  }
  execFileSync('xcrun', [...options, source, '-o', executable], { stdio: 'inherit', timeout: 120_000 })
  const output = simulator
    ? execFileSync('xcrun', ['simctl', 'spawn', simulator, executable, receipt], { encoding: 'utf8', timeout: 30_000 })
    : execFileSync(executable, [receipt], { encoding: 'utf8', timeout: 30_000 })
  assert.match(output, /PASS B-package purchase and WebSocket threading regression checks/)
  process.stdout.write(output)
} finally {
  rmSync(directory, { recursive: true, force: true })
}
