import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import Album from "./pages/Album";
import Artist from "./pages/Artist";
import Track from "./pages/Track";
import Profile from "./pages/Profile";
import ListPage from "./pages/List";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Discover />} />
            </Route>
            <Route path="/search" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Search />} />
            </Route>
            <Route path="/album/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Album />} />
            </Route>
            <Route path="/artist/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Artist />} />
            </Route>
            <Route path="/track/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Track />} />
            </Route>
            <Route path="/profile/:username" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Profile />} />
            </Route>
            <Route path="/list/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<ListPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
