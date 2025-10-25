import Link from 'next/link'
import './welcome.css'

export default function Home() {
  return (
    <div className="host">
      <div className="container">
        <h1>Welcome to Stock Management System</h1>
        <p>Manage your stock efficiently with our powerful tools.</p>
        <div className="buttons">
          <Link href="/login" id="loginBtn">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}