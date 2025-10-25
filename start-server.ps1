# StoreMIS Server Startup Script
Write-Host "🚀 Starting StoreMIS Server with Environment Variables..." -ForegroundColor Green

# Set environment variables
# $env:DATABASE_URL = "postgres://username:password@host:port/database?sslmode=require"
$env:NEXTAUTH_SECRET = "your_secure_secret_here_12345"
$env:NEXTAUTH_URL = "http://localhost:3000"
$env:JWT_SECRET = "your_jwt_secret_here_12345"

Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
Write-Host "📊 DATABASE_URL: $($env:DATABASE_URL)" -ForegroundColor Cyan
Write-Host ""

# Test database connection first
Write-Host "🔍 Testing database connection..." -ForegroundColor Yellow
try {
    node scripts/monitor-db.js
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "Please check your database configuration." -ForegroundColor Red
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

Write-Host ""
Write-Host "🌐 Starting Next.js development server..." -ForegroundColor Green
Write-Host "📍 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev
