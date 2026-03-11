import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const adminKey = process.env.ADMIN_KEY || 'change-this-key'

  if (key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const keys = await kv.keys('response:*')
  const responses = []
  for (const k of keys) {
    const data = await kv.get(k)
    if (data) responses.push(data)
  }

  return NextResponse.json({ total_responses: responses.length, responses })
}