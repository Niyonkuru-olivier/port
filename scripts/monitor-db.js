const { PrismaClient } = require('@prisma/client')

// Set environment variable for the script
// process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://username:password@host:port/database?sslmode=require"

const prisma = new PrismaClient()

async function monitorDatabase() {
  try {
    console.log('🔍 Checking database health...')
    
    // Test connection
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const connectionTime = Date.now() - start
    
    // Get database stats
    const userCount = await prisma.user.count()
    const inventoryCount = await prisma.inventory.count()
    const assetCount = await prisma.assets.count()
    
    console.log('✅ Database Status: HEALTHY')
    console.log(`⏱️  Connection Time: ${connectionTime}ms`)
    console.log(`👥 Users: ${userCount}`)
    console.log(`📦 Inventory Items: ${inventoryCount}`)
    console.log(`🏢 Assets: ${assetCount}`)
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
    
  } catch (error) {
    console.error('❌ Database Status: UNHEALTHY')
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run monitoring
monitorDatabase()
