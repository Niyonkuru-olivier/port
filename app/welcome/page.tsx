import Link from 'next/link'
import './welcome.css'

export default function Home() {
  return (
    <div className="host">
      <div className="container">
        <h3>🏢 Welcome to StoreMIS – MININFRA</h3>
        <p>StoreMIS streamlines MININFRA’s daily store operations
        through efficient stock tracking and transparent management.
        </p>
          
        <div className="buttons">
          <Link href="/login" id="loginBtn">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}