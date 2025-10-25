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
    
    const user = await prisma.user.findFirst({
      where: { 
        email: email,
        role: role 
      }
    })

    console.log('Found user:', user ? { id: user.id, email: user.email, role: user.role, status: user.status } : 'No user found')

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const isValidPassword = await verifyPassword(password, user.password)
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
        status: user.status || 'Activated'
      },
      message: `${role} login successful`
    }
  } catch (error) {
    console.error('Validation error:', error)
    console.error('Error details:', error.message)
    return { success: false, message: 'Authentication failed' }
  }
}
