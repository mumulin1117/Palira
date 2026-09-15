"""Exercise the production Swift loader through a sandbox-style symlink."""
from pathlib import Path
import subprocess
import tempfile

project = Path(__file__).resolve().parents[2]
source = (project / 'PaDlroliroBox/PaDlroliroBox/PaliroNativeBridge.swift').read_text()
loader = source[source.index('final class PaliroLocalResources:'):]
checks = r'''
extension PaliroLocalResources {
    static func verifyPaths() throws {
        let fm = FileManager.default
        let base = fm.temporaryDirectory.appendingPathComponent("paliro-resource-test-\(UUID().uuidString)")
        defer { try? fm.removeItem(at: base) }
        let real = base.appendingPathComponent("real/public")
        try fm.createDirectory(at: real.appendingPathComponent("PaliroWebVault"), withIntermediateDirectories: true)
        try fm.copyItem(at: URL(fileURLWithPath: CommandLine.arguments[1]), to: real.appendingPathComponent("PaliroWebVault/paliro-bootstrap.pwb"))
        try fm.createSymbolicLink(at: base.appendingPathComponent("alias"), withDestinationURL: base.appendingPathComponent("real"))
        let root = base.appendingPathComponent("alias/public")
        guard case .lunarImaginationCanvas(let html, _) = try springDreamCanvas(springCuriosityCanvas: "index.html", springReflectionCanvas: root),
              String(data: html, encoding: .utf8)?.contains("<html") == true else { fatalError("Archive index did not load") }
        try Data("plain asset".utf8).write(to: real.appendingPathComponent("plain.txt"))
        guard case .solarWonderCanvas = try springDreamCanvas(springCuriosityCanvas: "plain.txt", springReflectionCanvas: root) else { fatalError("Plain asset did not load") }
        let outside = base.appendingPathComponent("outside.txt")
        try Data("outside".utf8).write(to: outside)
        try fm.createSymbolicLink(at: real.appendingPathComponent("escape.txt"), withDestinationURL: outside)
        for path in ["../outside.txt", "escape.txt", outside.path] {
            do { _ = try springDreamCanvas(springCuriosityCanvas: path, springReflectionCanvas: root); fatalError("Escaped root: \(path)") }
            catch let error as URLError { precondition(error.code == .noPermissionsToReadFile) }
        }
        let cache = base.appendingPathComponent("real/cache")
        try fm.createDirectory(at: cache.appendingPathComponent("current"), withIntermediateDirectories: true)
        try fm.createDirectory(at: cache.appendingPathComponent("old"), withIntermediateDirectories: true)
        try Data().write(to: cache.appendingPathComponent("current/.ready"))
        try summerImaginationCanvas(summerReflectionCanvas: base.appendingPathComponent("alias/cache"), summerWonderCanvas: "current")
        precondition(fm.fileExists(atPath: cache.appendingPathComponent("current/.ready").path))
        precondition(!fm.fileExists(atPath: cache.appendingPathComponent("old").path))
        print("PASS cache survives pruning through symlink; archived index through symlink, plain asset, traversal/absolute/symlink escapes")
    }
}
try PaliroLocalResources.verifyPaths()
'''
with tempfile.TemporaryDirectory(prefix='paliro-swift-resource-') as directory:
    path = Path(directory)
    swift = path / 'main.swift'
    swift.write_text('import Foundation\nimport CryptoKit\nimport WebKit\nimport UniformTypeIdentifiers\n' + loader + checks)
    subprocess.run(['swiftc', str(swift), '-o', str(path / 'check')], check=True)
    subprocess.run([str(path / 'check'), str(project / 'PaDlroliroBox/PaDlroliroBox/public/PaliroWebVault/paliro-bootstrap.pwb')], check=True)
