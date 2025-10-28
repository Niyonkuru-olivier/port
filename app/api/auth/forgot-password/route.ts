import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendMail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('Forgot password endpoint hit')
    const { email } = await request.json()
    console.log('Email received:', email)

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Build base URL from request
    const proto = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${proto}://${host}`
    const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`
    
    console.log('Password reset link:', resetLink)
    console.log('Reset token expires at:', resetTokenExpires)

    // Try to email the link
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h3>Password Reset Request</h3>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#4361ee;color:#fff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `
    const mailResult = await sendMail({
      to: email,
      subject: 'StoreMIS Password Reset',
      html,
      text: `Reset your password: ${resetLink}`,
    })

    // Always return 200, include fallback link if email failed
    return NextResponse.json({
      message: mailResult.sent ? 'Password reset link emailed' : 'Email failed. Use the link to reset.',
      emailed: mailResult.sent,
      resetLink: mailResult.sent ? undefined : resetLink,
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
