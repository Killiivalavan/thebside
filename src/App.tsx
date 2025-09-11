import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Album from "./pages/Album";
import Artist from "./pages/Artist";
import Track from "./pages/Track";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/discover" element={<Layout />}>
            <Route index element={<Discover />} />
          </Route>
          <Route path="/album/:id" element={<Layout />}>
            <Route index element={<Album />} />
          </Route>
          <Route path="/artist/:id" element={<Layout />}>
            <Route index element={<Artist />} />
          </Route>
          <Route path="/track/:id" element={<Layout />}>
            <Route index element={<Track />} />
          </Route>
          <Route path="/profile/:username" element={<Layout />}>
            <Route index element={<Profile />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
