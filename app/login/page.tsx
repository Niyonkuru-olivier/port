'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/user/dashboard')
        }
      } else {
        setErrorMessage(data.message || 'Login failed')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Password reset link sent to your email.')
        setShowForgotPassword(false)
        setForgotEmail('')
      } else {
        setErrorMessage(data.message || 'Failed to send reset link')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    }
  }

  const openForgotPassword = () => {
    setShowForgotPassword(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const cancelForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <div className="host">
      <div className="login-container">
        <h2>Login</h2>
        
        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={openForgotPassword}
              className="forgot-password"
            >
              Forgot Password?
            </button>

            {errorMessage && (
              <p className="error">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="success">{successMessage}</p>
            )}
          </form>
        ) : (
          <div className="forgot-password-form">
            <h3>Reset Password</h3>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
              <button type="submit">
                Send Reset Link
              </button>
            </form>
            <button
              type="button"
              onClick={cancelForgotPassword}
            >
              Cancel
            </button>

            {errorMessage && (
              <p className="error">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="success">{successMessage}</p>
            )}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link href="/welcome" style={{ color: '#007bff', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}