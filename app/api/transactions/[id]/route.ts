import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


