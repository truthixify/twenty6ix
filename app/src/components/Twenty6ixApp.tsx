"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppProvider, useApp } from "~/contexts/AppContext";
import { MiniAppAuth } from "~/components/auth/MiniAppAuth";
import { DashboardContent } from "~/components/pages/DashboardContent";
import { LeaderboardContent } from "~/components/pages/LeaderboardContent";
import { SocialTasksContent } from "~/components/pages/SocialTasksContent";
import { NFTCollectionContent } from "~/components/pages/NFTCollectionContent";
import { InformationContent } from "~/components/pages/InformationContent";
import { AdminContent } from "~/components/pages/AdminContent";
import { Sidebar } from "~/components/features/Sidebar";
import { MobileNavigation } from "~/components/features/MobileNavigation";
import { MobileHeader } from "~/components/features/MobileHeader";
import { EarlyBirdPopup } from "~/components/features/EarlyBirdPopup";
import { useToast } from "~/components/ui/Toast";
import { Twenty6ixButton } from "~/components/ui/Twenty6ixButton";
import { Zap } from "lucide-react";

export interface Twenty6ixAppProps {
  title?: string;
}

function Twenty6ixAppContent({ title }: Twenty6ixAppProps) {
  const {
    isSDKLoaded,
    context,
    actions,
  } = useMiniApp();

  const { state, signInWithFarcaster, updateProfile, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAppReady, setIsAppReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEarlyBirdPopup, setShowEarlyBirdPopup] = useState(false);
  const [earlyBirdLoading, setEarlyBirdLoading] = useState(false);
  const { showToast, ToastContainer } = useToast();

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

  // Early Bird popup logic - Show for new users per PRD
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.user.xp_total === 0) {
      // Check if user already claimed Early Bird
      if (state.user.early_bird_claimed) {
        return // Don't show if already claimed
      }
      
      // Check if user is eligible for Early Bird (first 3,000 users)
      // For now, show to all new users - backend will handle the limit
      const hasSeenEarlyBird = localStorage.getItem(`earlybird_seen_${state.user.fid}`);
      if (!hasSeenEarlyBird) {
        setShowEarlyBirdPopup(true);
      }
    }
  }, [state.isAuthenticated, state.user]);

  const handleEarlyBirdClaim = async () => {
    if (!state.user) return;
    
    // Check if already claimed
    if (state.user.early_bird_claimed) {
      showToast('❌ Early Bird NFT already claimed', 'error');
      setShowEarlyBirdPopup(false);
      return;
    }
    
    setEarlyBirdLoading(true);
    try {
      console.log('🎯 Claiming Early Bird NFT for user:', state.user.fid);
      
      // TODO: Implement actual Early Bird NFT claiming via API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Update user XP and mark Early Bird as claimed
      const newXP = state.user.xp_total + 100;
      console.log('✅ Updating user XP from', state.user.xp_total, 'to', newXP);
      
      const updatedUser = {
        ...state.user,
        xp_total: newXP,
        early_bird_claimed: true
      };
      
      // Update via dispatch for immediate UI update
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      // Also update via updateProfile for database sync (if available)
      try {
        await updateProfile({ 
          xp_total: newXP,
          early_bird_claimed: true
        });
        console.log('✅ Profile updated in database');
      } catch (dbError) {
        console.warn('⚠️ Database update failed, but XP updated locally:', dbError);
      }
      
      // Mark as seen so it doesn't show again
      localStorage.setItem(`earlybird_seen_${state.user.fid}`, 'true');
      setShowEarlyBirdPopup(false);
      
      console.log('🎉 Early Bird NFT claimed successfully! +100 XP');
      
      // Show success notification
      showToast('🎉 Early Bird NFT claimed! +100 XP', 'success');
    } catch (error) {
      console.error('❌ Early Bird claim failed:', error);
      showToast('❌ Failed to claim Early Bird NFT', 'error');
    } finally {
      setEarlyBirdLoading(false);
    }
  };

  const handleEarlyBirdClose = () => {
    if (!state.user) return;
    
    // Mark as seen even if they close it
    localStorage.setItem(`earlybird_seen_${state.user.fid}`, 'true');
    setShowEarlyBirdPopup(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#0A0F1A' }}>
        {/* Use proper Mini App authentication */}
        <MiniAppAuth
          onSuccess={handleSignIn}
          onError={handleSignInError}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Show welcome message for new users (first time login) or demo users
  const isNewUser = state.user && (state.user.xp_total === 0 || state.user.fid === 123456);
  
  if (isNewUser && showWelcome && activeTab === 'dashboard') {
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

        {/* Welcome Message */}
        <div className="md:pl-64">
          <div className="px-4 py-6 md:px-8 pb-20 md:pb-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Welcome back, @{state.user?.fid === 123456 ? 'demo-user' : state.user?.fid || 'user'}! 👋
                </h1>
                <p className="text-[#B8C1D0] text-lg">
                  You're now connected to TWENTY6IX
                </p>
                {state.user?.fid === 123456 && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#00A3AD]/20 to-[#A100FF]/20 border border-[#00A3AD]/30">
                    <span className="text-[#00A3AD] text-sm font-medium">🎯 Demo Mode</span>
                  </div>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 mb-8">
                <div className="p-6 bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-[#2A3441] rounded-xl">
                  <h3 className="text-white font-semibold mb-2">🎯 Your Mission</h3>
                  <p className="text-[#B8C1D0] text-sm">
                    Earn XP, complete tasks, and mint exclusive NFTs on Base
                  </p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-[#2A3441] rounded-xl">
                  <h3 className="text-white font-semibold mb-2">⚡ Get Started</h3>
                  <p className="text-[#B8C1D0] text-sm">
                    Make your first daily claim to earn XP and start your journey
                  </p>
                </div>
              </div>
              
              <Twenty6ixButton
                variant="claim"
                onClick={() => setShowWelcome(false)}
                className="px-8 py-3"
              >
                <Zap className="h-5 w-5" />
                Start Earning XP
              </Twenty6ixButton>
            </div>
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
          {activeTab === 'dashboard' && <DashboardContent onShowWelcome={() => setShowWelcome(true)} />}
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

      {/* Toast Container */}
      <ToastContainer />

      {/* Early Bird Popup */}
      <EarlyBirdPopup
        isOpen={showEarlyBirdPopup}
        onClose={handleEarlyBirdClose}
        onClaim={handleEarlyBirdClaim}
        isLoading={earlyBirdLoading}
        userCount={1250} // TODO: Get actual count from backend
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
