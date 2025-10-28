import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/transactions?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    let where: any = {}
    if (dateParam) {
      const day = new Date(dateParam)
      if (!isNaN(day.getTime())) {
        const start = new Date(day)
        start.setHours(0, 0, 0, 0)
        const end = new Date(day)
        end.setHours(23, 59, 59, 999)
        where.date = { gte: start, lte: end }
      }
    }

    let transactions = await prisma.transaction.findMany({
      where,
      orderBy: { id: 'desc' },
    })
    // Fallback: try reading from legacy singular table via raw query if empty
    if (!transactions || transactions.length === 0) {
      try {
        const whereSql = dateParam
          ? prisma.$queryRawUnsafe(
              `SELECT id, date, itemid, itemname, type, quantity, "user", reason FROM transaction WHERE date >= $1 AND date <= $2 ORDER BY id DESC`,
              new Date(new Date(dateParam).setHours(0,0,0,0)),
              new Date(new Date(dateParam).setHours(23,59,59,999))
            )
          : prisma.$queryRawUnsafe(
              `SELECT id, date, itemid, itemname, type, quantity, "user", reason FROM transaction ORDER BY id DESC`
            )
        // @ts-ignore
        const legacy = await whereSql
        if (Array.isArray(legacy) && legacy.length > 0) {
          // @ts-ignore
          transactions = legacy as any
        }
      } catch (_) {}
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      itemid = 0,
      itemname = 'System',
      type,
      quantity = 1,
      user,
      reason = ''
    } = body || {}

    if (!type || !user) {
      return NextResponse.json(
        { message: 'type and user are required' },
        { status: 400 }
      )
    }

    console.log('Creating transaction with data:', {
      itemid: Number(itemid) || 0,
      itemname: String(itemname),
      type: String(type),
      quantity: Number(quantity) || 1,
      user: String(user),
      reason: String(reason)
    })

    const created = await prisma.transaction.create({
      data: {
        itemid: Number(itemid) || 0,
        itemname: String(itemname),
        type: String(type),
        quantity: Number(quantity) || 1,
        user: String(user),
        reason: String(reason)
      }
    })

    console.log('Transaction created successfully with ID:', created.id)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

