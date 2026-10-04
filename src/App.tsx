/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
const Onboarding = React.lazy(() => import("./components/onboarding/Onboarding").then(m => ({ default: m.Onboarding })));
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const WhatIfSimulator = React.lazy(() => import("./pages/WhatIfSimulator").then(m => ({ default: m.WhatIfSimulator })));
const Missions = React.lazy(() => import("./pages/Missions").then(m => ({ default: m.Missions })));
const Profile = React.lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const ActionPlan = React.lazy(() => import("./pages/ActionPlan").then(m => ({ default: m.ActionPlan })));
const Insights = React.lazy(() => import("./pages/Insights").then(m => ({ default: m.Insights })));
const FootprintBreakdown = React.lazy(() => import("./pages/FootprintBreakdown").then(m => ({ default: m.FootprintBreakdown })));
const DetailedAnalysis = React.lazy(() => import("./pages/DetailedAnalysis").then(m => ({ default: m.DetailedAnalysis })));
const Chat = React.lazy(() => import("./pages/Chat").then(m => ({ default: m.Chat })));
const Login = React.lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard").then(m => ({ default: m.Leaderboard })));
const ActivityHistory = React.lazy(() => import("./pages/ActivityHistory").then(m => ({ default: m.ActivityHistory })));
const Settings = React.lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
import { useAppStore } from "./store";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";

function ProtectedRoute({ children, allowOnboarding = false }: { children: React.ReactNode, allowOnboarding?: boolean }) {
  const { user, loading } = useAuth();
  const completedOnboarding = useAppStore(state => state.user.completedOnboarding);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (!completedOnboarding && !allowOnboarding) return <Navigate to="/onboarding" />;
  if (completedOnboarding && allowOnboarding) return <Navigate to="/" />;
  
  return allowOnboarding ? <>{children}</> : <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<ProtectedRoute allowOnboarding><Onboarding /></ProtectedRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><WhatIfSimulator /></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/actions" element={<ProtectedRoute><ActionPlan /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/footprint" element={<ProtectedRoute><FootprintBreakdown /></ProtectedRoute>} />
            <Route path="/detailed-analysis" element={<ProtectedRoute><DetailedAnalysis /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/activities" element={<ProtectedRoute><ActivityHistory /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

