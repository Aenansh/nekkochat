import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react";
import { Toaster } from "./components/ui/sonner.tsx";
import { dark } from "@clerk/themes";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      domain={window.location.host}
      isSatellite={true}
      signInUrl="https://nekkodojo.vercel.app/sign-in"
      afterSignOutUrl={"/"}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#E5B73B",
          colorBackground: "#0C0806",
          colorText: "#E8E6E3",
          colorTextSecondary: "#A19D98",
          colorInputBackground: "#1A1A1A",
          colorInputText: "#E8E6E3",
          colorDanger: "#CC4444",
          borderRadius: "4px",
          fontFamily: '"Geist Mono", "Inter", sans-serif',
        },
        elements: {
          card: "border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm",
          headerTitle: "text-[#E5B73B] tracking-widest uppercase font-black",
          headerSubtitle: "text-[#E8E6E3]/60",
          socialButtonsBlockButton:
            "border border-[#E5B73B]/20 hover:bg-[#E5B73B]/10 rounded-sm transition-colors",
          formButtonPrimary:
            "bg-[#E5B73B]/10 border border-[#E5B73B]/50 text-[#E5B73B] hover:bg-[#E5B73B] hover:text-[#0C0806] rounded-sm uppercase tracking-widest text-xs font-bold transition-colors",
          formFieldInput:
            "border border-[#E5B73B]/20 focus:border-[#E5B73B]/60 rounded-sm transition-all",
          footerActionLink: "text-[#E5B73B] hover:text-[#E5B73B]/80",
          dividerLine: "bg-[#E5B73B]/20",
          dividerText: "text-[#E5B73B]/50",
        },
      }}
    >
      <App />
      <Toaster />
    </ClerkProvider>
  </StrictMode>,
);
