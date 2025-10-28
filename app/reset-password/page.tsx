'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin-dashboard/reset-password/reset-password.module.css'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email') || ''
    const tokenParam = searchParams.get('token') || ''

    setEmail(emailParam)
    setResetToken(tokenParam)

    if (!emailParam || !tokenParam) {
      setErrorMessage('Invalid or expired reset link. Please request a new password reset.')
      setTimeout(() => router.push('/login'), 3000)
    }
  }, [searchParams, router])

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: resetToken,
          newPassword,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        setErrorMessage('')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setErrorMessage(data.message || 'Reset failed.')
        setSuccessMessage('')
      }
    } catch (err: any) {
      setErrorMessage('Network error. Please try again.')
      setSuccessMessage('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {errorMessage && !email && !resetToken ? (
        <form>
          <h2>Reset Your Password</h2>
          <p className={styles.error}>{errorMessage}</p>
          <Link href="/login">← Back to Login</Link>
        </form>
      ) : (
        <form onSubmit={submitReset}>
          <h2>Reset Your Password</h2>
          <input type="email" value={email} readOnly placeholder="Email" style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required minLength={6} />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required minLength={6} />
          <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          {errorMessage && (<p className={styles.error}>{errorMessage}</p>)}
          {successMessage && (<p className={styles.success}>{successMessage}</p>)}
          <Link href="/login">← Back to Login</Link>
        </form>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.resetPasswordContainer}>
      <Suspense fallback={<form><h2>Reset Your Password</h2><div>Loading…</div></form>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
