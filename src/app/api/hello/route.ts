import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    massage: 'Hello next.js',
  }
  return NextResponse.json(data)
}
