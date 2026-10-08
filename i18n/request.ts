import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const LOCALES = ['uz', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

// Locale lives in the 'mz_lang' cookie (no /uz /ru URL prefixes).
export default getRequestConfig(async () => {
  const store = await cookies()
  const locale: Locale = store.get('mz_lang')?.value === 'ru' ? 'ru' : 'uz'
  const messages = (await import(`../messages/${locale}.json`)).default as Record<string, unknown>
  return { locale, messages }
})
