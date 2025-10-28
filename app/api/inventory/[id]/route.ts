import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id)
    
    const item = await prisma.inventory.findUnique({
      where: { id: itemId }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id)
    const { name, description, condition, qtyin, qtyout, unitprice, threshold } = await request.json()

    const existingItem = await prisma.inventory.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Inventory item not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (condition) updateData.condition = condition
    if (qtyin !== undefined) updateData.qtyin = parseInt(qtyin)
    if (qtyout !== undefined) updateData.qtyout = parseInt(qtyout)
    if (unitprice !== undefined) updateData.unitprice = parseFloat(unitprice)
    if (threshold !== undefined) updateData.threshold = parseInt(threshold)

    const item = await prisma.inventory.update({
      where: { id: itemId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Inventory item updated successfully',
      item
    })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id)

    const existingItem = await prisma.inventory.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Inventory item not found' },
        { status: 404 }
      )
    }

    await prisma.inventory.delete({
      where: { id: itemId }
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