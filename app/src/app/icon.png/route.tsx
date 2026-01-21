import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F1A',
          borderRadius: '20px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: 48,
            fontWeight: 900,
            textAlign: 'center',
          }}
        >
          26
        </div>
      </div>
    ),
    {
      width: 128,
      height: 128,
    }
  );
}