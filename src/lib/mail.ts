const BASE_URL = (process.env.CLOUDMAIL_BASE_URL || 'https://mail.akadnya.com/api').replace(/\/$/, '')
const ENABLED = process.env.CLOUDMAIL_ENABLED === 'true'

let cachedToken: string | null = null

function apiUrl(path: string) {
  return `${BASE_URL}${path}`
}

async function login(): Promise<string> {
  const email = process.env.CLOUDMAIL_EMAIL
  const password = process.env.CLOUDMAIL_PASSWORD
  if (!email || !password) throw new Error('CloudMail credentials are not configured')

  const res = await fetch(apiUrl('/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json().catch(() => ({}))
  const token = json?.data?.token
  if (!res.ok || typeof token !== 'string' || !token) {
    throw new Error(`CloudMail login failed (${res.status}): ${json?.message || 'no token'}`)
  }
  return token
}

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken
  cachedToken = await login()
  return cachedToken
}

async function accountIdFor(fromEmail: string, token: string): Promise<number> {
  const res = await fetch(apiUrl('/account/list?size=200'), {
    headers: { Authorization: token, Accept: 'application/json' },
  })
  const json = await res.json().catch(() => ({}))
  let rows = json?.data
  if (rows && !Array.isArray(rows) && Array.isArray(rows.list)) rows = rows.list
  const account = (rows || []).find(
    (a: { email?: string }) => (a.email || '').toLowerCase() === fromEmail.toLowerCase()
  )
  if (!account) throw new Error(`CloudMail sender account [${fromEmail}] not found`)
  return Number(account.accountId)
}

async function sendOnce(
  fromEmail: string,
  to: string,
  subject: string,
  html: string,
  text?: string,
  fromName?: string
): Promise<void> {
  const token = await getToken()
  const accountId = await accountIdFor(fromEmail, token)
  const res = await fetch(apiUrl('/email/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token, Accept: 'application/json' },
    body: JSON.stringify({
      accountId,
      receiveEmail: [to],
      subject,
      content: html,
      ...(text ? { text } : {}),
      name: fromName || undefined,
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (res.status === 401) cachedToken = null
  if (!res.ok || (json?.code && json.code !== 200)) {
    throw new Error(`CloudMail send failed (${res.status}): ${json?.message || 'unknown error'}`)
  }
}

export type MailInput = {
  to: string
  subject: string
  html: string
  text?: string
  sender?: string
  fromName?: string
}

export async function sendMail(input: MailInput): Promise<void> {
  const fromEmail = input.sender || process.env.CLOUDMAIL_SENDER_REGISTRATION || ''

  if (!ENABLED) {
    console.log(`[mail:disabled] to=${input.to} subject="${input.subject}"`)
    return
  }

  try {
    await sendOnce(fromEmail, input.to, input.subject, input.html, input.text, input.fromName)
  } catch (error) {
    if (cachedToken) {
      cachedToken = null
      await sendOnce(fromEmail, input.to, input.subject, input.html, input.text, input.fromName)
      return
    }
    throw error
  }
}

export function verificationEmail(name: string | null, url: string) {
  const safeName = name || 'Pengguna'
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#141F1A">
      <h1 style="font-size:22px">Verifikasi Email KasirPro</h1>
      <p>Halo ${safeName},</p>
      <p>Terima kasih sudah mendaftar KasirPro. Klik tombol di bawah untuk mengaktifkan akun kamu.</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#fbbf24;color:#111827;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Verifikasi Email</a>
      </p>
      <p style="font-size:13px;color:#6b7280">Atau salin link ini: <a href="${url}">${url}</a></p>
      <p style="font-size:13px;color:#6b7280">Link berlaku 60 menit. Periksa folder Spam/Promosi bila email tidak muncul.</p>
    </div>`
  const text = `Halo ${safeName},\n\nVerifikasi email kamu melalui link berikut (berlaku 60 menit):\n${url}\n`
  return { subject: 'Verifikasi Email KasirPro', html, text }
}
