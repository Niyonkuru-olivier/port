import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generatePDFReport, generateExcelReport, generateCSVReport, ReportData } from '@/lib/reportGenerator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, format = 'pdf' } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Get inventory data from database
    const inventoryData = await prisma.inventory.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.id)
        }
      }
    })

    if (inventoryData.length === 0) {
      return NextResponse.json(
        { error: 'No inventory items found' },
        { status: 404 }
      )
    }

    // Generate report data
    const reportData: ReportData = {
      title: 'Inventory Report',
      generatedAt: new Date().toISOString(),
      items: inventoryData.map(item => ({
        id: item.id,
        number: item.number || `INV-${String(item.id).padStart(4, '0')}`,
        name: item.name || '',
        description: item.description || '',
        condition: item.condition || '',
        qtyIn: item.qtyin || 0,
        qtyOut: item.qtyout || 0,
        balanceQty: (item.qtyin || 0) - (item.qtyout || 0),
        unitPrice: Number(item.unitprice) || 0,
        totalPrice: (Number(item.unitprice) || 0) * ((item.qtyin || 0) - (item.qtyout || 0)),
        threshold: item.threshold || 5,
        status: ((item.qtyin || 0) - (item.qtyout || 0)) <= (item.threshold || 5) ? 'Low Stock' : 'OK'
      })),
      summary: {
        totalItems: inventoryData.length,
        totalValue: inventoryData.reduce((sum, item) => 
          sum + ((Number(item.unitprice) || 0) * ((item.qtyin || 0) - (item.qtyout || 0))), 0
        ),
        lowStockItems: inventoryData.filter(item => 
          ((item.qtyin || 0) - (item.qtyout || 0)) <= (item.threshold || 5)
        ).length
      }
    }

    // Generate file based on format
    let fileBuffer: Buffer
    let contentType: string
    let filename: string

    switch (format.toLowerCase()) {
      case 'pdf':
        fileBuffer = generatePDFReport(reportData)
        contentType = 'text/plain'
        filename = `inventory-report-${Date.now()}.txt`
        break
      case 'xlsx':
      case 'excel':
        fileBuffer = await generateExcelReport(reportData)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `inventory-report-${Date.now()}.xlsx`
        break
      case 'csv':
        const csvContent = generateCSVReport(reportData)
        fileBuffer = Buffer.from(csvContent, 'utf-8')
        contentType = 'text/csv'
        filename = `inventory-report-${Date.now()}.csv`
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use pdf, xlsx, or csv' },
          { status: 400 }
        )
    }

    // Return file as response
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error generating inventory report:', error)
    return NextResponse.json(
      { error: 'Failed to generate inventory report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all inventory items for report preview
    const inventoryData = await prisma.inventory.findMany({
      select: {
        id: true,
        number: true,
        name: true,
        description: true,
        condition: true,
        qtyin: true,
        qtyout: true,
        unitprice: true,
        threshold: true
      }
    })

    const reportPreview = {
      title: 'Inventory Report Preview',
      totalItems: inventoryData.length,
      items: inventoryData.map(item => ({
        id: item.id,
        number: item.number || `INV-${String(item.id).padStart(4, '0')}`,
        name: item.name,
        balanceQty: (item.qtyin || 0) - (item.qtyout || 0),
        unitPrice: item.unitprice || 0,
        status: ((item.qtyin || 0) - (item.qtyout || 0)) <= (item.threshold || 5) ? 'Low Stock' : 'OK'
      }))
    }

    return NextResponse.json(reportPreview)

  } catch (error) {
    console.error('Error getting inventory report preview:', error)
    return NextResponse.json(
      { error: 'Failed to get inventory report preview' },
      { status: 500 }
    )
  }
}
