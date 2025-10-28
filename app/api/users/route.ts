import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Fetch from both legacy tables and merge for UI
    const [legacyUsers, newUsers] = await Promise.all([
      prisma.users.findMany({ orderBy: { id: 'desc' } }), // plural table
      prisma.user.findMany({ orderBy: { id: 'desc' } }), // singular table
    ])

    // Normalize records to a single shape
    const normalizedLegacy = legacyUsers.map((u) => ({
      id: u.id,
      name: u.name || '',
      email: u.email,
      role: u.role || 'user',
      status: u.status || 'Active',
      created_at: u.created_at || null,
      source: 'users',
    }))

    const normalizedNew = newUsers.map((u: any) => ({
      id: u.id,
      name: u.name || '',
      email: u.email,
      role: u.role || 'user',
      status: u.status || 'Activated',
      created_at: u.created_at || null,
      source: 'user',
    }))

    // Combine and sort by id desc (already ordered individually, but combine sort for safety)
    const combined = [...normalizedLegacy, ...normalizedNew].sort((a, b) => b.id - a.id)

    return NextResponse.json(combined)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: role || 'user',
        status: 'Active'
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
