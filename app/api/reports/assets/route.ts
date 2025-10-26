import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generatePDFReport, generateExcelReport, generateCSVReport, ReportData } from '@/lib/reportGenerator'

export async function POST(request: NextRequest) {
  try {
    console.log('Assets report API called')
    const body = await request.json()
    console.log('Request body:', body)
    const { items, format = 'pdf' } = body

    if (!items || !Array.isArray(items)) {
      console.log('Invalid items array')
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    console.log('Fetching assets from database...')
    // Get assets data from database
    const assetsData = await prisma.assets.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.id)
        }
      }
    })

    console.log('Found assets:', assetsData.length)

    if (assetsData.length === 0) {
      console.log('No assets found')
      return NextResponse.json(
        { error: 'No asset items found' },
        { status: 404 }
      )
    }

    console.log('Generating report data...')
    // Generate report data
    const reportData: ReportData = {
      title: 'Asset Report',
      generatedAt: new Date().toISOString(),
      items: assetsData.map(asset => ({
        id: asset.id,
        number: asset.number,
        name: asset.name,
        description: asset.description || '',
        condition: asset.condition,
        sku: asset.sku,
        qtyIn: asset.qty_in,
        qtyOut: asset.qty_out,
        balanceQty: asset.balance_qty || 0,
        unitPrice: Number(asset.unit_price) || 0,
        totalPrice: Number(asset.unit_price) * (asset.balance_qty || 0),
        threshold: asset.threshold || 5,
        status: (asset.balance_qty || 0) <= (asset.threshold || 5) ? 'Low Stock' : 'OK'
      })),
      summary: {
        totalItems: assetsData.length,
        totalValue: assetsData.reduce((sum, asset) => 
          sum + (Number(asset.unit_price) * (asset.balance_qty || 0)), 0
        ),
        lowStockItems: assetsData.filter(asset => 
          (asset.balance_qty || 0) <= (asset.threshold || 5)
        ).length
      }
    }

    console.log('Report data generated, creating file...')
    // Generate file based on format
    let fileBuffer: Buffer
    let contentType: string
    let filename: string

    switch (format.toLowerCase()) {
      case 'pdf':
        console.log('Generating PDF...')
        fileBuffer = generatePDFReport(reportData)
        contentType = 'text/plain'
        filename = `asset-report-${Date.now()}.txt`
        break
      case 'xlsx':
      case 'excel':
        console.log('Generating Excel...')
        fileBuffer = await generateExcelReport(reportData)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `asset-report-${Date.now()}.xlsx`
        break
      case 'csv':
        console.log('Generating CSV...')
        const csvContent = generateCSVReport(reportData)
        fileBuffer = Buffer.from(csvContent, 'utf-8')
        contentType = 'text/csv'
        filename = `asset-report-${Date.now()}.csv`
        break
      default:
        console.log('Unsupported format:', format)
        return NextResponse.json(
          { error: 'Unsupported format. Use pdf, xlsx, or csv' },
          { status: 400 }
        )
    }

    console.log('File generated successfully, returning response...')
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
    console.error('Error generating asset report:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to generate asset report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all assets for report preview
    const assetsData = await prisma.assets.findMany({
      select: {
        id: true,
        number: true,
        name: true,
        description: true,
        sku: true,
        condition: true,
        qty_in: true,
        qty_out: true,
        balance_qty: true,
        unit_price: true,
        threshold: true
      }
    })

    const reportPreview = {
      title: 'Asset Report Preview',
      totalItems: assetsData.length,
      items: assetsData.map(asset => ({
        id: asset.id,
        number: asset.number,
        name: asset.name,
        sku: asset.sku,
        balanceQty: asset.balance_qty,
        unitPrice: asset.unit_price,
        status: (asset.balance_qty || 0) <= (asset.threshold || 5) ? 'Low Stock' : 'OK'
      }))
    }

    return NextResponse.json(reportPreview)

  } catch (error) {
    console.error('Error getting asset report preview:', error)
    return NextResponse.json(
      { error: 'Failed to get asset report preview' },
      { status: 500 }
    )
  }
}
