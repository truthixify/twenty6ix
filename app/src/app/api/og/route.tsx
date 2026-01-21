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
          TWENTY6IX
        </div>
        <div
          style={{
            color: '#B8C1D0',
            fontSize: 32,
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.2,
          }}
        >
          Earn XP • Complete Tasks • Mint NFTs
        </div>
        <div
          style={{
            color: '#00A3AD',
            fontSize: 24,
            marginTop: 30,
          }}
        >
          Built on Base • Powered by Farcaster
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}