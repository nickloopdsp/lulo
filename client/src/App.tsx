import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Search from "@/pages/search";
import AddItem from "@/pages/add-item";
import Closet from "@/pages/closet";
import Profile from "@/pages/profile";
import Wishlist from "@/pages/wishlist";
import Lookbooks from "@/pages/lookbooks";
import StyleIconsPage from "@/pages/style-icons";
import NotFound from "@/pages/not-found";
import SocialActivity from "@/pages/social-activity";
import Notifications from "@/pages/notifications";
import UserProfile from "@/pages/user-profile";
import ProductDetail from "@/pages/product-detail";
import NewsfeedPage from "@/pages/newsfeed";
import ArticlePage from "@/pages/article";
import BoardroomPage from "@/pages/boardroom";
import ChatPage from "@/pages/chat";
import UploadPage from "@/pages/upload";
import VisualSearchPage from "@/pages/visual-search";
import VisualSearchResultsPage from "@/pages/visual-search-results";
import LinkUploadPage from "@/pages/link-upload";
import TopNavigation from "@/components/top-navigation";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      {/* Profile page without top navigation */}
      <Route path="/profile">
        <div className="mobile-app-container">
          <Profile />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Notifications page without top navigation */}
      <Route path="/notifications">
        <div className="mobile-app-container">
          <Notifications />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Newsfeed page without top navigation */}
      <Route path="/newsfeed">
        <div className="mobile-app-container">
          <NewsfeedPage />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Article page without top navigation */}
      <Route path="/article/:articleId">
        <div className="mobile-app-container">
          <ArticlePage />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Boardroom page without top navigation */}
      <Route path="/boardroom">
        <div className="mobile-app-container">
          <BoardroomPage />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Chat page without top or bottom navigation */}
      <Route path="/chat/:chatId">
        <div className="mobile-app-container">
          <ChatPage />
        </div>
      </Route>
      
      {/* Upload page without top navigation */}
      <Route path="/upload">
        <div className="mobile-app-container">
          <UploadPage />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Visual Search pages without top navigation */}
      <Route path="/visual-search">
        <div className="mobile-app-container">
          <VisualSearchPage />
          <BottomNavigation />
        </div>
      </Route>
      
      <Route path="/visual-search/results">
        <div className="mobile-app-container">
          <VisualSearchResultsPage />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Link Upload page without top navigation */}
      <Route path="/link-upload">
        <div className="mobile-app-container">
          <LinkUploadPage />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* Social page without top navigation */}
      <Route path="/social">
        <div className="mobile-app-container">
          <SocialActivity />
          <BottomNavigation />
        </div>
      </Route>
      
      {/* User profile page without top navigation */}
      <Route path="/user/:userId">
        <div className="mobile-app-container">
          <UserProfile />
        </div>
      </Route>
      
      {/* Product detail page without top navigation */}
      <Route path="/item/:id">
        <div className="mobile-app-container">
          <ProductDetail />
        </div>
      </Route>
      
      {/* All other pages with top navigation */}
      <Route>
        <div className="mobile-app-container">
          <TopNavigation />
          <Switch>
            <Route path="/" component={Wishlist} />
            <Route path="/wishlist" component={Wishlist} />
            <Route path="/shopping" component={Wishlist} />
            <Route path="/closet" component={Closet} />
            <Route path="/lookbooks" component={Lookbooks} />
            <Route path="/search" component={Search} />
            <Route path="/add-item" component={AddItem} />
            <Route path="/style-icons" component={StyleIconsPage} />
            <Route component={NotFound} />
          </Switch>
          <BottomNavigation />
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
