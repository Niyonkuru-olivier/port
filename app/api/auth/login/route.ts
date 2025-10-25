import { NextRequest, NextResponse } from 'next/server'
import { validateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    console.log('Login attempt:', { email, role })

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    const result = await validateUser(email, password, role)
    console.log('Validation result:', result)

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 401 }
      )
    }

    const token = generateToken(result.user!)

    return NextResponse.json({
      message: result.message,
      token,
      user: result.user
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
