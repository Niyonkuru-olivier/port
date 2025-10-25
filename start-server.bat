@echo off
echo Starting StoreMIS Server with Environment Variables...

REM Set environment variables
REM set DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
set NEXTAUTH_SECRET=your_secure_secret_here_12345
set NEXTAUTH_URL=http://localhost:3000
set JWT_SECRET=your_jwt_secret_here_12345

echo Environment variables set successfully!
echo DATABASE_URL: %DATABASE_URL%
echo.

REM Start the development server
echo Starting Next.js development server...
npm run dev

pause
