import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request) {
  // Simple password protection
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  // Set this as ADMIN_KEY environment variable in Vercel
  const adminKey = process.env.ADMIN_KEY || 'change-this-key'

  if (key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dir = process.env.NODE_ENV === 'production' ? '/tmp' : './data'
    const files = await fs.readdir(dir)
    const jsonFiles = files.filter(f => f.startsWith('response_') && f.endsWith('.json'))

    const responses = []
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(dir, file), 'utf8')
      responses.push(JSON.parse(content))
    }

    return NextResponse.json({
      total_responses: responses.length,
      responses,
    })
  } catch (err) {
    return NextResponse.json({ error: 'No responses yet', details: err.message }, { status: 404 })
  }
}
