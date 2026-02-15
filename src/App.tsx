import ClarifyGoal from "./pages/ClarifyGoal";
import DiscoverGoal from "./pages/DiscoverGoal";
import DiscoverGoalMatches from "./pages/DiscoverGoalMatches";
import DiscoverGoalDeepDive from "./pages/DiscoverGoalDeepDive";
import DiscoverGoalFinalSummary from "./pages/DiscoverGoalFinalSummary";
import StuckGoal from "./pages/StuckGoal";
import StuckGoalSolutions from "./pages/StuckGoalSolutions";
import AlternativeGoals from "./pages/AlternativeGoals";
import AlternativeGoalsResult from "./pages/AlternativeGoalsResult";
import TaskScheduleSelection from "./pages/TaskScheduleSelection";
import TaskAchievementGoal from "./pages/TaskAchievementGoal";
import DailyGoalTracker from "./pages/DailyGoalTracker";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import Start from "./pages/Start";
import GoalDashboard from "./pages/GoalDashboard";
import Subscription from "./pages/Subscription";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Activity from "./pages/Activity";
import Goals from "./pages/Goals";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Infinigram from "./pages/Infinigram";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import InfinigramAuthWrapper from "./pages/infinigram/InfinigramAuthWrapper";
import InfinigamHome from "./pages/infinigram/InfinigamHome";
import InfinigamProfile from "./pages/infinigram/InfinigamProfile";
import InfinigamEditProfile from "./pages/infinigram/InfinigramEditProfile";
import InfinigamLayout from "./pages/infinigram/InfinigamLayout";
import InfinigamCreate from "./pages/infinigram/InfinigamCreate";
import InfinigamRecord from "./pages/infinigram/InfinigamRecord";
import InfinigamUpload from "./pages/infinigram/InfinigamUpload";
import InfinigamPostDetails from "./pages/infinigram/InfinigamPostDetails";
import InfinigamShare from "./pages/infinigram/InfinigamShare";
import InfinigamExplore from "./pages/infinigram/InfinigamExplore";
import InfinigamNotifications from "./pages/infinigram/InfinigamNotifications";
import InfinigamMessageList from "./pages/infinigram/InfinigamMessageList";
import InfinigamChat from "./pages/infinigram/InfinigamChat";
const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleShowAuthModal = () => {
      setShowAuthModal(true);
    };

    window.addEventListener('showAuthModal', handleShowAuthModal);
    return () => window.removeEventListener('showAuthModal', handleShowAuthModal);
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/task-schedule-selection" element={user ? <TaskScheduleSelection /> : <Index />} />
            <Route path="/task-achievement-goal" element={user ? <TaskAchievementGoal /> : <Index />} />
            <Route path="/daily-goal-tracker" element={user ? <DailyGoalTracker /> : <Index />} />
            <Route path="/start" element={user ? <Start /> : <Index />} />
            <Route path="/goal-dashboard" element={user ? <GoalDashboard /> : <Index />} />
            <Route path="/clarify-goal" element={user ? <ClarifyGoal /> : <Index />} />
            <Route path="/discover-goal" element={user ? <DiscoverGoal /> : <Index />} />
            <Route path="/discover-goal-matches" element={user ? <DiscoverGoalMatches /> : <Index />} />
            <Route path="/discover-goal-deep-dive" element={user ? <DiscoverGoalDeepDive /> : <Index />} />
            <Route path="/discover-goal-final-summary" element={user ? <DiscoverGoalFinalSummary /> : <Index />} />
            <Route path="/stuck-goal" element={user ? <StuckGoal /> : <Index />} />
            <Route path="/stuck-goal-solutions" element={user ? <StuckGoalSolutions /> : <Index />} />
            <Route path="/alternative-goals" element={user ? <AlternativeGoals /> : <Index />} />
            <Route path="/alternative-goals-result" element={user ? <AlternativeGoalsResult /> : <Index />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={user ? <Profile /> : <Index />} />
            <Route path="/activity" element={user ? <Activity /> : <Index />} />
            <Route path="/goals" element={user ? <Goals /> : <Index />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={user ? <History /> : <Index />} />
            <Route path="/infinigram" element={<Infinigram />} />
            <Route path="/ai-assistant" element={user ? <AIAssistant /> : <Index />} />
            <Route path="/infinigram/create" element={<InfinigamCreate />} />

            {/* Infinigram Auth Route - No Sidebar */}
            <Route path="/infinigram/auth" element={<InfinigramAuthWrapper />} />
          </Route>

          {/* Infinigram Routes with Sidebar Layout */}
          <Route element={<InfinigamLayout />}>
            <Route path="/infinigram/home" element={<InfinigamHome />} />
            <Route path="/infinigram/profile" element={<InfinigamProfile />} />
            <Route path="/infinigram/profile/:email" element={<InfinigamProfile />} />
            <Route path="/infinigram/edit-profile" element={<InfinigamEditProfile />} />
            <Route path="/infinigram/create/record" element={<InfinigamRecord />} />
            <Route path="/infinigram/create/upload" element={<InfinigamUpload />} />
            <Route path="/infinigram/create/details" element={<InfinigamPostDetails />} />
            <Route path="/infinigram/create/share" element={<InfinigamShare />} />
            <Route path="/infinigram/explore" element={<InfinigamExplore />} />
            <Route path="/infinigram/notifications" element={<InfinigamNotifications />} />
            <Route path="/infinigram/messages" element={<InfinigamMessageList />} />
            <Route path="/infinigram/chat/:otherEmail" element={<InfinigamChat />} />
            <Route
              path="/infinigram/explore"
              element={<InfinigamExplore />}
            />
            <Route
              path="/infinigram/notifications"
              element={<InfinigamNotifications />}
            />
            <Route
              path="/infinigram/posts"
              element={
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">My Posts</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Coming Soon 🚀</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/infinigram/settings"
              element={
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Settings</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Coming Soon 🚀</p>
                  </div>
                </div>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
