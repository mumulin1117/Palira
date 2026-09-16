import { readFileSync as readFile } from 'node:fs'

const quoted = '"(?:\\\\.|[^"\\\\])*"'
const call = `(?:PaliroPetalWeave\\.gentleUnfold|PalirodreamyWonder\\.thoughtfulFeelingPalette)\\((${quoted})\\)`
const value = literal => literal.slice(1, -1).replace(/\\(?:u\{([\da-fA-F]+)\}|([0nrt"'\\]))/g,
  (_, hex, c) => hex ? String.fromCodePoint(parseInt(hex, 16)) : ({ 0: '\0', n: '\n', r: '\r', t: '\t', '"': '"', "'": "'", '\\': '\\' })[c])
const unfold = literal => [...value(literal)].filter((_, i) => i % 2 === 0).join('')
const quote = text => JSON.stringify(text).replace(/\\u0000/g, '\\0')

// Existing source-shape assertions inspect the restored strings; Swift tests execute the actual decoder.
export function restoredNativeSource(source) {
  return source
    .replace(new RegExp(`\\\\\\(${call}\\)`, 'g'), (_, literal) => quote(unfold(literal)).slice(1, -1))
    .replace(new RegExp(`(?:Character|Substring)\\(${call}\\)`, 'g'), (_, literal) => quote(unfold(literal)))
    .replace(new RegExp(call, 'g'), (_, literal) => quote(unfold(literal)))
}

export function readFileSync(path, ...options) {
  const result = readFile(path, ...options)
  return String(path).endsWith('.swift') && typeof result === 'string' ? restoredNativeSource(result) : result
}
