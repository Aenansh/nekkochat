import { Show } from "@clerk/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import ChatInitializationWrapper from "./components/ChatInitWrapper";
import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/chat"
          element={
            <>
              <Show when="signed-in">
                <ChatInitializationWrapper>
                  {/* The Chat App Wrapper matching the exact same dark grid theme */}
                  <div className="relative flex h-screen w-full flex-col bg-[#0C0806] text-[#E8E6E3] overflow-hidden">
                    {/* The same subtle background grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5B73B08_1px,transparent_1px),linear-gradient(to_bottom,#E5B73B08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none"></div>

                    {/* App Header (Inside the chat) */}
                    <Header/>

                    {/* Chat Layout Area (To be replaced with your Sidebar/Messages components) */}
                    <main className="relative z-10 flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <div className="mb-4 inline-block border border-[#E5B73B]/30 p-4 text-[#E5B73B]">
                          <svg
                            className="h-8 w-8 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-xl font-medium tracking-[0.2em] text-[#E5B73B]">
                          SYNCING SYSTEMS
                        </h2>
                      </div>
                    </main>
                  </div>
                </ChatInitializationWrapper>
              </Show>

              <Show when="signed-out">
                <Navigate to="/" replace />
              </Show>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
