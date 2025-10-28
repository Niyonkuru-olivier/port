import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  id: number
  email: string
  role: string
  status: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function validateUser(email: string, password: string, role: string): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    console.log('Validating user:', { email, role })
    console.log('DATABASE_URL available:', !!process.env.DATABASE_URL)
    
    // Try users table first (where new users are created)
    let user: any = await prisma.users.findFirst({
      where: { 
        email: email
      }
    })

    // If not found in users table, try singular user table
    if (!user) {
      user = await prisma.user.findFirst({
        where: { 
          email: email
        }
      })
    }

    console.log('Found user:', user ? { id: user.id, email: user.email, role: user.role, status: user.status } : 'No user found')

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    // Check if user role matches (if not, still allow them to login but will redirect based on their actual role)
    if (user.role && user.role !== role) {
      console.log(`Role mismatch: requested ${role}, user has ${user.role}`)
    }

    // Check if user is active
    const userStatus = (user as any).status
    if (userStatus && userStatus.toLowerCase() === 'inactive') {
      return { success: false, message: 'User account is inactive. Please contact administrator.' }
    }

    // Get password hash from the correct field
    const passwordHash = (user as any).password_hash || (user as any).password
    
    const isValidPassword = await verifyPassword(password, passwordHash)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      return { success: false, message: 'Invalid password' }
    }

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        status: userStatus || 'Activated'
      },
      message: `Login successful`
    }
  } catch (error) {
    console.error('Validation error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return { success: false, message: 'Authentication failed' }
  }
}
