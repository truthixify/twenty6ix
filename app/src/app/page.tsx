import { Metadata } from "next";
import App from "./app";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app';
  
  return {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [`${baseUrl}/api/og`],
    },
    other: {
      // Farcaster Frame metadata
      "fc:frame": "vNext",
      "fc:frame:image": `${baseUrl}/api/og`,
      "fc:frame:button:1": "🚀 Launch TWENTY6IX",
      "fc:frame:button:1:action": "post",
      "fc:frame:post_url": `${baseUrl}/api/frame`,
      
      // Mini App metadata (simplified)
      "fc:frame:miniapp": JSON.stringify({
        version: "next",
        name: APP_NAME,
        url: baseUrl,
        iconUrl: `${baseUrl}/icon.png`,
        splashImageUrl: `${baseUrl}/splash.png`,
        description: APP_DESCRIPTION,
      }),
    },
  };
}

export default function Home() {
  return (<App />);
}
