import 'server-only'

type Email = { to: string | string[]; subject: string; text: string; html?: string; replyTo?: string }

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Plain key/value email body, escaped for HTML. */
export function detailsHtml(title: string, rows: [string, string | null | undefined][]): string {
  const body = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#8a8478;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v!)}</td></tr>`)
    .join('')
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#2c2920"><h2 style="font-size:18px">${escapeHtml(title)}</h2><table>${body}</table></div>`
}

export function detailsText(title: string, rows: [string, string | null | undefined][]): string {
  return [title, '', ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join('\n')
}

/**
 * Sends through Resend's REST API. Without RESEND_API_KEY (local dev) the email is logged and skipped;
 * failures never break the form that triggered them.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'Grupo IHO <no-reply@iho.com.mx>'
  if (!key) {
    console.info(`[email skipped: RESEND_API_KEY not set] ${email.subject} → ${[email.to].flat().join(', ')}`)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email.to].flat(), subject: email.subject, text: email.text, html: email.html, reply_to: email.replyTo }),
    })
    if (!res.ok) console.error(`[email] Resend responded ${res.status}: ${await res.text()}`)
    return res.ok
  } catch (error) {
    console.error('[email] send failed', error)
    return false
  }
}

/** Inbox that receives a country's notifications: `countries.email`, else CONTACT_NOTIFY_EMAIL. */
export function notificationInbox(countryEmail: string | null | undefined): string | null {
  return countryEmail || process.env.CONTACT_NOTIFY_EMAIL || null
}
