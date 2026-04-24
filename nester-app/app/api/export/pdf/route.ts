import { NextResponse } from 'next/server'

const PDF_OPTIMIZER_URL = 'http://localhost:8000/export/pdf'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward request to Python microservice for PDF generation
    const response = await fetch(PDF_OPTIMIZER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'PDF Export service failed' },
        { status: response.status }
      )
    }

    // Get the PDF buffer
    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="nester-cutting-plan.pdf"',
      },
    })
  } catch (error) {
    console.error('PDF Export API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during PDF export' },
      { status: 500 }
    )
  }
}
