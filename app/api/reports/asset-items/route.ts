import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const items = await prisma.assets.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        qty_in: true,
        qty_out: true,
        balance_qty: true,
        unit_price: true,
        total_price: true
      }
    })

    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      sku: item.sku || '',
      qtyIn: item.qty_in || 0,
      qtyOut: item.qty_out || 0,
      balance: item.balance_qty || 0,
      unitPrice: item.unit_price || 0,
      totalPrice: item.total_price || 0
    }))

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('Error fetching asset items:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

