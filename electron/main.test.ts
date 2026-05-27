import { describe, it, expect } from 'vitest'
import { resolveMediaUrl } from './path-utils'

describe('resolveMediaUrl', () => {
  it('should properly resolve Windows absolute paths', () => {
    // Windows path with a drive letter should preserve the drive letter and start with file:///
    const input = 'solum-media://C:/Users/tanas/Desktop/dos/vaults/Inspiration/image.png'
    const resolved = resolveMediaUrl(input)
    expect(resolved).toBe('file:///C:/Users/tanas/Desktop/dos/vaults/Inspiration/image.png')
  })

  it('should properly resolve Unix absolute paths', () => {
    // Unix path should have a single slash after file://, resolving to file:///Users/...
    const input = 'solum-media:///Users/tanas/Desktop/dos/vaults/Inspiration/image.png'
    const resolved = resolveMediaUrl(input)
    expect(resolved).toBe('file:///Users/tanas/Desktop/dos/vaults/Inspiration/image.png')
  })

  it('should preserve URL encoded characters like spaces for valid URLs', () => {
    const input = 'solum-media://C:/Users/tanas/My%20Inspiration/image.png'
    const resolved = resolveMediaUrl(input)
    expect(resolved).toBe('file:///C:/Users/tanas/My%20Inspiration/image.png')
  })

  it('should restore the colon on Windows if stripped by url parsing', () => {
    const input = 'solum-media://c/Users/tanas/Desktop/dos/vaults/Inspiration/image.png'
    const resolved = resolveMediaUrl(input)
    expect(resolved).toBe('file:///c:/Users/tanas/Desktop/dos/vaults/Inspiration/image.png')
  })

  it('should resolve Windows absolute path with 3-slashes correctly', () => {
    const input = 'solum-media:///C:/Users/tanas/Desktop/dos/vaults/Inspiration/image.png'
    const resolved = resolveMediaUrl(input)
    expect(resolved).toBe('file:///C:/Users/tanas/Desktop/dos/vaults/Inspiration/image.png')
  })
})
