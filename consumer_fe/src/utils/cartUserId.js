export function sameCartUserId(a, b) {
  if (a == null || b == null) return false
  return String(a) === String(b)
}
