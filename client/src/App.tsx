import { Show } from "@clerk/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import ChatInitializationWrapper from "./components/ChatInitWrapper";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC: The Rice Paper Exterior */}
        <Route path="/" element={<LandingPage />} />

        {/* PROTECTED: Inside the Wooden Dojo */}
        <Route
          path="/chat"
          element={
            <>
              <Show when="signed-in">
                <ChatInitializationWrapper>
                  {/* The core app layout uses Deep Wood (#2C1A0F) background and Rice Paper text */}
                  <div className="flex h-screen w-full items-center justify-center bg-[#2C1A0F] text-[#F4EFE6]">
                    {/* Placeholder for your actual ChatLayout component */}
                    <div className="text-center">
                      <div className="mb-4 inline-block rounded-full bg-[#4A2F1D] p-4 text-[#D4AF37]">
                        <svg
                          className="h-8 w-8 animate-pulse"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h1 className="text-2xl font-semibold tracking-wider text-[#D4AF37]">
                        Awaiting the Scrolls...
                      </h1>
                      <p className="mt-2 text-sm text-[#8B5A2B]">
                        Syncing your spirit with the Chat World.
                      </p>
                    </div>
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
