import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, qtyin, qtyout, balanceqty, unitprice, totalprice, threshold, condition, number } = await request.json()

    if (!name || qtyin === undefined || unitprice === undefined) {
      return NextResponse.json(
        { message: 'Name, qtyin, and unitprice are required' },
        { status: 400 }
      )
    }

    const item = await prisma.inventory.create({
      data: {
        name,
        description: description || null,
        qtyin: parseInt(qtyin),
        qtyout: parseInt(qtyout) || 0,
        balanceqty: parseInt(balanceqty) || parseInt(qtyin),
        unitprice: parseFloat(unitprice),
        totalprice: parseFloat(totalprice) || (parseFloat(unitprice) * parseInt(qtyin)),
        threshold: parseInt(threshold) || 5,
        condition: condition || 'Good',
        number: number || null
      }
    })

    return NextResponse.json({
      message: 'Inventory item created successfully',
      item
    })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
