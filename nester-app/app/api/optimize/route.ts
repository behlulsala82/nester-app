import { NextResponse } from 'next/server'

const OPTIMIZER_URL = process.env.OPTIMIZER_API_URL || 'http://localhost:8000/optimize'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation
    if (!body.board_width || !body.board_height || !body.pieces) {
      return NextResponse.json(
        { error: 'Missing required fields: board_width, board_height, or pieces' },
        { status: 400 }
      )
    }

    // Forward request to Python microservice
    const response = await fetch(OPTIMIZER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Optimizer service failed' },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
