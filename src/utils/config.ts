export const MAPS_KEY_STORAGE = 'net-umbrella:mapsKey'

export function getMapsApiKey(): string | undefined {
  // 1) Env from Vite
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  if (envKey && envKey.trim()) return envKey.trim()

  // 2) URL param (?mapsKey=...)
  try {
    const url = new URL(window.location.href)
    const urlKey = url.searchParams.get('mapsKey')
    if (urlKey && urlKey.trim()) {
      localStorage.setItem(MAPS_KEY_STORAGE, urlKey.trim())
      return urlKey.trim()
    }
  } catch {}

  // 3) Local storage fallback
  try {
    const stored = localStorage.getItem(MAPS_KEY_STORAGE)
    if (stored && stored.trim()) return stored.trim()
  } catch {}

  return undefined
}
