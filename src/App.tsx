import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CafeDetailPage from "./pages/CafeDetailPage";

const queryClient = new QueryClient();

// Root Layout component that provides the shared layout and scroll restoration
const RootLayout = () => (
  <>
    <Outlet />
    <ScrollRestoration 
      getKey={(location, matches) => {
        // 基于路径名和查询参数进行滚动恢复，确保不同的URL状态有独立的滚动位置记忆
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
        path: "*", // Catch-all for 404 pages
        element: <NotFound />,
      },
    ],
  },
];

// Create router instance using Data Router API
const router = createBrowserRouter(routeObjects);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
