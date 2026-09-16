"""Execute the production string decoder and persisted-value compatibility checks."""
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parents[2]
native = root / 'PaDlroliroBox/PaDlroliroBox'
samples = ['', 'a', 'English', '한국어', '中文', 'e\u0301', '👩🏽‍🚀🇰🇷', '\0\n\r\t"\\', 'bytes 0-99/100', '%@ %ld']
fixtures = [{'plain': text, 'encoded': 'Z'.join(text)} for text in samples]

def swift_value(literal):
    escapes = {'0': '\0', 'n': '\n', 'r': '\r', 't': '\t', '"': '"', "'": "'", '\\': '\\'}
    return re.sub(r'''\\(?:u\{([\da-fA-F]+)\}|([0nrt"'\\]))''',
                  lambda match: chr(int(match[1], 16)) if match[1] else escapes[match[2]], literal[1:-1])

for file in native.glob('*.swift'):
    for literal in re.findall(r'PalirodreamyWonder\.thoughtfulFeelingPalette\(("(?:\\.|[^"\\])*")\)', file.read_text()):
        encoded = swift_value(literal)
        fixtures.append({'plain': encoded[::2], 'encoded': encoded})
if len(sys.argv) > 1:
    fixtures.extend(json.loads(Path(sys.argv[1]).read_text()))

source = (native / 'PaliroQuietCove.swift').read_text()
start = source.index('private enum lucentImaginationTrail:')
end = source.index('\n    private var tranquilThoughtTrail:', start)
storage_enum = source[start:end].replace('private enum', 'enum', 1)
checks = r'''
struct Pair: Decodable { let plain: String; let encoded: String }
let pairs = try JSONDecoder().decode([Pair].self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
for pair in pairs {
    precondition(Array(PalirodreamyWonder.thoughtfulFeelingPalette(pair.encoded).utf8) == Array(pair.plain.utf8))
}
for key in ["keychain", "protectedFile"] {
    precondition(lucentImaginationTrail(rawValue: key)?.rawValue == key)
}
precondition(lucentImaginationTrail(rawValue: "invalid") == nil)
let suite = "paliro-string-test-" + UUID().uuidString
let preferences = UserDefaults(suiteName: suite)!
defer { preferences.removePersistentDomain(forName: suite) }
precondition(PaliroDawnWhisper.velvetThoughtTrail(velvetFeelingTrail: preferences, velvetReflectionTrail: ["ko-KR"]) == "ko")
precondition(PaliroDawnWhisper.velvetExpressionTrail("en", velvetFeelingTrail: preferences))
precondition(PaliroDawnWhisper.velvetThoughtTrail(velvetFeelingTrail: preferences, velvetReflectionTrail: ["ko-KR"]) == "en")
precondition(preferences.string(forKey: "paliro.launchLanguage.v1") == "en")
preferences.removePersistentDomain(forName: suite)
precondition(PaliroDawnWhisper.velvetThoughtTrail(velvetFeelingTrail: preferences, velvetReflectionTrail: []) == "en")
print("PASS \(pairs.count) exact UTF-8 string round trips; old storage values and language persistence")
'''
with tempfile.TemporaryDirectory(prefix='paliro-strings-') as directory:
    directory = Path(directory)
    main = directory / 'main.swift'
    main.write_text('import Foundation\n' + storage_enum + checks)
    data = directory / 'pairs.json'
    data.write_text(json.dumps(fixtures, ensure_ascii=False))
    binary = directory / 'check'
    subprocess.run(['swiftc', str(native / 'PalirodreamyWonder.swift'), str(native / 'PaliroDawnWhisper.swift'), str(main), '-o', str(binary)], check=True)
    subprocess.run([str(binary), str(data)], check=True)
