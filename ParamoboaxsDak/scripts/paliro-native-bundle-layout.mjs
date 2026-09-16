import { createHash } from 'node:crypto'
import { mkdir, readdir, rename, rmdir } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'

export const PALIRO_BUNDLE_DIRECTORY = 'PaliroPetalGarden'
export const PALIRO_PLAIN_DIRECTORY = 'PaliroBloomMedia'

export function paliroPhysicalResourcePath(logicalPath) {
  const digest = createHash('sha256').update(logicalPath, 'utf8').digest('hex')
  return `${PALIRO_PLAIN_DIRECTORY}/PaliroPetal${digest}${extname(logicalPath)}`
}

export async function paliroArrangePlainResources(root, logicalPaths) {
  for (const logicalPath of logicalPaths) {
    const destination = join(root, paliroPhysicalResourcePath(logicalPath))
    await mkdir(dirname(destination), { recursive: true })
    await rename(join(root, logicalPath), destination)
  }
}

export async function paliroPruneEmptyDirectories(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const directory = join(root, entry.name)
    await paliroPruneEmptyDirectories(directory)
    if ((await readdir(directory)).length === 0) await rmdir(directory)
  }
}
