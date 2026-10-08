export const ApiErrors = {
  AGE_RESTRICTION: { status: 403, code: 'AGE_RESTRICTION', message: 'Mizo platformasidan faqat 18 yoshdan katta fuqarolar foydalana oladi.' },
  PNFL_INVALID: { status: 400, code: 'PNFL_INVALID', message: "JShShIR noto'g'ri formatda." },
  WEAK_PASSWORD: { status: 400, code: 'WEAK_PASSWORD', message: "Parol kamida 8 ta belgi, 1 katta va 1 kichik harf bo'lishi shart." },
  DUPLICATE_USER: { status: 409, code: 'DUPLICATE_USER', message: "Bu email yoki JShShIR allaqachon ro'yxatdan o'tgan." },
  INVALID_CREDS: { status: 401, code: 'INVALID_CREDENTIALS', message: "Email/JShShIR yoki parol noto'g'ri." },
  BLOCKED: { status: 403, code: 'ACCOUNT_BLOCKED', message: 'Hisobingiz bloklangan.' },
  UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED', message: 'Kirish talab etiladi.' },
  BAD_REQUEST: { status: 400, code: 'BAD_REQUEST', message: "So'rov ma'lumotlari noto'g'ri." },
  NOT_FOUND: { status: 404, code: 'NOT_FOUND', message: 'Maʼlumot topilmadi.' },
} as const

export function errorResponse(e: typeof ApiErrors[keyof typeof ApiErrors]) {
  return Response.json({ error: e }, { status: e.status })
}
