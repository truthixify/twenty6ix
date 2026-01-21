import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F1A',
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: 80,
            marginBottom: 20,
          }}
        >
          🎉 Welcome!
        </div>
        <div
          style={{
            color: '#FFFFFF',
            fontSize: 40,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Ready to start earning?
        </div>
        <div
          style={{
            color: '#B8C1D0',
            fontSize: 28,
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          • Daily Claims: 10 XP
          • Social Tasks: 5 XP each
          • Donations: 50 XP per $1
          • Referrals: 20 XP each
        </div>
        <div
          style={{
            color: '#A100FF',
            fontSize: 24,
            marginTop: 30,
          }}
        >
          Click "Launch Mini App" to get started!
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}