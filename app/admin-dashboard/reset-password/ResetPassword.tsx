import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';

    setEmail(emailParam);
    setResetToken(tokenParam);

    if (!emailParam || !tokenParam) {
      setErrorMessage('Invalid or expired reset link. Please request a new password reset.');
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [searchParams, router]);

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
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
      });
      const data = await response.json();
      setSuccessMessage(data.message);
      setErrorMessage('');
      setTimeout(() => router.push('/login'), 2000); // Redirect after success
    } catch (err: any) {
      setErrorMessage('Reset failed.');
      setSuccessMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Reset Your Password</h2>
      <form onSubmit={submitReset}>
        <input type="email" value={email} readOnly placeholder="Email" />
        <input type="text" value={resetToken} readOnly placeholder="Reset Token" />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}
    </div>
  );
};

export default ResetPassword;
