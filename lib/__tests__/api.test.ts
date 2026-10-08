import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { mkdtempSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

let databaseDir: string | undefined
let prisma: typeof import('../prisma').prisma
let register: typeof import('../../app/api/auth/register/route')
let login: typeof import('../../app/api/auth/login/route')
let logout: typeof import('../../app/api/auth/logout/route')
let me: typeof import('../../app/api/auth/me/route')
let queries: typeof import('../../app/api/user/queries/route')
let goals: typeof import('../../app/api/user/goals/route')
let reminders: typeof import('../../app/api/user/reminders/route')
let stats: typeof import('../../app/api/admin/stats/route')
let users: typeof import('../../app/api/admin/users/route')
let userDetail: typeof import('../../app/api/admin/users/[id]/route')

function request(path: string, method = 'GET', body?: unknown, cookie = '') {
  return new NextRequest(`http://localhost:3000/api/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

function cookieFrom(response: Response) {
  const cookie = response.headers.get('set-cookie')
  assert.ok(cookie)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Lax/)
  return cookie.split(';')[0]
}

before(async () => {
  databaseDir = mkdtempSync(resolve('lib/__tests__/db-'))
  const url = `file:${relative(resolve('prisma'), join(databaseDir, 'test.db')).replaceAll('\\', '/')}`
  process.env.DATABASE_URL = url
  const pushed = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], {
    // Prisma reads the engine's P1003 log to decide whether to create a new DB.
    // Do not inherit a logging filter that hides that message from its CLI.
    env: { ...process.env, DATABASE_URL: url, RUST_LOG: 'info' }, encoding: 'utf8',
  })
  assert.equal(pushed.status, 0, pushed.stdout + pushed.stderr)
  register = await import('../../app/api/auth/register/route')
  login = await import('../../app/api/auth/login/route')
  logout = await import('../../app/api/auth/logout/route')
  me = await import('../../app/api/auth/me/route')
  queries = await import('../../app/api/user/queries/route')
  goals = await import('../../app/api/user/goals/route')
  reminders = await import('../../app/api/user/reminders/route')
  stats = await import('../../app/api/admin/stats/route')
  users = await import('../../app/api/admin/users/route')
  userDetail = await import('../../app/api/admin/users/[id]/route')
  const prismaModule = await import('../prisma')
  prisma = prismaModule.prisma
  assert.equal(await prisma.user.count(), 0)
})

after(async () => {
  if (prisma) await prisma.$disconnect()
  if (databaseDir) {
    for (const file of readdirSync(databaseDir)) unlinkSync(join(databaseDir, file))
    rmdirSync(databaseDir)
  }
})

test('API authentication, persistence, ownership and admin workflow', async (t) => {
  let cookie = ''
  let userId = ''
  let adminCookie = ''
  const credentials = { method: 'email', email: 'owner@example.test', password: 'Testing123!', confirmPassword: 'Testing123!', birthDate: '2000-03-20' }

  await t.test('anonymous requests cannot access user data', async () => {
    for (const handler of [me.GET, queries.GET, goals.GET, reminders.GET, stats.GET, users.GET]) {
      assert.equal((await handler(request('user/goals'))).status, 401)
    }
  })
  await t.test('registration rejects malformed, missing, underage and invalid-date inputs', async () => {
    assert.equal((await register.POST(new NextRequest('http://localhost/api/auth/register', { method: 'POST', body: '{' }))).status, 400)
    assert.equal((await register.POST(request('auth/register', 'POST', {}))).status, 400)
    assert.equal((await register.POST(request('auth/register', 'POST', { ...credentials, birthDate: '2020-01-01' }))).status, 403)
    assert.equal((await register.POST(request('auth/register', 'POST', { ...credentials, birthDate: '2000-02-30' }))).status, 400)
    assert.equal((await register.POST(request('auth/register', 'POST', { ...credentials, email: '' }))).status, 400)
    assert.equal(await prisma.user.count(), 0)
  })
  await t.test('registration returns safe user and a working session cookie', async () => {
    const response = await register.POST(request('auth/register', 'POST', credentials))
    assert.equal(response.status, 201)
    cookie = cookieFrom(response)
    const { user } = await response.json()
    userId = user.id
    assert.equal(user.email, credentials.email)
    assert.equal(user.passwordHash, undefined)
    assert.equal((await me.GET(request('auth/me', 'GET', undefined, cookie))).status, 200)
    assert.equal((await register.POST(request('auth/register', 'POST', credentials))).status, 409)
  })
  await t.test('login validates identity and password and persists last login', async () => {
    assert.equal((await login.POST(request('auth/login', 'POST', { password: credentials.password }))).status, 401)
    assert.equal((await login.POST(request('auth/login', 'POST', { ...credentials, password: 'wrong' }))).status, 401)
    const response = await login.POST(request('auth/login', 'POST', credentials))
    assert.equal(response.status, 200)
    cookie = cookieFrom(response)
    const body = await response.json()
    assert.equal(body.user.passwordHash, undefined)
    assert.ok(body.user.lastLoginAt)
    assert.ok((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).lastLoginAt)
  })
  await t.test('PNFL registration derives birth date and ignores email identity', async () => {
    const response = await register.POST(request('auth/register', 'POST', { ...credentials, method: 'pnfl', pnfl: '10512891234567' }))
    assert.equal(response.status, 201)
    const { user } = await response.json()
    assert.equal(user.pnfl, '10512891234567')
    assert.equal(user.email, null)
    assert.equal(new Date(user.birthDate).getFullYear(), 1989)
    assert.equal((await login.POST(request('auth/login', 'POST', { method: 'pnfl', pnfl: user.pnfl, password: credentials.password }))).status, 200)
  })
  await t.test('goals and reminders validate inputs and remain scoped to their owner', async () => {
    assert.equal((await goals.POST(request('user/goals', 'POST', { name: 'Bad', totalAmount: -1 }, cookie))).status, 400)
    assert.equal((await reminders.POST(request('user/reminders', 'POST', { name: 'Bad', amount: 10, dayOfMonth: 32 }, cookie))).status, 400)
    const goal = await goals.POST(request('user/goals', 'POST', { name: 'Car', totalAmount: 10000, savedAmount: 1500, userId: 'someone-else' }, cookie))
    assert.equal(goal.status, 201)
    assert.equal((await goal.json()).goal.userId, userId)
    assert.equal((await reminders.POST(request('user/reminders', 'POST', { name: 'Loan', amount: 100, dayOfMonth: 5 }, cookie))).status, 201)
    assert.equal((await (await goals.GET(request('user/goals', 'GET', undefined, cookie))).json()).goals.length, 1)
    assert.equal((await (await reminders.GET(request('user/reminders', 'GET', undefined, cookie))).json()).reminders[0].phone, '')
    const otherLogin = await login.POST(request('auth/login', 'POST', { method: 'pnfl', pnfl: '10512891234567', password: credentials.password }))
    const otherCookie = cookieFrom(otherLogin)
    assert.deepEqual((await (await goals.GET(request('user/goals', 'GET', undefined, otherCookie))).json()).goals, [])
    assert.deepEqual((await (await reminders.GET(request('user/reminders', 'GET', undefined, otherCookie))).json()).reminders, [])
  })
  await t.test('queries use language cookie and persist history with category counts', async () => {
    assert.equal((await queries.POST(request('user/queries', 'POST', { text: '' }, cookie))).status, 400)
    const response = await queries.POST(request('user/queries', 'POST', { text: 'кредит 30 млн 36% 24 месяц' }, `${cookie}; mz_lang=ru`))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).title, 'Анализ кредита')
    const history = await (await queries.GET(request('user/queries', 'GET', undefined, cookie))).json()
    assert.equal(history.items.length, 1)
    assert.equal(history.categoryCounts.CREDIT, 1)
  })
  await t.test('admin APIs reject regular users and paginate safe user data', async () => {
    assert.equal((await stats.GET(request('admin/stats', 'GET', undefined, cookie))).status, 401)
    await prisma.user.create({ data: { email: 'admin@example.test', passwordHash: await bcrypt.hash(credentials.password, 4), role: 'ADMIN', birthDate: new Date('1985-05-15') } })
    adminCookie = cookieFrom(await login.POST(request('auth/login', 'POST', { ...credentials, email: 'admin@example.test' })))
    const response = await users.GET(request('admin/users?page=1&pageSize=2', 'GET', undefined, adminCookie))
    const data = await response.json()
    assert.equal(data.total, 3)
    assert.equal(data.items.length, 2)
    assert.ok(data.items.every((u: Record<string, unknown>) => !('passwordHash' in u)))
    assert.equal((await users.GET(request('admin/users?page=-1', 'GET', undefined, adminCookie))).status, 400)
    const dataStats = await (await stats.GET(request('admin/stats', 'GET', undefined, adminCookie))).json()
    assert.equal(dataStats.totalUsers, 3)
    assert.equal(dataStats.totalSavedAmount, 1500)
    assert.equal(dataStats.queryBreakdown.CREDIT, 1)
    assert.equal(dataStats.queryBreakdown.FRAUD, 0)
  })
  await t.test('Promise params block a user and revoke existing session access', async () => {
    const context = { params: Promise.resolve({ id: userId }) }
    assert.equal((await userDetail.PATCH(request(`admin/users/${userId}`, 'PATCH', { isBlocked: true }, cookie), context)).status, 401)
    assert.equal((await userDetail.PATCH(request(`admin/users/${userId}`, 'PATCH', { isBlocked: 'true' }, adminCookie), context)).status, 400)
    const response = await userDetail.PATCH(request(`admin/users/${userId}`, 'PATCH', { isBlocked: true }, adminCookie), context)
    assert.equal(response.status, 200)
    assert.equal((await response.json()).user.isBlocked, true)
    assert.equal((await me.GET(request('auth/me', 'GET', undefined, cookie))).status, 401)
    assert.equal((await goals.GET(request('user/goals', 'GET', undefined, cookie))).status, 401)
    assert.equal((await login.POST(request('auth/login', 'POST', credentials))).status, 403)
    assert.equal((await userDetail.PATCH(request('admin/users/missing', 'PATCH', { isBlocked: true }, adminCookie), { params: Promise.resolve({ id: 'missing' }) })).status, 404)
  })
  await t.test('logout clears the session cookie', async () => {
    const response = await logout.POST()
    assert.equal(response.status, 200)
    assert.match(response.headers.get('set-cookie') ?? '', /mz_token=;.*Max-Age=0/)
  })
})
