'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UsersIcon, HeartIcon } from './HeroIcons'
import { MessageCircle, Share2, Sparkles, CheckCircle2 } from 'lucide-react'

interface CommunityTip {
  id: string
  author: {
    name: string
    avatar: string
    role: string
    reputation: number
    tipsCount: number
    verified: boolean
  }
  category: 'Kredit' | 'Jamgʻarma' | 'Byudjet' | 'Investitsiya'
  title: string
  content: string
  likes: number
  isLiked?: boolean
  commentsCount: number
  timeAgo: string
}

const INITIAL_TIPS: CommunityTip[] = [
  {
    id: 'tip-1',
    author: {
      name: 'Sherzod Aliyev',
      avatar: 'SA',
      role: 'Moliyaviy tahlilchi',
      reputation: 98,
      tipsCount: 24,
      verified: true,
    },
    category: 'Kredit',
    title: 'Kredit toʻlovini 3 kunga erta oʻtkazish siri',
    content:
      'Banklar toʻlovni hisobga olishi 1-2 ish kuni olishi mumkin. Kechikish jarimasidan saqlanish uchun toʻlovni doimo 3 kun oldin amalga oshiring. Bu kredit tarixingizni toza saqlaydi!',
    likes: 142,
    commentsCount: 18,
    timeAgo: '2 soat oldin',
  },
  {
    id: 'tip-2',
    author: {
      name: 'Malika Karimova',
      avatar: 'MK',
      role: 'Oila byudjeti boʻyicha maslahatchi',
      reputation: 94,
      tipsCount: 31,
      verified: true,
    },
    category: 'Byudjet',
    title: '50/30/20 qoidasini Oʻzbekiston sharoitiga moslash',
    content:
      'Oylik tushishi bilan 20% ni jamgʻarmaga ajratib, qolgan 80% ni asosiy va qoʻshimcha xarajatlarga boʻling. "Avval oʻzingizga toʻlang" prinsipi doimo ishlaydi.',
    likes: 219,
    commentsCount: 32,
    timeAgo: '5 soat oldin',
  },
  {
    id: 'tip-3',
    author: {
      name: 'Jasur Bekmurodov',
      avatar: 'JB',
      role: 'Kiberxavfsizlik mutaxassisi',
      reputation: 99,
      tipsCount: 42,
      verified: true,
    },
    category: 'Investitsiya',
    title: 'Telegramdagi "kuniga 20%" vaʼdalariga aldanmang',
    content:
      'Hech qanday real qonuniy investitsiya bir haftada 100% kafolatlangan foyda keltirmaydi. Yuqori daromad vaʼda qilingan joyda xavf ham shuncha yuqori boʻladi.',
    likes: 310,
    commentsCount: 45,
    timeAgo: '1 kun oldin',
  },
  {
    id: 'tip-4',
    author: {
      name: 'Nilufar Rahimova',
      avatar: 'NR',
      role: 'Foydalanuvchi',
      reputation: 85,
      tipsCount: 9,
      verified: false,
    },
    category: 'Jamgʻarma',
    title: 'Kichik summalarni sezilarsiz yigʻish',
    content:
      'Har kuni kechqurun kartangizdagi hisob qoldigʻini 10 ming soʻmgacha yaxlitlab, farqni omonatga tashlab boring. Bir oyda oʻrtacha 200-300 ming soʻm yigʻiladi!',
    likes: 95,
    commentsCount: 12,
    timeAgo: '2 kun oldin',
  },
  {
    id: 'tip-5',
    author: {
      name: 'Farrux Toʻrayev',
      avatar: 'FT',
      role: 'Bank mutaxassisi',
      reputation: 96,
      tipsCount: 19,
      verified: true,
    },
    category: 'Kredit',
    title: 'Refinansirovka qilayotganda sugʻurta summasini tekshiring',
    content:
      'Yangi bank pastroq foiz taklif qilishi mumkin, lekin majburiy sugʻurta va komissiyalarni qoʻshganda umumiy xarajatni qayta hisoblab koʻring.',
    likes: 184,
    commentsCount: 21,
    timeAgo: '3 kun oldin',
  },
  {
    id: 'tip-6',
    author: {
      name: 'Dildora Zokirova',
      avatar: 'DZ',
      role: 'Tadbirkor',
      reputation: 91,
      tipsCount: 15,
      verified: false,
    },
    category: 'Investitsiya',
    title: 'Favqulodda xavfsizlik yostigʻi (3-6 oylik xarajat)',
    content:
      'Investitsiya boshlashdan oldin kamida 3 oylik majburiy xarajatlaringizga yetadigan favqulodda pul zaxirangiz boʻlishi shart.',
    likes: 247,
    commentsCount: 29,
    timeAgo: '4 kun oldin',
  },
]

