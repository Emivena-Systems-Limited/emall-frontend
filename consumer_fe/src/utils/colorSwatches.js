const COLOR_HEX_MAP = {
  black: '#111827',
  white: '#ffffff',
  blue: '#2563eb',
  pink: '#ec4899',
  green: '#16a34a',
  purple: '#9333ea',
  red: '#dc2626',
  grey: '#9ca3af',
  gray: '#9ca3af',
  beige: '#d6c4a8',
  yellow: '#eab308',
  orange: '#f97316',
  brown: '#92400e',
  gold: '#ca8a04',
  silver: '#cbd5e1',
  navy: '#1e3a8a',
  teal: '#0d9488',
}

export function resolveProductColor(label) {
  const normalized = String(label ?? '').trim().toLowerCase()

  if (!normalized) return '#94a3b8'
  if (['multicolor', 'multi', 'multi-color', 'multi color'].includes(normalized)) return 'multicolor'

  return COLOR_HEX_MAP[normalized] ?? '#94a3b8'
}

export function isLightProductColor(label) {
  const normalized = String(label ?? '').trim().toLowerCase()
  return ['white', 'yellow', 'beige', 'silver', 'gold'].includes(normalized)
}
