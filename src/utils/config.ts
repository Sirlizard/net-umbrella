export const MAPS_KEY_STORAGE = 'net-umbrella:mapsKey'

export function getMapsApiKey(): string | undefined {
  // 1) Env from Vite
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  if (envKey && envKey.trim()) return envKey.trim()

  // 2) Window global injected at deploy time (public browser key)
  try {
    const winKey = (window as any)?.NET_UMBRELLA_MAPS_KEY as string | undefined
    if (winKey && typeof winKey === 'string' && winKey.trim()) return winKey.trim()
  } catch {}

  // 3) URL param (?mapsKey=...)
  try {
    const url = new URL(window.location.href)
    const urlKey = url.searchParams.get('mapsKey')
    if (urlKey && urlKey.trim()) {
      localStorage.setItem(MAPS_KEY_STORAGE, urlKey.trim())
      return urlKey.trim()
    }
  } catch {}

  // 4) Local storage fallback
  try {
    const stored = localStorage.getItem(MAPS_KEY_STORAGE)
    if (stored && stored.trim()) return stored.trim()
  } catch {}

  return undefined
}
