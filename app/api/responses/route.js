import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const adminKey = process.env.ADMIN_KEY || 'change-this-key'

  if (key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { blobs } = await list({ prefix: 'responses/' })

  const responses = []
  for (const blob of blobs) {
    const res = await fetch(blob.url)
    const data = await res.json()
    responses.push(data)
  }

  return NextResponse.json({ total_responses: responses.length, responses })
}