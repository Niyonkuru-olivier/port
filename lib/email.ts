import nodemailer from 'nodemailer'

type Transporter = nodemailer.Transporter | null

let cachedTransporter: Transporter

function createTransporter(): Transporter {
  // User requested these exact env vars only
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  const from = process.env.EMAIL_FROM

  if (!user || !pass || !from) {
    return null
  }

  // Gmail transporter (App Password recommended)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export function getMailer(): Transporter {
  if (cachedTransporter !== undefined) return cachedTransporter
  cachedTransporter = createTransporter()
  return cachedTransporter
}

export async function sendMail(options: {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}): Promise<{ sent: boolean; info?: any; reason?: string }> {
  const transporter = getMailer()
  const from = options.from || process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'

  if (!transporter) {
    // Fallback: log to console when SMTP is not configured
    console.log('Email (SMTP not configured) -> To:', options.to)
    console.log('Subject:', options.subject)
    console.log('Body (text):', options.text)
    console.log('Body (html):', options.html)
    return { sent: false, reason: 'SMTP not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return { sent: true, info }
  } catch (err: any) {
    console.error('Email send error:', err?.message || err)
    return { sent: false, reason: err?.message || 'Email sending failed' }
  }
}


