# ANTIGRAVITY MASTER PROMPT
## Mizo Landing Page — Premium Animations & Design Overhaul

**Maqsad**: Mizo landing page (app/page.tsx)'ni premium design + chiroyli animatsiyalar bilan to'liq takomillash. Hakamlar page'ga kirganda "wow" qoʻysalar boʻladi.

---

## 1. Problems & Solutions Section — Qisqacha Maʼlumot + Animations

**Joriy holat**: 4 ta problem card bor (qarz, tejash, firibgarlik, savol)

**Yaxshi qilish**:
- Navbar tashqari hamma joyga sekin, noodatiy animatsiyalar qo'shish
- Har bir problem card'i: fade-in + slide-up animation (stagger 200-300ms)
- Problem card'i hover'da: 
  - Icon emoji bounce (scale 1 → 1.3 → 1)
  - Border glow effect (accent color)
  - Background subtle shift (bg-accent/5)
- Savolning javobini shunday ko'rsatish: problem → solution (left-to-right arrow animation)
- Misol visual:
  ```
  "Qarz yoki tejasha olmaydi?" 
       ↓ (animated arrow)
  "✅ Avalanche/Snowball reja yoki AI byudjet plan"
  ```

**Animatsiya timing**: 
- Fade-in: 0.5s ease-out
- Slide-up: 0.6s ease-out
- Hover bounce: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

---

## 2. Background Animations — Mouse Movement Tracker

**Talbular**:
- Hero section background: gradient qo'shimcha animated mesh (moving shapes)
- Mouse follow animation: background gradient subtle shift qilib qimirlaganda
- Floating elements (circles, dots) background'da slowly animate qila turishin
- Dark theme'ga moslab: neon blue/purple subtle glow

**Implementation**:
- Canvas yoki SVG animated shapes (5-8 ta floating circles, hex shapes)
- Mouse coordinates track qilib gradient translate (max 50px offset)
- CSS gradient animation (infinite, 20s loop)
- Opacity: 0.1-0.3 (subtle, not distracting)

**Colors** (dark theme):
- Gradient: #1a1a2e → #16213e → #0f3460
- Glow: cyan #60a5fa, purple #a78bfa
- Border: accent blue blend

---

## 3. User Problems — Interactive Q&A Section

**Yangi section (Problems & Solutions o'rniga yoki uning o'zida)**:

**Sarlavha**: "Saytda qanday muammolarini hal qila olasiz?"

**4-5 ta interactive cards** (click/hover qilib javob chiqadi):

```
❓ "Qarz boʻyicha qalangan?" 
→ ✅ "Avalanche/Snowball usuli bilan tez chiqing"

❓ "Tejasha olmaydi?" 
→ ✅ "AI 50/30/20 byudjet rejasi"

❓ "Firibgarlarga zaif?" 
→ ✅ "Red flags detector (risk gauge 0-100)"

❓ "Moliyaviy savol boʻlsa?" 
→ ✅ "Claude AI maslahatchi (real-time javob)"
```

**Animation**:
- Card click: expand animation (height grow, answer fade-in 0.4s)
- Card hover: subtle scale(1.02) + shadow
- Answer text: letter-spacing animation + color fade-in
- Icon rotation: 90° rotate on answer show

---

## 4. Logo — Sodda va Noodatiy Motion

**Logo change**:
- Current: "M Mizo" text
- New: Only "M" icon (stylized, clean, minimal)
- Logo should be SVG or styled component

**Logo hover animation**:
```
On hover:
  1. Rotate 360° (1s smooth cubic-bezier)
  2. Gradient color shift: blue → purple → blue cycle (2s loop on hover)
  3. Scale pulse: 1 → 1.1 → 1 (0.6s)
  4. Glow effect: box-shadow glow-in
```

**Apply globally**: 
- Header logo
- Footer logo
- All pages: same animation

**CSS Variables** (for reuse):
```css
--logo-rotation: 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
--logo-pulse: 0.6s ease-in-out;
--logo-glow: 0 0 20px rgba(96, 165, 250, 0.5);
```

---

## 5. Language Toggle Button — Premium Style

**Current**: Text button "Ру" / "Уз"

**New**: Premium styled toggle (iOS switch style)

