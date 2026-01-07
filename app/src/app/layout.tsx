import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'TWENTY6IX - Farcaster Social Rewards',
    description: 'Earn XP, complete tasks, and mint exclusive NFTs on Base',
    keywords: ['Farcaster', 'Base', 'NFT', 'Social', 'Web3', 'Rewards'],
    authors: [{ name: 'TWENTY6IX Team' }],
    openGraph: {
        title: 'TWENTY6IX - Farcaster Social Rewards',
        description: 'Earn XP, complete tasks, and mint exclusive NFTs on Base',
        type: 'website',
        siteName: 'TWENTY6IX',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'TWENTY6IX - Farcaster Social Rewards',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TWENTY6IX - Farcaster Social Rewards',
        description: 'Earn XP, complete tasks, and mint exclusive NFTs on Base',
        images: ['/og-image.png'],
    },
    other: {
        // Farcaster Mini App meta tags
        'fc:miniapp': JSON.stringify({
            name: 'TWENTY6IX',
            icon: 'https://twenty6ix.com/icon-192.png',
            homeUrl: 'https://twenty6ix.com',
            imageUrl: 'https://twenty6ix.com/og-image.png',
            buttonTitle: 'Open TWENTY6IX',
            splashImageUrl: 'https://twenty6ix.com/splash.png',
            splashBackgroundColor: '#ffffff',
        }),
        // Backward compatibility
        'fc:frame': 'vNext',
        'fc:frame:image': 'https://twenty6ix.com/og-image.png',
        'fc:frame:button:1': 'Open TWENTY6IX',
        'fc:frame:button:1:action': 'link',
        'fc:frame:button:1:target': 'https://twenty6ix.com',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
