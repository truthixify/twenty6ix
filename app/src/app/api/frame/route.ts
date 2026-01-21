import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    version: "vNext",
    title: "TWENTY6IX - Earn XP & Mint NFTs",
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app'}/api/og`,
    buttons: [
      {
        label: "🚀 Open TWENTY6IX",
        action: "post",
        target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app'}/api/frame`
      }
    ]
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  return NextResponse.json({
    version: "vNext",
    title: "Welcome to TWENTY6IX!",
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app'}/api/og-welcome`,
    buttons: [
      {
        label: "📱 Launch Mini App",
        action: "link",
        target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app'}`
      },
      {
        label: "🔄 Refresh",
        action: "post", 
        target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app'}/api/frame`
      }
    ]
  });
}