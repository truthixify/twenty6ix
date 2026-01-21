import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('🔐 SIWE endpoint called:', body)
    
    // For now, just return success to test the flow
    // In production, you'd verify the signature here
    return NextResponse.json({ 
      success: true,
      message: 'Authentication successful' 
    })
  } catch (error) {
    console.error('❌ SIWE error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Return SIWE configuration
  return NextResponse.json({
    domain: process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'twenty6ix.vercel.app',
    uri: process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app',
  })
}