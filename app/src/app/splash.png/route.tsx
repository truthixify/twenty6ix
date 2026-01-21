import { ImageResponse } from 'next/og';

export async function GET() {
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
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: 120,
            fontWeight: 900,
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
          }}
        >
          Loading your XP adventure...
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}