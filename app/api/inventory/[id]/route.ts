import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!item) {
      return NextResponse.json(
        { message: 'Inventory item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, description, condition, qtyin, qtyout, unitprice, threshold } = await request.json()

    if (!name || qtyin === undefined || unitprice === undefined) {
      return NextResponse.json(
        { message: 'Name, qtyin, and unitprice are required' },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.inventory.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        description: description || null,
        condition,
        qtyin: parseInt(qtyin),
        qtyout: parseInt(qtyout) || 0,
        balanceqty: parseInt(qtyin) - (parseInt(qtyout) || 0),
        unitprice: parseFloat(unitprice),
        totalprice: parseFloat(unitprice) * (parseInt(qtyin) - (parseInt(qtyout) || 0)),
        threshold: parseInt(threshold) || 5
      }
    })

    return NextResponse.json({
      message: 'Inventory item updated successfully',
      item: updatedItem
    })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.inventory.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({
      message: 'Inventory item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
