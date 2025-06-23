import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import StagewiseWrapper from '@/components/StagewiseWrapper';
import { useAuth } from "./context/AuthContext";

import Index from "./pages/Index";
import CafeDetailPage from "./pages/CafeDetailPage";
import ListingsPage from "./features/rentals/pages/ListingsPage";
import ListingDetailPage from "./features/rentals/pages/ListingDetailPage";
import CreateListingPage from "./features/rentals/pages/CreateListingPage";
import EditListingPage from "./features/rentals/pages/EditListingPage";
import MyApplicationsPage from "./features/rentals/pages/MyApplicationsPage";
import MyListingsPage from "./features/rentals/pages/MyListingsPage";
import ManageListingApplications from "./features/rentals/pages/ManageListingApplications";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ConfirmSignUpPage from "./pages/ConfirmSignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserProfilePage from "./features/profile/pages/UserProfilePage";
import NotFound from "./pages/NotFound";
import AccountPage from "./pages/AccountPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CreateProfilePage from "./pages/CreateProfilePage";
import StagewiseTest from "./pages/StagewiseTest";

import GlobalHeader from "./components/GlobalHeader";
import { TopNavBar } from "./components/TopNavBar";
import { RegionalFilterBar } from "./components/RegionalFilterBar";
import ScrollToTop from "./components/ScrollToTop";
import { useLocation, useSearchParams } from "react-router-dom";

const queryClient = new QueryClient();

// Main Layout component that provides the shared layout and scroll restoration
const MainLayout = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Show TopNavBar only on Rental-related pages (Rule 2)
  const showTopNav = (location.pathname.startsWith('/listings') || 
                     location.pathname.startsWith('/my-listings') || 
                     location.pathname.startsWith('/my-applications') ||
                     location.pathname === '/create-listing') &&
                     !location.pathname.startsWith('/login') &&
                     !location.pathname.startsWith('/signup');
  
  // Show RegionalFilterBar only on Food, Bar, or Cowork pages (not on Rental)
  const showRegionalFilter = location.pathname === '/' && 
                            ['food', 'bar', 'cowork'].includes(searchParams.get('type') || 'food');

  // Check if we're on a detail page that needs full background
  const isDetailPage = location.pathname.startsWith('/places/');
  
  // Check if we're on a rental detail page (listings/:id or my-listings/:id) for sticky nav
  const isRentalDetailPage = location.pathname.match(/^\/listings\/[^\/]+$/) || 
                             location.pathname.match(/^\/my-listings\/[^\/]+$/);
  
  // Check if we're on AccountPage (which needs full viewport for centering)
  const isAccountPage = location.pathname === '/account';
  
  // Hide GlobalHeader on detail pages
  const hideGlobalHeader = location.pathname.startsWith('/places/') || 
                          location.pathname.match(/^\/listings\/[^\/]+$/) || 
                          location.pathname.match(/^\/my-listings\/[^\/]+$/);

  return (
    <div className={isDetailPage ? '' : 'min-h-screen bg-background-creamy'}>
      <ScrollToTop />
      {!isAccountPage && !hideGlobalHeader && <GlobalHeader />}
      {showRegionalFilter && <RegionalFilterBar />}
      {showTopNav && (
        <div className="sticky top-0 z-50">
          <TopNavBar />
        </div>
      )}
      <Outlet />
    </div>
  );
};

// Route configuration for createBrowserRouter
const routeObjects = [
  {
    path: "/",
    element: <MainLayout />, // All routes use this main layout
    children: [
      {
        index: true, // Represents the default child route for parent path "/"
        element: <Index />,
      },
      {
        path: "places/:placeId", // Note: no leading slash for child routes
        element: <CafeDetailPage />,
      },
      {
        path: "listings", // Rental listings page
        element: <ListingsPage />,
      },
      {
        path: "listings/:listingId", // Listing detail page
        element: <ListingDetailPage />,
      },
      {
        path: "listings/:listingId/edit", // Edit listing page - Protected
        element: <ProtectedRoute><EditListingPage /></ProtectedRoute>,
      },
      {
        path: "create-listing", // AI-assisted listing creation page - Protected
        element: <ProtectedRoute><CreateListingPage /></ProtectedRoute>,
      },
      {
        path: "my-applications", // User's applications management page - Protected
        element: <ProtectedRoute><MyApplicationsPage /></ProtectedRoute>,
      },
      {
        path: "my-listings", // Property owner's listings management page - Protected
        element: <ProtectedRoute><MyListingsPage /></ProtectedRoute>,
      },
      {
        path: "my-listings/:listingId", // My listing detail page - Protected
        element: <ProtectedRoute><ListingDetailPage /></ProtectedRoute>,
      },
      {
        path: "my-listings/:listingId/manage", // Manage applications for a specific listing - Protected
        element: <ProtectedRoute><ManageListingApplications /></ProtectedRoute>,
      },
      {
        path: "profile", // User profile management page - Protected
        element: <ProtectedRoute><UserProfilePage /></ProtectedRoute>,
      },
      {
        path: "login", // Login page
        element: <LoginPage />,
      },
      {
        path: "signup", // Sign up page
        element: <SignUpPage />,
      },
      {
        path: "confirm-signup", // Confirm sign up page
        element: <ConfirmSignUpPage />,
      },
      {
        path: "forgot-password", // Forgot password page
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password", // Reset password page
        element: <ResetPasswordPage />,
      },
      {
        path: "create-profile", // Profile creation page for authenticated users without profile
        element: <CreateProfilePage />,
      },
      {
        path: "stagewise-test", // Test page for Stagewise integration (development only)
        element: <StagewiseTest />,
      },
      {
        path: "*", // Catch-all for 404 pages
        element: <NotFound />,
      },
    ],
  },
];

// Create router instance using Data Router API
const router = createBrowserRouter(routeObjects);

function App() {
  // 1. 使用我们更可靠的 AuthContext 获取加载状态
  const { isAuthLoading } = useAuth();

  // 2. 当 AuthContext 仍在加载关键信息时，显示一个全屏的加载动画，阻止渲染任何子路由
  // 这是解决硬刷新竞态条件问题的关键：在状态明确前，不渲染任何路由
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading application...</p>
          <p className="text-base text-gray-500 mt-2">Please wait while we initialize your session</p>
        </div>
      </div>
    );
  }
  
  // 3. 只有当加载完成后，才渲染真正的应用布局和路由
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UIToaster />
        <Sonner />
        <RouterProvider router={router} />
        <StagewiseWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
