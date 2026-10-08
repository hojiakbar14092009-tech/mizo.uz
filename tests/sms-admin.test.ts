import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { mkdtempSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { NextRequest } from 'next/server'
import { reminderDaysLeft } from '../lib/reminder-dates'

let dir: string
let prisma: typeof import('../lib/prisma').prisma
let send: typeof import('../app/api/sms/reminder/[id]/route')
let logs: typeof import('../app/api/sms/logs/route')
let due: typeof import('../app/api/user/reminders/due/route')
let tips: typeof import('../app/api/admin/tips/route')
let tip: typeof import('../app/api/admin/tips/[id]/route')
let stats: typeof import('../app/api/admin/stats/route')
let sms: typeof import('../lib/sms')
let cookies: Record<string, string>
const originalProvider = process.env.SMS_PROVIDER

function request(path: string, method = 'GET', user = 'owner', body?: unknown) {
  return new NextRequest(`http://localhost:3000/api/${path}`, {
    method, headers: { Cookie: cookies[user] ?? '', 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

before(async () => {
  dir = mkdtempSync(resolve('tests/sms-db-'))
  process.env.DATABASE_URL = `file:${join(dir, 'test.db').replaceAll('\\', '/')}`
  process.env.SMS_PROVIDER = 'mock'
  const setup = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], {
    env: { ...process.env, RUST_LOG: 'info' }, encoding: 'utf8',
  })
  assert.equal(setup.status, 0, setup.stdout + setup.stderr)
  prisma = (await import('../lib/prisma')).prisma
  const { sign } = await import('../lib/jwt')
  cookies = {}
  for (const [id, role, isBlocked] of [['owner', 'USER', false], ['other', 'USER', false], ['admin', 'ADMIN', false], ['blocked', 'ADMIN', true]] as const) {
    await prisma.user.create({ data: { id, role, isBlocked, email: `${id}@example.test`, passwordHash: 'test-only', birthDate: new Date('1990-01-01') } })
    cookies[id] = `mz_token=${await sign({ sub: id, role })}`
  }
  await prisma.paymentReminder.createMany({ data: [
    { id: 'owned', userId: 'owner', name: 'Ipoteka', amount: 1500000, dayOfMonth: 5, phone: '+998901234567' },
    { id: 'foreign', userId: 'other', name: 'Private', amount: 100, dayOfMonth: 1, phone: '+998935554433' },
    { id: 'invalid-phone', userId: 'owner', name: 'No phone', amount: 100, dayOfMonth: 1 },
  ] })
  await prisma.communityTip.createMany({ data: [
    { id: 'shown', userId: 'owner', category: 'BUDGET', title: 'Budget tip', content: 'Plan monthly spending.' },
    { id: 'hidden', userId: 'other', category: 'GOAL', title: 'Hidden tip', content: 'Needs review.', isHidden: true },
  ] })
  send = await import('../app/api/sms/reminder/[id]/route')
  logs = await import('../app/api/sms/logs/route')
  due = await import('../app/api/user/reminders/due/route')
  tips = await import('../app/api/admin/tips/route')
  tip = await import('../app/api/admin/tips/[id]/route')
  stats = await import('../app/api/admin/stats/route')
  sms = await import('../lib/sms')
})

after(async () => {
  if (prisma) await prisma.$disconnect()
  if (originalProvider === undefined) delete process.env.SMS_PROVIDER
  else process.env.SMS_PROVIDER = originalProvider
  if (dir) {
    for (const file of readdirSync(dir)) unlinkSync(join(dir, file))
    rmdirSync(dir)
  }
})

test('due dates use Tashkent calendar, clamp month end and preserve overdue dates', () => {
  assert.equal(reminderDaysLeft(5, new Date('2026-10-08T12:00:00Z')), -3)
  assert.equal(reminderDaysLeft(11, new Date('2026-10-08T12:00:00Z')), 3)
  assert.equal(reminderDaysLeft(31, new Date('2026-02-26T12:00:00Z')), 2)
  assert.equal(reminderDaysLeft(31, new Date('2028-02-26T12:00:00Z')), 3)
  assert.equal(reminderDaysLeft(1, new Date('2026-10-31T20:00:00Z')), 0)
  assert.throws(() => reminderDaysLeft(0), RangeError)
})

test('SMS and moderation enforce identity, ownership, validation and limits', async t => {
  await t.test('anonymous and blocked users cannot access SMS, due reminders or moderation', async () => {
    for (const user of ['anonymous', 'blocked']) {
      for (const handler of [logs.GET, due.GET, tips.GET, stats.GET]) {
        assert.equal((await handler(request('sms/logs', 'GET', user))).status, 401)
      }
      assert.equal((await send.POST(request('sms/reminder/owned', 'POST', user), { params: Promise.resolve({ id: 'owned' }) })).status, 401)
    }
  })
  await t.test('SMS does not expose another users reminder or accept invalid phone numbers', async () => {
    for (const id of ['foreign', 'missing']) {
      assert.equal((await send.POST(request(`sms/reminder/${id}`, 'POST'), { params: Promise.resolve({ id }) })).status, 404)
    }
    assert.equal((await send.POST(request('sms/reminder/invalid-phone', 'POST'), { params: Promise.resolve({ id: 'invalid-phone' }) })).status, 400)
    assert.equal(await prisma.smsLog.count(), 0)
  })
  await t.test('mock SMS persists the exact message, returns demo and limits to three per minute', async () => {
    for (let n = 0; n < 3; n++) {
      const response = await send.POST(request('sms/reminder/owned', 'POST'), { params: Promise.resolve({ id: 'owned' }) })
      assert.equal(response.status, 200)
      const result = await response.json()
      assert.equal(result.demo, true)
      assert.equal(result.sms.phone, '+998901234567')
      assert.equal(result.sms.body, "Mizo: Ipoteka bo'yicha 1500000 so'm to'lov muddati har oyning 5-sanasida. mizo.uz")
      assert.ok(result.sms.id)
      assert.ok(result.sms.createdAt)
    }
    const blocked = await send.POST(request('sms/reminder/owned', 'POST'), { params: Promise.resolve({ id: 'owned' }) })
    assert.equal(blocked.status, 429)
    assert.equal((await blocked.json()).error.code, 'RATE_LIMITED')
    assert.equal(await prisma.smsLog.count({ where: { userId: 'owner', status: 'SENT', provider: 'mock', reminderId: 'owned' } }), 3)
  })
  await t.test('unsupported providers never silently send or create successful logs', async () => {
    process.env.SMS_PROVIDER = 'real'
    await assert.rejects(() => sms.sendSms({ userId: 'other', phone: '+998935554433', body: 'Test' }), { code: 'SMS_PROVIDER_UNAVAILABLE' })
    assert.equal(await prisma.smsLog.count({ where: { userId: 'other' } }), 0)
    process.env.SMS_PROVIDER = 'mock'
  })
  await t.test('logs return only the current users latest twenty entries', async () => {
    await prisma.smsLog.createMany({ data: Array.from({ length: 22 }, (_, index) => ({ userId: 'other', phone: '+998935554433', body: `message-${index}`, status: 'SENT', provider: 'mock', createdAt: new Date(2026, 0, index + 1) })) })
    const response = await logs.GET(request('sms/logs', 'GET', 'other'))
    const data = await response.json()
    assert.equal(data.logs.length, 20)
    assert.equal(data.logs[0].body, 'message-21')
    assert.ok(data.logs.every((row: { userId: string }) => row.userId === 'other'))
  })
  await t.test('due reminders contain no other users data and no dates beyond three days', async () => {
    const response = await due.GET(request('user/reminders/due'))
    const data = await response.json()
    assert.ok(Array.isArray(data))
    assert.ok(data.every((row: { userId: string; daysLeft: number }) => row.userId === 'owner' && row.daysLeft <= 3))
    assert.ok(data.some((row: { id: string }) => row.id === 'invalid-phone'))
  })
  await t.test('admin can list hidden posts and hide or unhide with boolean validation', async () => {
    assert.equal((await tips.GET(request('admin/tips'))).status, 403)
    const listed = await (await tips.GET(request('admin/tips', 'GET', 'admin'))).json()
    assert.equal(listed.tips.length, 2)
    assert.ok(listed.tips.some((item: { isHidden: boolean }) => item.isHidden))
    const context = { params: Promise.resolve({ id: 'shown' }) }
    assert.equal((await tip.PATCH(request('admin/tips/shown', 'PATCH', 'owner', { isHidden: true }), context)).status, 403)
    assert.equal((await tip.PATCH(request('admin/tips/shown', 'PATCH', 'admin', { isHidden: 'true' }), context)).status, 400)
    const malformed = new NextRequest('http://localhost/api/admin/tips/shown', { method: 'PATCH', headers: { Cookie: cookies.admin }, body: '{' })
    assert.equal((await tip.PATCH(malformed, context)).status, 400)
    for (const isHidden of [true, false]) {
      const response = await tip.PATCH(request('admin/tips/shown', 'PATCH', 'admin', { isHidden }), context)
      assert.equal(response.status, 200)
      assert.equal((await response.json()).tip.isHidden, isHidden)
      assert.equal((await prisma.communityTip.findUniqueOrThrow({ where: { id: 'shown' } })).isHidden, isHidden)
    }
    assert.equal((await tip.PATCH(request('admin/tips/missing', 'PATCH', 'admin', { isHidden: true }), { params: Promise.resolve({ id: 'missing' }) })).status, 404)
  })
  await t.test('stats average only current-month snapshots and count hidden tips too', async () => {
    const { currentMonth } = await import('../lib/health-score')
    const empty = await (await stats.GET(request('admin/stats', 'GET', 'admin'))).json()
    assert.equal(empty.avgHealthScore, 0)
    await prisma.healthSnapshot.createMany({ data: [
      { userId: 'owner', month: currentMonth(), score: 60, inputs: '{}', breakdown: '{}' },
      { userId: 'other', month: currentMonth(), score: 81, inputs: '{}', breakdown: '{}' },
      { userId: 'owner', month: '2000-01', score: 1, inputs: '{}', breakdown: '{}' },
    ] })
    const data = await (await stats.GET(request('admin/stats', 'GET', 'admin'))).json()
    assert.equal(data.avgHealthScore, 70.5)
    assert.equal(data.tipsCount, 2)
    assert.equal(data.totalUsers, 4)
    assert.ok('queryBreakdown' in data)
    assert.ok('totalSavedAmount' in data)
  })
})
