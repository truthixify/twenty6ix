"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppProvider, useApp } from "~/contexts/AppContext";
import { SignInWithFarcaster } from "~/components/auth/SignInWithFarcaster";
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
  const [isAppReady, setIsAppReady] = useState(false);

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

  // Call ready when SDK is loaded and app is ready
  useEffect(() => {
    const callReady = async () => {
      try {
        // Wait a bit to ensure the app is fully loaded and rendered
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Call the Farcaster SDK ready function
        await sdk.actions.ready();
        console.log('✅ Farcaster SDK ready() called successfully');
        setIsAppReady(true);
      } catch (error) {
        console.error('❌ Error calling sdk.actions.ready():', error);
        // Fallback to Neynar actions if available
        if (isSDKLoaded && actions) {
          try {
            actions.ready();
            console.log('✅ Fallback to Neynar actions.ready() successful');
            setIsAppReady(true);
          } catch (fallbackError) {
            console.error('❌ Fallback ready() also failed:', fallbackError);
            // Set ready anyway to prevent infinite loading
            setIsAppReady(true);
          }
        } else {
          // Set ready anyway to prevent infinite loading
          setIsAppReady(true);
        }
      }
    };

    // Only call ready when we have a loaded state and user data
    if (isSDKLoaded && state.user) {
      callReady();
    } else if (isSDKLoaded) {
      // If no user but SDK is loaded, still call ready after a delay
      setTimeout(() => {
        callReady();
      }, 1000);
    }
  }, [isSDKLoaded, actions, state.user]);

  // Handle sign in
  const handleSignIn = async (userData: { fid: number; username?: string; pfpUrl?: string; bio?: string }) => {
    setIsLoading(true);
    try {
      await signInWithFarcaster(userData);
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInError = (error: string) => {
    console.error('Sign in error:', error);
    // You could show a toast or error message here
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

  // Show loading screen until app is ready
  if (!isAppReady) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#0A0F1A' }}>
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-b-2 border-[#00A3AD]"></div>
          <p className="text-white">Loading TWENTY6IX...</p>
          <p className="text-[#B8C1D0] text-sm mt-2">Initializing Farcaster Mini App</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not authenticated
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0A0F1A' }}>
        <SignInWithFarcaster
          onSuccess={handleSignIn}
          onError={handleSignInError}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Show main app after authentication
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
