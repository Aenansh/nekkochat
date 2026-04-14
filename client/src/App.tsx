import { Show } from "@clerk/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import ChatInitWrapper from "./components/chatInitWrapper";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE: Anyone can see the Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* PROTECTED ROUTE: The actual Chat Application */}
        <Route
          path="/chat"
          element={
            <>
              {/* IF LOGGED IN: Sync them with MongoDB and show the chat */}
              <Show when="signed-in">
                <ChatInitWrapper>
                  {/* Replace this div with your actual ChatLayout component later! */}
                  <div className="flex h-screen w-full items-center justify-center bg-stone-900 text-stone-100">
                    <h1 className="text-2xl font-semibold tracking-wide">
                      Welcome to the Chat World
                    </h1>
                  </div>
                </ChatInitWrapper>
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
