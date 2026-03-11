import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request) {
  try {
    const data = await request.json()

    // Validate
    if (!data.evaluator?.name || !data.evaluations?.length) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Add server timestamp
    data.server_timestamp = new Date().toISOString()

    // Save to /tmp (Vercel serverless functions have writable /tmp)
    // For persistent storage, you'd use Vercel KV, Supabase, or a database
    // For now, we also POST to a Google Sheets webhook as backup

    // Option 1: Save to local file (works in dev, /tmp on Vercel)
    const dir = process.env.NODE_ENV === 'production' ? '/tmp' : './data'
    await fs.mkdir(dir, { recursive: true })

    const filename = `response_${Date.now()}_${data.evaluator.name.replace(/\s+/g, '_')}.json`
    const filepath = path.join(dir, filename)
    await fs.writeFile(filepath, JSON.stringify(data, null, 2))

    // Option 2: If GOOGLE_SHEETS_WEBHOOK is set, also push there
    if (process.env.GOOGLE_SHEETS_WEBHOOK) {
      try {
        await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } catch (e) {
        console.error('Sheets webhook failed:', e)
        // Don't fail the request if webhook fails
      }
    }

    // Option 3: If you set up Vercel KV (recommended for production)
    // import { kv } from '@vercel/kv'
    // await kv.set(`response:${Date.now()}`, data)

    console.log(`[OK] Saved response from ${data.evaluator.name} (${data.evaluations.length} evaluations)`)

    return NextResponse.json({ success: true, filename })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