const CATEGORIES = ['Barchasi', 'Kredit', 'Jamgʻarma', 'Byudjet', 'Investitsiya'] as const

export function CommunityTips() {
  const [tips, setTips] = useState<CommunityTip[]>(INITIAL_TIPS)
  const [activeCategory, setActiveCategory] = useState<string>('Barchasi')
  const [hoveredAvatarId, setHoveredAvatarId] = useState<string | null>(null)

  // Like tugmasi va yurak animatsiyasi
  const handleLike = (id: string) => {
    setTips((prev) =>
      prev.map((tip) => {
        if (tip.id === id) {
          const isLiked = !tip.isLiked
          return {
            ...tip,
            isLiked,
            likes: isLiked ? tip.likes + 1 : tip.likes - 1,
          }
        }
        return tip
      })
    )
  }

  const filteredTips = tips.filter((tip) =>
    activeCategory === 'Barchasi' ? true : tip.category === activeCategory
  )

  const categoryBadgeColors = (cat: string) => {
    switch (cat) {
      case 'Kredit':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
      case 'Jamgʻarma':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
      case 'Byudjet':
        return 'bg-accent/15 text-accent border-accent/25 hover:bg-accent/25'
      case 'Investitsiya':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20'
      default:
        return 'bg-surface text-fg border-border'
    }
  }

  // Framer Motion variantlari (Card stagger on load)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <section className="space-y-6">
      {/* Sarlavha paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <UsersIcon className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
              Jamiyat maslahatlari (Community Tips)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Tajribali foydalanuvchilar va moliyachilardan tasdiqlangan hayotiy tavsiyalar
          </p>
        </div>

        {/* Kategoriya pill tugmalari */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-accent text-white border-accent shadow-xs'
                  : 'bg-surface text-muted border-border hover:text-fg hover:border-accent/40'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Kartalar to'plami: 1 col (mobile) → 2 col (tablet) → 3 col (desktop) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filteredTips.map((tip) => (
            <motion.div
              key={tip.id}
              layout
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative p-5 rounded-2xl bg-surface border border-border shadow-xs hover:shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Muallif va Profil Tooltip */}
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar with hover tooltip */}
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredAvatarId(tip.id)}
                      onMouseLeave={() => setHoveredAvatarId(null)}
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 text-accent font-extrabold flex items-center justify-center text-xs shadow-xs cursor-pointer hover:scale-105 transition-transform">
                        {tip.author.avatar}
                      </div>

                      {/* Profile Hover Tooltip */}
                      <AnimatePresence>
                        {hoveredAvatarId === tip.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-12 z-50 w-56 p-3.5 rounded-2xl bg-surface border border-border shadow-2xl space-y-2 pointer-events-none"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs">
                                {tip.author.avatar}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-fg flex items-center gap-1">
                                  <span>{tip.author.name}</span>
                                  {tip.author.verified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                  )}
                                </p>
                                <p className="text-[10px] text-muted">
                                  {tip.author.role}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-[11px]">
                              <div>
                                <span className="text-muted block text-[10px]">
                                  Reputatsiya:
                                </span>
                                <strong className="text-accent">
                                  {tip.author.reputation}%
                                </strong>
                              </div>
                              <div>
                                <span className="text-muted block text-[10px]">
                                  Maslahatlar:
                                </span>
                                <strong className="text-fg">
                                  {tip.author.tipsCount} ta
                                </strong>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-fg">
                          {tip.author.name}
                        </span>
                        {tip.author.verified && (
                          <CheckCircle2 className="w-3 h-3 text-accent flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted block">
                        {tip.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Kategoriya pilli (hover effect) */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${categoryBadgeColors(
                      tip.category
                    )}`}
                  >
                    {tip.category}
                  </span>
                </div>

                {/* Sarlavha va Mazmun */}
                <h3 className="font-bold text-sm text-fg leading-snug group-hover:text-accent transition-colors">
                  {tip.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-4">
                  {tip.content}
                </p>
              </div>

              {/* Pastki qism: Like button (heart animation) va sharhlar */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleLike(tip.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tip.isLiked
                      ? 'bg-danger/15 text-danger'
                      : 'text-muted hover:text-danger hover:bg-danger/10'
                  }`}
                >
                  <motion.div
                    animate={tip.isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HeartIcon
                      filled={tip.isLiked}
                      className={`w-4 h-4 ${
                        tip.isLiked ? 'text-danger' : 'currentColor'
                      }`}
                    />
                  </motion.div>
                  <span>{tip.likes}</span>
                </motion.button>

                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{tip.commentsCount}</span>
                  </span>
                  <button
                    type="button"
                    className="hover:text-fg transition-colors"
                    aria-label="Ulashish"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
export default CommunityTips
