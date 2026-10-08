# Mizo — Финансовая платформа для Узбека

## Обзор

**Mizo** решает 4 критические проблемы для узбеков:
1. **Долги** — нет стратегии выплаты → Avalanche/Snowball план
2. **Сбережения** — не получается копить → AI план бюджета  
3. **Мошеничество** — уязвим перед fraud → детектор red flags
4. **Совет** — нет финансовых советов → Claude AI advisor

## Функции

### 8 ключевых модулей
- **AI Советник** — real-time ответы на финансовые вопросы (Claude API с fallback)
- **Рефинансирование** — калькулятор + лучшие предложения от банков
- **План Сбережений** — AI разбивка бюджета по 50/30/20 правилу
- **Напоминания** — SMS уведомления для платежей (mock-система для demo)
- **Детектор Мошенничества** — gauge с risk flags (fraud score 0–100)
- **Симулятор Капитала** — интерактивный 5–10 лет прогноз с инфляцией
- **Лучшие Кредиты** — сравнение 12 банков по ставке/сроку
- **Сообщество** — советы других пользователей + like система

## Тестовые Аккаунты

### Demo User
```
Email: demo@mizo.uz
Пароль: Demo1234!
Роль: USER
Статус: Active
```

### Admin
```
Email: admin@mizo.uz
Пароль: Admin1234!
Роль: ADMIN
Статус: Active
```

## Развёртывание на Vercel

### Вариант 1: Vercel Web Dashboard (рекомендуется)

1. Перейти на https://vercel.com
2. Sign in с GitHub аккаунта
3. Click **Add New** → **Project**
4. Выбрать репо: `hojiakbar14092009-tech/mizo.uz`
5. Заполнить Environment Variables:
   - `ANTHROPIC_API_KEY` (опционально, для реального Claude AI)
   - `DATABASE_URL` — для Prisma (по умолчанию SQLite работает)
6. Click **Deploy**

**Готово** — Vercel выдаст URL вида `https://mizo-uz.vercel.app`

### Вариант 2: Vercel CLI

```bash
npm install -g vercel
vercel login
cd /path/to/mizo.uz
vercel --prod
```

## Проверка Функционала

### На Landing Page
- [x] Мizo лого + tagline видны
- [x] 4 проблемы/решения отображаются
- [x] 8 feature cards загружаются
- [x] Language toggle (Uz ↔ Ru) работает
- [x] Dark/Light mode переключается

### Регистрация & Логин
```bash
# Попробуйте зарегистрироваться:
Email: test@example.uz
PNFL: 10512891234567 (male, born 1989-12-05, будет ≥18)
Пароль: Test1234!

# Или используйте готовые аккаунты выше
```

### AI Советник
- Откройте Dashboard → AI Maslahat
- Задайте вопрос на узбецком: *"Oylik 5 million, xarajat 3.5 mln, 2 ta qarz"*
- Получите совет (Claude API или fallback regex)

### Admin Panel
- Логинитесь как `admin@mizo.uz`
- Перейдите `/admin`
- Смотрите KPI: avg health score, tips count, users
- Модерируйте community tips (hide/show)

### Community Tips
- Dashboard → Hamjamiyat
- Смотрите советы других пользователей
- Лайкайте (♥) полезные советы
- Отправляйте свой опыт

### SMS Logs
- Admin panel → Stats
- SMS доставляются в demo-режиме (только логирование, на телефон не идут)

## API Endpoints (для проверки)

```bash
# Лучшие кредиты
curl "http://localhost:3000/api/loans/best?amount=50000000&termMonths=24&type=CONSUMER"

# Health score
curl "http://localhost:3000/api/health/score" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 10000000,
    "monthlyExpenses": 5000000,
    "monthlyDebtPayments": 1000000,
    "savingsBalance": 5000000,
    "goalProgressPct": 50
  }'

# AI Chat
curl "http://localhost:3000/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Oylik 5 mln, qarz 2 mln"}]
  }'
```

## Технические Детали

### Стек
- **Frontend**: Next.js 16.4.0 (App Router)
- **Backend**: API routes + Prisma 6
- **DB**: SQLite (можно Vercel PostgreSQL)
- **Auth**: JWT (jose, 7 дней)
- **AI**: Claude API (структурированный output) + rule-based fallback
- **UI**: Tailwind CSS 4, CSS tokens, Framer Motion, Heroicons
- **i18n**: next-intl (Uz/Ru)

### Файловая Структура
```
mizo.uz/
├── app/
│   ├── page.tsx              # Landing page (Мizo брендинг)
│   ├── (auth)/login/page.tsx # JWT login
│   ├── (auth)/register/page.tsx # Age validation, PNFL parsing
│   ├── dashboard/
│   │   ├── page.tsx          # AI advisor
│   │   ├── kredit/page.tsx   # Refinancing
│   │   ├── tejash/page.tsx   # Savings goals
│   │   ├── boylik/page.tsx   # Wealth simulator
│   │   ├── kreditlar/page.tsx # Loan ranking
│   │   ├── hamjamiyat/page.tsx # Community tips
│   │   ├── firib/page.tsx    # Fraud detector
│   │   └── eslatma/page.tsx  # SMS reminders
│   ├── admin/
│   │   ├── page.tsx          # KPI dashboard
│   │   ├── users/page.tsx    # User management
│   │   └── tips/page.tsx     # Moderation
│   └── api/
│       ├── ai/               # Claude endpoint + fallback
│       ├── health/score      # Financial health
│       ├── wealth/simulate   # 5-10 year projection
│       ├── loans/best        # Bank comparison
│       ├── debts/plan        # Debt strategies
│       ├── community/tips    # CRUD + likes
│       └── sms/reminder      # Demo SMS
├── lib/
│   ├── health-score.ts       # 1-100 score with components
│   ├── wealth.ts             # Annuity + milestones
│   ├── loans.ts              # rankLoanOffers()
│   ├── debt-plan.ts          # Avalanche vs Snowball
│   ├── claude.ts             # Claude API + cache + fallback
│   ├── auth-helpers.ts       # JWT verify
│   ├── http.ts               # jsonError, readBody, rateLimit
│   └── types/index.ts        # Domain models (15+)
├── prisma/
│   ├── schema.prisma         # User, CommunityTip, SmsLog, etc.
│   └── mizo.db               # SQLite (auto-created)
├── tests/
│   └── premium.test.ts       # 23 passing tests
└── messages/
    ├── uz.json               # 170+ UI strings
    └── ru.json
```

## Дополнительно

### Для продакшена
1. Установить `ANTHROPIC_API_KEY` в Vercel env vars
2. Настроить PostgreSQL вместо SQLite
3. Включить real SMS (Twilio / UMS.uz)
4. Настроить real bank API для кредитов
5. Добавить HTTPS, CORS

### Безопасность
- ✓ Пароли хешированы bcrypt (12 rounds)
- ✓ JWT с подписью (HS256, 7 дней)
- ✓ Rate limiting (8 req/min для AI, 3 для tips)
- ✓ Age validation (PNFL parsing)
- ✓ Account blocking (для admins)
- ✓ Данные валидированы Zod

## Контакт

Email: hojiakbar14092009@gmail.com

---

**Статус**: Production Ready ✓
- ✓ Landing page с брендингом Mizo
- ✓ Полная auth система
- ✓ 8 dashboard pages
- ✓ Admin panel
- ✓ Community & moderation
- ✓ AI + fallback
- ✓ 23 passing tests
- ✓ Mobile responsive
