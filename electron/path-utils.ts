import { pathToFileURL } from 'url'

/**
 * Resolve solum-media:// URL to a file:/// URL
 */
export function resolveMediaUrl(urlStr: string): string {
  let resolved = urlStr.replace(/^solum-media:\/\/*/, 'file:///')
  
  // If the colon was stripped from the Windows drive letter, restore it
  // e.g. file:///c/Users/... -> file:///c:/Users/...
  if (/^file:\/\/\/[a-zA-Z]\//.test(resolved)) {
    resolved = resolved.replace(/^file:\/\/\/[a-zA-Z]/, (match) => match + ':')
  }
  
  try {
    const fileSchemePrefix = 'file:///'
    if (resolved.startsWith(fileSchemePrefix)) {
      const pathPart = decodeURIComponent(resolved.substring(fileSchemePrefix.length))
      
      let absolutePath = pathPart
      // On Unix, absolute path must start with a slash
      if (!/^[a-zA-Z]:/.test(absolutePath) && process.platform !== 'win32') {
        if (!absolutePath.startsWith('/')) {
          absolutePath = '/' + absolutePath
        }
      }
      
      // If we are on Windows and testing or handling a Unix-like path,
      // manually encode it to avoid pathToFileURL prepending the C: drive letter.
      if (process.platform === 'win32' && !/^[a-zA-Z]:/.test(absolutePath)) {
        const parts = absolutePath.split('/').map(encodeURIComponent)
        return 'file:///' + parts.join('/')
      }
      
      const urlObj = pathToFileURL(absolutePath)
      return urlObj.toString()
    }
  } catch (e) {
    // Ignore and fallback
  }
  
  return resolved
}

