import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const assets = await prisma.assets.findMany({
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, sku, condition, qty_in, qty_out, unit_price, threshold } = await request.json()

    if (!name || !sku || !condition || qty_in === undefined || unit_price === undefined) {
      return NextResponse.json(
        { message: 'Name, sku, condition, qty_in, and unit_price are required' },
        { status: 400 }
      )
    }

    // Auto-generate asset number
    const lastAsset = await prisma.assets.findFirst({
      orderBy: { id: 'desc' }
    })
    
    const nextNumber = lastAsset ? 
      `AST-${String(parseInt(lastAsset.number.split('-')[1]) + 1).padStart(4, '0')}` : 
      'AST-0001'

    const asset = await prisma.assets.create({
      data: {
        number: nextNumber,
        name,
        description: description || null,
        sku,
        condition,
        qty_in: parseInt(qty_in),
        qty_out: parseInt(qty_out) || 0,
        unit_price: parseFloat(unit_price),
        threshold: parseInt(threshold) || 5
      }
    })

    return NextResponse.json({
      message: 'Asset created successfully',
      asset
    })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
