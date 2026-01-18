"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { useNeynarUser } from "~/hooks/useNeynarUser";
import { AppProvider, useApp } from "~/contexts/AppContext";
import { WelcomeScreen } from "~/components/features/WelcomeScreen";
import { DashboardContent } from "~/components/pages/DashboardContent";
import { LeaderboardContent } from "~/components/pages/LeaderboardContent";
import { SocialTasksContent } from "~/components/pages/SocialTasksContent";
import { NFTCollectionContent } from "~/components/pages/NFTCollectionContent";
import { InformationContent } from "~/components/pages/InformationContent";
import { AdminContent } from "~/components/pages/AdminContent";
import { Navigation } from "~/components/features/Navigation";

export interface Twenty6ixAppProps {
  title?: string;
}

function Twenty6ixAppContent({ title }: Twenty6ixAppProps) {
  const {
    isSDKLoaded,
    context,
    actions,
  } = useMiniApp();

  const { state, signInWithFarcaster } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Call ready when SDK is loaded
  useEffect(() => {
    if (isSDKLoaded && actions) {
      actions.ready();
    }
  }, [isSDKLoaded, actions]);

  // Handle sign in
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithFarcaster();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isSDKLoaded || state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading TWENTY6IX...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show welcome screen
  if (!state.isAuthenticated) {
    return (
      <WelcomeScreen
        onSignIn={handleSignIn}
        isMiniApp={true}
        isLoading={isLoading}
        error={state.error}
      />
    );
  }

  // Authenticated - show main app
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="min-h-screen bg-background"
    >
      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 pb-20">
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'leaderboard' && <LeaderboardContent />}
        {activeTab === 'tasks' && <SocialTasksContent />}
        {activeTab === 'nfts' && <NFTCollectionContent />}
        {activeTab === 'info' && <InformationContent />}
        {activeTab === 'admin' && <AdminContent />}
      </div>
    </div>
  );
}

export default function Twenty6ixApp(props: Twenty6ixAppProps) {
  return (
    <AppProvider>
      <Twenty6ixAppContent {...props} />
    </AppProvider>
  );
}
