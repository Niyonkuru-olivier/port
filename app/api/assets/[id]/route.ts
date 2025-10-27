import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const asset = await prisma.assets.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!asset) {
      return NextResponse.json(
        { message: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, description, condition, qty_in, qty_out, unit_price, threshold } = await request.json()

    if (!name || qty_in === undefined || unit_price === undefined) {
      return NextResponse.json(
        { message: 'Name, qty_in, and unit_price are required' },
        { status: 400 }
      )
    }

    const updatedAsset = await prisma.assets.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        description: description || null,
        condition,
        qty_in: parseInt(qty_in),
        qty_out: parseInt(qty_out) || 0,
        unit_price: parseFloat(unit_price),
        threshold: parseInt(threshold) || 5
        // balance_qty and total_price are generated columns, so we don't update them directly
      }
    })

    return NextResponse.json({
      message: 'Asset updated successfully',
      asset: updatedAsset
    })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.assets.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({
      message: 'Asset deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
