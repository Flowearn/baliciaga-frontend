import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";
import { withAuthenticator, Authenticator, AuthenticatorProps } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect, useState } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CafeDetailPage from "./pages/CafeDetailPage";
import UserProfileForm from "./features/rentals/components/UserProfileForm";
import ListingsPage from "./features/rentals/pages/ListingsPage";
import ListingDetailPage from "./features/rentals/pages/ListingDetailPage";
import CreateListingPage from "./features/rentals/pages/CreateListingPage";
import MyApplicationsPage from "./features/rentals/pages/MyApplicationsPage";
import MyListingsPage from "./features/rentals/pages/MyListingsPage";
import { fetchUserProfile, UserProfile } from "./services/userService";
import { toast } from "sonner";
import axios from "axios";

const queryClient = new QueryClient();

const formFields: AuthenticatorProps['formFields'] = {
  signUp: {
    email: {
      order: 1,
      isRequired: true,
    },
    password: {
      order: 2,
      isRequired: true,
    },
    confirm_password: {
      order: 3,
      isRequired: true,
    },
  },
};

// Root Layout component that provides the shared layout and scroll restoration
const RootLayout = () => (
  <>
    <Outlet />
    <ScrollRestoration 
      getKey={(location, matches) => {
        // Scroll restoration based on pathname and search params to ensure independent scroll position memory for different URL states
        return location.pathname + location.search;
      }} 
    />
  </>
);

// Route configuration for createBrowserRouter
const routeObjects = [
  {
    path: "/",
    element: <RootLayout />, // All routes use this root layout
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
        path: "create-listing", // AI-assisted listing creation page
        element: <CreateListingPage />,
      },
      {
        path: "my-applications", // User's applications management page
        element: <MyApplicationsPage />,
      },
      {
        path: "my-listings", // Property owner's listings management page
        element: <MyListingsPage />,
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

interface AppProps {
  signOut?: () => void;
  user?: {
    attributes?: {
      email?: string;
    };
  };
}

const App = ({ signOut, user }: AppProps) => {
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        setProfileExists(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // This is the expected "new user" case
          console.log("New user detected. Rendering profile form.");
          setProfileExists(false); // Update state to show UserProfileForm
        } else {
          // This is an unexpected error (like 500 error or network issues)
          console.error("An unexpected error occurred during profile check:", error);
          // Set error state to show error page
          toast.error('Failed to fetch user information. Please try again.');
          setProfileExists(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
  }, []);

  const handleProfileCreated = async () => {
    // Re-check user profile
    try {
      const profile = await fetchUserProfile();
      setUserProfile(profile);
      setProfileExists(true);
      toast.success('Welcome to Baliciaga!');
    } catch (error) {
      console.error('Error fetching updated profile:', error);
      toast.error('Failed to fetch user information');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If user hasn't created a profile, show profile creation form
  if (profileExists === false) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserProfileForm onProfileCreated={handleProfileCreated} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If there's an error or unknown state, show error page
  if (profileExists === null) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-4">Unable to load user information. Please refresh the page and try again.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show normal app interface
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
        {/* Debug info: Show current logged in user */}
        {user && (
          <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
            <p>👤 {user.attributes?.email}</p>
            {userProfile && <p>📝 {userProfile.profile.name}</p>}
            <button onClick={signOut} style={{ marginTop: '5px', padding: '5px 10px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default withAuthenticator(App, {
  formFields,
  loginMechanisms: ['email'],
});
