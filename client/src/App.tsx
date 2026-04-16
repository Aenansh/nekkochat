import { Show } from "@clerk/react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LandingPage from "./pages/Landing";
import ChatInitializationWrapper from "./components/ChatInitWrapper";
import Header from "./components/Header";
import { AppSidebar } from "./components/AppSidebar";
import ChatInterface from "./pages/ChatInterface";

// 1. The Master Layout for the Dojo
// This keeps the sidebar and background grid persistent across all chat routes
const ChatLayout = () => {
  return (
    <>
      <Show when="signed-in">
        <ChatInitializationWrapper>
          <AppSidebar>
            {/* The right-side container */}
            <div className="relative flex h-screen w-full flex-col bg-[#0C0806] text-[#E8E6E3] overflow-hidden">
              {/* Global Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5B73B08_1px,transparent_1px),linear-gradient(to_bottom,#E5B73B08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none z-0"></div>

              {/* <Outlet /> renders whatever child route is active (Default or Target Chat) */}
              <Outlet />
            </div>
          </AppSidebar>
        </ChatInitializationWrapper>
      </Show>

      <Show when="signed-out">
        <Navigate to="/" replace />
      </Show>
    </>
  );
};

// 2. The Default Empty State (when just at /chat)
const DefaultChatScreen = () => {
  return (
    <>
      <Header />
    </>
  );
};

// 3. The Router Structure
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Parent Route wraps ALL chat views in the ChatLayout */}
        <Route path="/chat" element={<ChatLayout />}>
          {/* Index route: What renders at exactly "/chat" */}
          <Route index element={<DefaultChatScreen />} />

          {/* Nested route: What renders at "/chat/:chatId" */}
          <Route path=":chatId" element={<ChatInterface />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
