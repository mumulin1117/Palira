import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { restoredNativeSource } from './paliro-native-source.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const native = path.join(root, 'PaDlroliroBox/PaDlroliroBox')
const manifest = JSON.parse(readFileSync(new URL('./fixtures/paliro-eloa-strings.json', import.meta.url), 'utf8'))
const hash = value => createHash('sha256').update(value).digest('hex')
const calls = /PalirodreamyWonder\.thoughtfulFeelingPalette\(("(?:\\.|[^"\\])*")\)/g
const decodeLiteral = literal => literal.slice(1, -1).replace(/\\(?:u\{([\da-fA-F]+)\}|([0nrt"'\\]))/g,
  (_, hex, c) => hex ? String.fromCodePoint(parseInt(hex, 16))
    : ({ 0: '\0', n: '\n', r: '\r', t: '\t', '"': '"', "'": "'", '\\': '\\' })[c])
const pairs = []
const protectedValues = ['https', 'http', 'wss', 'ws', 'itms-apps', '%02x',
  'CFBundleShortVersionString', 'POST', 'application/json', 'Content-Type']

assert.deepEqual(readdirSync(path.join(native, 'PaliroEloa')).filter(file => file.endsWith('.swift')).sort(),
  Object.keys(manifest.files).sort(), 'All B-package Swift files must be audited')

for (const [file, expected] of Object.entries(manifest.files)) {
  const source = readFileSync(path.join(native, 'PaliroEloa', file), 'utf8')
  assert.equal(hash(restoredNativeSource(source)), expected.restoredSourceSha256,
    `${file}: restored source must retain the original behavior`)
  const literals = [...source.matchAll(calls)].map(match => decodeLiteral(match[1]))
  assert.equal(literals.length, expected.decodedSha256.length, `${file}: transformed string count`)
  const remaining = source.replace(calls, '__decoded__').match(/"(?:\\.|[^"\\])*"/g) ?? []
  for (const value of protectedValues) {
    assert.ok(!remaining.includes(JSON.stringify(value)), `${file}: ${value} must use the decoder, including in arrays`)
  }
  assert.deepEqual(remaining.filter(literal => !literal.includes('\\(')), expected.preservedLiterals,
    `${file}: only audited image literals may remain`)
  literals.forEach((encoded, index) => pairs.push({ encoded, expected: expected.decodedSha256[index], file }))
}

const directory = mkdtempSync(path.join(tmpdir(), 'paliro-eloa-strings-'))
try {
  const main = path.join(directory, 'main.swift')
  const input = path.join(directory, 'encoded.json')
  const executable = path.join(directory, 'decode')
  writeFileSync(main, `import Foundation
let input = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
let encoded = try JSONDecoder().decode([String].self, from: input)
let decoded = encoded.map { PalirodreamyWonder.thoughtfulFeelingPalette($0) }
FileHandle.standardOutput.write(try JSONEncoder().encode(decoded))
`)
  writeFileSync(input, JSON.stringify(pairs.map(pair => pair.encoded)))
  execFileSync('xcrun', ['swiftc', '-module-cache-path', path.join(directory, 'modules'),
    path.join(native, 'PalirodreamyWonder.swift'), main, '-o', executable], { stdio: 'inherit', timeout: 120_000 })
  const decoded = JSON.parse(execFileSync(executable, [input], { encoding: 'utf8', timeout: 30_000 }))
  assert.equal(decoded.length, pairs.length)
  decoded.forEach((value, index) => assert.equal(hash(value), pairs[index].expected,
    `${pairs[index].file}: original UTF-8 value must be unchanged`))
  for (const value of protectedValues) assert.ok(decoded.includes(value), `${value}: runtime decoding must be covered`)
  console.log(`PASS ${pairs.length} production-decoder round trips; all 10 B-package source hashes and preserved literals`)
} finally {
  rmSync(directory, { recursive: true, force: true })
}
