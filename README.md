# StoreMIS - Next.js Version

A comprehensive inventory and asset management system built with Next.js, TypeScript, and PostgreSQL.

## Features

- **User Authentication**: Secure login system with role-based access
- **Admin Dashboard**: Complete management interface for admins
- **User Dashboard**: Simplified interface for regular users
- **User Management**: Admins can create, activate/deactivate users
- **Inventory Management**: Add, edit, delete inventory items with stock tracking
- **Asset Management**: Manage company assets
- **Reports**: Generate and view various reports
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment example file and update with your database credentials:

```bash
cp env.example .env.local
```

Update `.env.local` with your actual values:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your_nextauth_secret_here_12345
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here_12345
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server

**Option 1: With Environment Variables (Recommended)**
```bash
npm run dev:env
```

**Option 2: Standard Start**
```bash
npm run dev
```

**Option 3: PowerShell Script**
```bash
npm run start:ps
```

The application will be available at `http://localhost:3000`

### 5. Database Health Check

```bash
npm run db:monitor
```

## Default Login Credentials

Use your existing database users or create new ones through the admin panel.

## Project Structure

```
storemis-nextjs/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   ├── assets/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   ├── user/
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   └── assets/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── inventory/
│   │   │   ├── assets/
│   │   │   └── reports/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts
│   │   └── db.ts
│   └── types/
├── prisma/
│   └── schema.prisma
└── public/
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]/status` - Toggle user status

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/[id]` - Update inventory item
- `DELETE /api/inventory/[id]` - Delete inventory item

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/[id]` - Update asset
- `DELETE /api/assets/[id]` - Delete asset

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Migration from Angular/NestJS

This Next.js version replaces the previous Angular frontend and NestJS backend with a unified Next.js application. Key improvements:

- **Single Codebase**: Frontend and backend in one project
- **Better Performance**: Server-side rendering and API routes
- **Easier Deployment**: Deploy to any platform with one command
- **Modern Stack**: Latest React and Next.js features
- **Type Safety**: Full TypeScript support throughout

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
