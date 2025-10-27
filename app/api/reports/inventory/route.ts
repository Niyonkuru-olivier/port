import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, type, format, startDate, endDate } = body

    // Get inventory items - ONLY selected items
    let inventoryItems
    if (items && items.length > 0) {
      inventoryItems = await prisma.inventory.findMany({
        where: {
          name: {
            in: items
          }
        }
      })
    } else {
      return NextResponse.json({ message: 'No items selected' }, { status: 400 })
    }

    if (!inventoryItems.length) {
      return NextResponse.json({ message: 'No inventory items found' }, { status: 404 })
    }

    const reportsDir = path.join(process.cwd(), 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const filename = `inventory-report-${Date.now()}.pdf`
    const filePath = path.join(reportsDir, filename)

    // Generate PDF report
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    // Logo path - UPDATE THIS PATH based on where you place logo.png
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.png')

    // Header
    doc.fontSize(16).text('Republic of Rwanda', { align: 'center' })
    
    // Add logo if it exists
    if (fs.existsSync(logoPath)) {
      const logoY = (doc as any).y + 10
      doc.image(logoPath, 50, logoY, { width: 80 })
    }
    
    doc.moveDown(6)
    doc.fontSize(12).text('MINISTRY OF INFRASTRUCTURE')
    doc.fontSize(11).text('P.O.BOX 24 KIGALI', { underline: true })
    doc.fontSize(8).text('E-mail: info@mininfra.gov.rw')

    const currentDate = new Date().toLocaleDateString()
    doc.moveDown(2)
    doc.fontSize(13).text('INVENTORY REPORT AS AT ' + currentDate, {
      align: 'center',
      underline: true,
    })
    doc.moveDown(2)

    // Table headers
    const headers = ['No', 'Name', 'Description', 'Qty In', 'Qty Out', 'Balance Qty', 'Unit Price(RWF)', 'Total Price(RWF)']
    const colWidths = [30, 80, 100, 50, 50, 60, 60, 60]
    const startX = 50
    let y = (doc as any).y
    const rowHeight = 30

    // Draw header row
    doc.font('Helvetica-Bold').fontSize(10)
    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'left' })
      doc.rect(x, y, colWidths[i], rowHeight).stroke()
    })

    y += rowHeight
    doc.font('Helvetica').fontSize(9)

    // Draw data rows
    inventoryItems.forEach((item, index) => {
      const qtyIn = item.qtyin || 0
      const qtyOut = item.qtyout || 0
      const balanceQty = Number(item.balanceqty) || 0
      const unitPrice = Number(item.unitprice) || 0
      const totalPrice = unitPrice * balanceQty

      const row = [
        index + 1,
        item.name || '',
        item.description || '',
        qtyIn.toString(),
        qtyOut.toString(),
        balanceQty.toString(),
        unitPrice.toFixed(2),
        totalPrice.toFixed(2)
      ]

      row.forEach((cell, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
        doc.text(String(cell), x + 2, y + 5, { width: colWidths[i] - 4, align: 'left' })
        doc.rect(x, y, colWidths[i], rowHeight).stroke()
      })
      y += rowHeight

      if (y + rowHeight > doc.page.height - 150) {
        doc.addPage()
        y = 50
      }
    })

    // Grand total line
    y += 10
    const grandTotal = inventoryItems.reduce((sum, item) => {
      const unitPrice = Number(item.unitprice) || 0
      const balanceQty = Number(item.balanceqty) || 0
      return sum + (unitPrice * balanceQty)
    }, 0)

    doc.font('Helvetica-Bold').fontSize(10)
    doc.text(`Grand Total: ${grandTotal.toFixed(2)} RWF`, startX, y)

    // Footer signatories
    doc.moveDown(6)
    const indent = 50
    const sigLine = '____________________'
    doc.font('Helvetica-Bold').text('Prepared by:', indent)
    doc.font('Helvetica').text(`Celestin Safari          ${sigLine}`)
    doc.text('Logistics Officer')
    doc.moveDown()
    doc.font('Helvetica-Bold').text('Checked by:', indent)
    doc.font('Helvetica').text(`Martin Munyaneza         ${sigLine}`)
    doc.text('Financial Management Specialist')
    doc.moveDown()
    doc.font('Helvetica-Bold').text('Approved by:', indent)
    doc.font('Helvetica').text(`Marie Chantal Zaninka    ${sigLine}`)
    doc.text('DG/Corporate Services')
    doc.moveDown()
    doc.font('Helvetica-Bold').text('Verified by:', indent)
    doc.font('Helvetica').text(`Javan Gatoya             ${sigLine}`)
    doc.text('Chairperson/Logistic Committee')
    doc.text(`Daniel Kamanzi           ${sigLine}`)
    doc.text('Member Logistic Committee')

    doc.end()

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve)
      stream.on('error', reject)
    })

    // Read the file and send as response
    const fileBuffer = fs.readFileSync(filePath)
    
    // Clean up
    fs.unlinkSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error generating inventory report:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

