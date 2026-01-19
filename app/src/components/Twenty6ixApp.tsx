"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { AppProvider, useApp } from "~/contexts/AppContext";
import { WelcomeScreen } from "~/components/features/WelcomeScreen";
import { DashboardContent } from "~/components/pages/DashboardContent";
import { LeaderboardContent } from "~/components/pages/LeaderboardContent";
import { SocialTasksContent } from "~/components/pages/SocialTasksContent";
import { NFTCollectionContent } from "~/components/pages/NFTCollectionContent";
import { InformationContent } from "~/components/pages/InformationContent";
import { AdminContent } from "~/components/pages/AdminContent";
import { Sidebar } from "~/components/features/Sidebar";
import { MobileNavigation } from "~/components/features/MobileNavigation";
import { MobileHeader } from "~/components/features/MobileHeader";

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

  // Check if user is admin
  const isAdmin = state.user?.fid.toString() === process.env.NEXT_PUBLIC_OWNER_FID;

  // Handle URL-based navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const tabMap: Record<string, string> = {
        '/dashboard': 'dashboard',
        '/social-tasks': 'tasks',
        '/nft-collection': 'nfts',
        '/leaderboard': 'leaderboard',
        '/admin': 'admin',
        '/information': 'info',
      };
      
      const tab = tabMap[path];
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

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

  // Loading state - skip for now to go directly to dashboard
  // if (!isSDKLoaded || state.isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-b-2 border-primary"></div>
  //         <p>Loading TWENTY6IX...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Skip authentication for now - go directly to dashboard
  // if (!state.isAuthenticated) {
  //   return (
  //     <WelcomeScreen
  //       onSignIn={handleSignIn}
  //       isMiniApp={true}
  //       isLoading={isLoading}
  //       error={state.error}
  //     />
  //   );
  // }

  // Show main app directly without authentication
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F1A' }}>
      {/* Sidebar for Desktop */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
      />

      {/* Mobile Header */}
      <MobileHeader isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="md:pl-64">
        <div className="px-4 py-6 md:px-8 pb-20 md:pb-6">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'leaderboard' && <LeaderboardContent />}
          {activeTab === 'tasks' && <SocialTasksContent />}
          {activeTab === 'nfts' && <NFTCollectionContent />}
          {activeTab === 'info' && <InformationContent />}
          {activeTab === 'admin' && <AdminContent />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
      />
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
