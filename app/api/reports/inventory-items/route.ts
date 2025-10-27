import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const items = await prisma.inventory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        qtyin: true,
        qtyout: true,
        balanceqty: true,
        unitprice: true,
        totalprice: true
      }
    })

    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      qtyIn: item.qtyin || 0,
      qtyOut: item.qtyout || 0,
      balance: item.balanceqty || 0,
      unitPrice: item.unitprice || 0,
      totalPrice: item.totalprice || 0
    }))

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

