export async function AddHash (entry) {
  const file = await entry.handle.getFile()
  entry.hash = await getChecksumSha256(file)
}

export async function getChecksumSha256 (blob) {
  const uint8Array = new Uint8Array(await blob.arrayBuffer())
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', uint8Array)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((h) => h.toString(16).padStart(2, '0')).join('')
}

export async function listAllFilesAndDirs (dirHandle) {
  console.log(dirHandle)
  const files = []
  for await (const [name, handle] of dirHandle) {
    const { kind } = handle
    if (handle.kind === 'directory') {
      // files.push({name, handle, kind})
      files.push(...await listAllFilesAndDirs(handle))
    } else {
      const entry = { name, handle, kind, size: -1, hash: '', sizeEx: false }
      const file = await handle.getFile()
      entry.size = file.size
      // entry.hash = await getChecksumSha256(file)
      files.push(entry)
    }
  }
  return files
}

// inspired from: https://stackoverflow.com/a/18650828/6355502
export function formatBytes (a, b = 2) {
  if (!a) return '0 Bytes'

  const d = Math.floor(Math.log(a) / Math.log(1024))
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(b))} ${
    ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'][d]
  }`
}
