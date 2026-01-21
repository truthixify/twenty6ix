"use client";

import dynamic from "next/dynamic";
import { FarcasterAuthProvider } from "~/components/providers/FarcasterAuthProvider";
import { APP_NAME } from "~/lib/constants";

// note: dynamic import is required for components that use the Frame SDK
const Twenty6ixApp = dynamic(() => import("~/components/Twenty6ixApp"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  return (
    <FarcasterAuthProvider>
      <Twenty6ixApp title={title} />
    </FarcasterAuthProvider>
  );
}
