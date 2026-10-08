import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePNFL, getAge } from '../pnfl'
import { calcRefi, sortAvalanche } from '../finance'
import { analyzeText } from '../ai'
import { sign, verify } from '../jwt'
import { jwtVerify } from 'jose'

test('PNFL parses seeded identity and rejects invalid dates and prefixes', () => {
  const result = parsePNFL('10512891234567')
  assert.ok(result)
  assert.equal(result.birthDate.getFullYear(), 1989)
  assert.equal(result.birthDate.getMonth(), 11)
  assert.equal(result.birthDate.getDate(), 5)
  assert.equal(result.gender, 'M')
  assert.equal(result.century, 1900)
  assert.equal(parsePNFL('13102891234567'), null)
  assert.equal(parsePNFL('50512891234567'), null)
  assert.equal(parsePNFL('abc'), null)
})

test('age respects whether birthday has happened this year', () => {
  const today = new Date()
  assert.equal(getAge(new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())), 18)
  assert.equal(getAge(new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1)), 17)
})

test('refinancing calculates monthly annuity and savings', () => {
  const result = calcRefi(30_000_000, 36, 24)
  assert.equal(result.currentMonthly, 1_771_422)
  assert.equal(result.totalSaving, result.monthlySaving * 24)
  assert.equal(result.beneficial, true)
  assert.equal(calcRefi(30_000_000, 10, 24).beneficial, false)
})

test('avalanche prioritizes rates without mutating input', () => {
  const debts = [{ name: 'A', sum: 100, rate: 10 }, { name: 'B', sum: 200, rate: 30 }]
  assert.deepEqual(sortAvalanche(debts).map(d => [d.name, d.priority, d.urgency]), [['B', 1, 'HIGH'], ['A', 2, 'MEDIUM']])
  assert.equal(debts[0].name, 'A')
})

test('analysis extracts credit data and supports Russian and fraud flags', () => {
  const credit = analyzeText('30 mln kredit 36% foiz 24 oy')
  assert.equal(credit.category, 'CREDIT')
  assert.equal(credit.creditData?.sum, 30_000_000)
  assert.equal(credit.creditData?.months, 24)
  assert.equal(credit.suggestedTab, 'kredit')
  assert.equal(analyzeText('кредит', 'ru').title, 'Анализ кредита')
  const fraud = analyzeText('kafolatlangan daromad, referral, tez boyish')
  assert.equal(fraud.category, 'FRAUD')
  assert.equal(fraud.riskLevel, 'HIGH')
  assert.equal(fraud.riskScore, 100)
  assert.equal(analyzeText('salom').category, 'BUDGET')
})

test('JWT is compatible with proxy secret, expires in seven days, and rejects tampering', async () => {
  const token = await sign({ sub: 'user-id', role: 'USER' })
  const payload = await verify(token)
  assert.equal(payload?.sub, 'user-id')
  assert.ok(Math.abs((payload?.exp ?? 0) - Date.now() / 1000 - 604800) < 5)
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'mizo-super-secret-key-change-in-production')
  assert.equal((await jwtVerify(token, secret)).payload.sub, 'user-id')
  const parts = token.split('.')
  parts[1] = Buffer.from(JSON.stringify({ sub: 'attacker', role: 'ADMIN' })).toString('base64url')
  assert.equal(await verify(parts.join('.')), null)
  assert.equal(await verify('bad-token'), null)
})
