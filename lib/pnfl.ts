export interface PNFLResult {
  birthDate: Date
  gender: 'M' | 'F'
  century: 1900 | 2000
}

export function parsePNFL(pnfl: string): PNFLResult | null {
  if (!/^\d{14}$/.test(pnfl)) return null
  const d1 = Number(pnfl[0])
  if (d1 < 1 || d1 > 4) return null
  const gender: 'M' | 'F' = d1 % 2 === 1 ? 'M' : 'F'
  const century = d1 <= 2 ? 1900 : 2000
  const day = Number(pnfl.slice(1, 3))
  const month = Number(pnfl.slice(3, 5)) - 1
  const year = century + Number(pnfl.slice(5, 7))
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null
  if (date > new Date()) return null
  return { birthDate: date, gender, century }
}

export function getAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}
