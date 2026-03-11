import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request) {
  try {
    const data = await request.json()
    if (!data.evaluator?.name || !data.evaluations?.length) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const key = `response:${Date.now()}_${data.evaluator.email.replace(/[^a-zA-Z0-9]/g, '_')}`
    data.server_timestamp = new Date().toISOString()
    await kv.set(key, data)

    return NextResponse.json({ success: true, key })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}