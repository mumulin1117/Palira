"""Exercise the production Swift loader through a sandbox-style symlink."""
from pathlib import Path
import subprocess
import tempfile
import hashlib
import json

project = Path(__file__).resolve().parents[2]
source = (project / 'PaDlroliroBox/PaDlroliroBox/PaliroMistyGrove.swift').read_text()
loader = source[source.index('final class PaliroMistyGrove:'):]
checks = r'''
extension PaliroMistyGrove {
    static func verifyPaths() throws {
        let fm = FileManager.default
        let base = fm.temporaryDirectory.appendingPathComponent("paliro-resource-test-\(UUID().uuidString)")
        defer { try? fm.removeItem(at: base) }
        let real = base.appendingPathComponent("real/PaliroPetalGarden")
        try fm.createDirectory(at: real.appendingPathComponent("PaliroDewArchive"), withIntermediateDirectories: true)
        try fm.copyItem(at: URL(fileURLWithPath: CommandLine.arguments[1]), to: real.appendingPathComponent("PaliroDewArchive/PaliroFirstBloom.pwb"))
        try fm.createSymbolicLink(at: base.appendingPathComponent("alias"), withDestinationURL: base.appendingPathComponent("real"))
        let root = base.appendingPathComponent("alias/PaliroPetalGarden")
        guard case .lunarImaginationCanvas(let html, _) = try springDreamCanvas(springCuriosityCanvas: "index.html", springReflectionCanvas: root),
              String(data: html, encoding: .utf8)?.contains("<html") == true else { fatalError("Archive index did not load") }
        precondition(petalResourcePath("plain.txt") == CommandLine.arguments[2])
        try fm.createDirectory(at: real.appendingPathComponent("PaliroBloomMedia"), withIntermediateDirectories: true)
        try Data("plain asset".utf8).write(to: real.appendingPathComponent(petalResourcePath("plain.txt")))
        guard case .solarWonderCanvas(let plainURL) = try springDreamCanvas(springCuriosityCanvas: "plain.txt", springReflectionCanvas: root),
              try String(contentsOf: plainURL, encoding: .utf8) == "plain asset" else { fatalError("Plain asset did not load") }
        let outside = base.appendingPathComponent("outside.txt")
        try Data("outside".utf8).write(to: outside)
        try fm.createSymbolicLink(at: real.appendingPathComponent(petalResourcePath("escape.txt")), withDestinationURL: outside)
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
        let packagedRoot = URL(fileURLWithPath: CommandLine.arguments[3])
        let manifest = try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[4]))) as! [[String: String]]
        for item in manifest {
            guard case .solarWonderCanvas(let resourceURL) = try springDreamCanvas(springCuriosityCanvas: item["logical"]!, springReflectionCanvas: packagedRoot) else {
                fatalError("Packaged startup resource did not resolve")
            }
            let digest = SHA256.hash(data: try Data(contentsOf: resourceURL)).map { String(format: "%02x", $0) }.joined()
            precondition(digest == item["digest"])
        }
        print("PASS all \(manifest.count) packaged startup images/fonts resolve through original URLs")
        print("PASS cache survives pruning through symlink; archived index through symlink, plain asset, traversal/absolute/symlink escapes")
    }
}
try PaliroMistyGrove.verifyPaths()
'''
with tempfile.TemporaryDirectory(prefix='paliro-swift-resource-') as directory:
    path = Path(directory)
    swift = path / 'main.swift'
    decoder = (project / 'PaDlroliroBox/PaDlroliroBox/PalirodreamyWonder.swift').read_text()
    swift.write_text('import Foundation\nimport CryptoKit\nimport WebKit\nimport UniformTypeIdentifiers\n' + decoder + loader + checks)
    subprocess.run(['swiftc', str(swift), '-o', str(path / 'check')], check=True)
    expected = 'PaliroBloomMedia/PaliroPetal' + hashlib.sha256(b'plain.txt').hexdigest() + '.txt'
    bundle = project / 'PaDlroliroBox/PaDlroliroBox/PaliroPetalGarden'
    web_source = project / 'ParamoboaxsDak/public'
    manifest = []
    matched = set()
    for resource in web_source.rglob('*'):
        if not resource.is_file():
            continue
        logical = resource.relative_to(web_source).as_posix()
        physical = 'PaliroPetal' + hashlib.sha256(logical.encode()).hexdigest() + resource.suffix
        packaged = bundle / 'PaliroBloomMedia' / physical
        if packaged.is_file():
            manifest.append({'logical': logical, 'digest': hashlib.sha256(packaged.read_bytes()).hexdigest()})
            matched.add(physical)
    assert matched == {file.name for file in (bundle / 'PaliroBloomMedia').iterdir() if file.is_file()}
    manifest_path = path / 'manifest.json'
    manifest_path.write_text(json.dumps(manifest))
    subprocess.run([str(path / 'check'), str(bundle / 'PaliroDewArchive/PaliroFirstBloom.pwb'), expected, str(bundle), str(manifest_path)], check=True)