**Design**:
```
┌─────────────────┐
│ Уз  ●     │ Ру │
└─────────────────┘
```

**Animations**:
- Toggle click: 
  - Circle slide animation (0.3s ease-out)
  - Background color shift (accent color)
  - Scale feedback on click (1 → 1.05 → 1)
- Hover: glow effect + brightness increase
- Active lang: brighter color + subtle underline animation

**Styling**:
- Background: dark gray → accent on hover
- Circle (toggle): white/light color, smooth shadow
- Transition: 0.3s ease-out

---

## 6. Login Section — Chiroyli va Animated

**Login page (app/(auth)/login/page.tsx)**:

**Page entrance**:
- Fade-in + slide-up animation (0.5s ease-out)
- Background: same animated gradient as hero

**Form elements**:
- Email/Password inputs:
  - Focus state: border glow (accent color) + icon animation (rotate)
  - Label animation: float up on focus (0.3s)
  - Error state: shake animation + red glow
- Password field: 
  - Eye icon toggle (rotate 180° on click)
  - Show/hide smooth transition
- Submit button:
  - Hover: scale(1.05) + shadow grow
  - Click: gradient animation + loading spinner
  - Success: checkmark animation + fade-out

**Register link**: 
- Underline animation on hover (left-to-right reveal)

**Modal style** (if separate modal):
- Backdrop: blur effect (backdrop-filter: blur(4px))
- Modal entrance: scale(0.9) → scale(1) fade-in

---

## 7. Overall Polish

**Page load sequence** (stagger timing):
1. Navbar: instant
2. Hero section: 0s
3. Hero text: 0.2s fade-in
4. CTA buttons: 0.4s fade-in
5. Problems section: 0.6s + stagger per card
6. Features section: 0.8s + stagger per card

**Smooth transitions**:
- Default: 0.3s ease-out
- Micro-interactions: 0.2s ease-out
- Page transitions: 0.4s ease-in-out

**Mobile optimization**:
- Touch-friendly buttons: min 48px height
- No hover animations lag (use transform + opacity only)
- Reduce animation complexity on mobile (use prefers-reduced-motion)
- Swipe animations for language toggle (optional)

**Dark theme colors**:
- Primary accent: #60a5fa (cyan/blue)
- Secondary accent: #a78bfa (purple)
- Background: #0a0a0a
- Surface: #141414
- Text: #fafafa

---

## Success Criteria ✅

- [ ] Hakamlar page'ga kirganda animations paydo bo'ladi (stagger sequence)
- [ ] Mouse move qilib background'da chiqadi (gradient shift, floating shapes)
- [ ] Problems Q&A interactive va animated (expand, color shift)
- [ ] Logo har sahifada noodatiy motion (rotate + glow + pulse)
- [ ] Til va login butonlar premium style (toggle, glow, feedback)
- [ ] Barcha animatsiyalar smooth, lag yoʻq (60fps)
- [ ] Mobile responsive, animations not breaking layout
- [ ] Dark theme vibrant va readable

---

## Tech Stack

- **Framework**: Next.js 16 + React
- **Animation**: Framer Motion (for complex sequences)
- **Styling**: Tailwind CSS 4 + CSS tokens (custom animations)
- **Icons**: Emoji (or Heroicons if preferred)
- **Fonts**: Geist (already loaded)

---

## File Structure

```
app/
├── page.tsx              # Landing page (update with animations)
├── (auth)/
│   ├── login/page.tsx    # Login page (animated)
│   └── register/page.tsx # Register page (animated)
└── components/
    ├── MizoLogo.tsx      # Logo component (global animation)
    ├── LanguageToggle.tsx# Premium toggle
    └── AnimatedCard.tsx  # Reusable card with stagger
```

---

## Notes

1. **Framer Motion library**: Already available in Next.js project
2. **CSS Animations**: Use @keyframes for infinite loops (floating shapes, gradients)
3. **Performance**: Use `will-change`, `transform`, `opacity` for animations (avoid layout shifts)
4. **Accessibility**: Add `prefers-reduced-motion` media query for users who disable animations
5. **Testing**: Test on mobile devices (especially animation performance on lower-end phones)

---

**Status**: Ready for Antigravity implementation 🚀
