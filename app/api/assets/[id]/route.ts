import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = parseInt(params.id)
    
    const asset = await prisma.assets.findUnique({
      where: { id: assetId }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = parseInt(params.id)
    const { name, description, sku, condition, qty_in, qty_out, unit_price, threshold } = await request.json()

    const existingAsset = await prisma.assets.findUnique({
      where: { id: assetId }
    })

    if (!existingAsset) {
      return NextResponse.json(
        { message: 'Asset not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (sku) updateData.sku = sku
    if (condition) updateData.condition = condition
    if (qty_in !== undefined) updateData.qty_in = parseInt(qty_in)
    if (qty_out !== undefined) updateData.qty_out = parseInt(qty_out)
    if (unit_price !== undefined) updateData.unit_price = parseFloat(unit_price)
    if (threshold !== undefined) updateData.threshold = parseInt(threshold)

    const asset = await prisma.assets.update({
      where: { id: assetId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Asset updated successfully',
      asset
    })
  } catch (error) {
    console.error('Error updating asset:', error)
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
    const assetId = parseInt(params.id)

    const existingAsset = await prisma.assets.findUnique({
      where: { id: assetId }
    })

    if (!existingAsset) {
      return NextResponse.json(
        { message: 'Asset not found' },
        { status: 404 }
      )
    }

    await prisma.assets.delete({
      where: { id: assetId }
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