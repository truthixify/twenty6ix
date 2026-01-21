import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log the webhook event for debugging
    console.log('Webhook received:', body);
    
    // Handle different webhook events here
    // For now, just acknowledge receipt
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'TWENTY6IX Webhook Endpoint',
    status: 'active' 
  });
}