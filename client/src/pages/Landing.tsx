import { Show, SignInButton } from "@clerk/react";
import { ArrowRight, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    // Deep dark espresso background with relative positioning for the grid
    <div className="min-h-screen bg-[#0C0806] text-[#E8E6E3] font-sans relative overflow-hidden selection:bg-[#E5B73B]/30">
      {/* Subtle Architectural Grid Background (matching your screenshot) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5B73B08_1px,transparent_1px),linear-gradient(to_bottom,#E5B73B08_1px,transparent_1px)] bg-size-[48px_48px]"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation */}
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-black tracking-widest">
              NEKKO
              <span className="text-[#E5B73B] drop-shadow-[0_0_12px_rgba(229,183,59,0.5)]">
                CHAT
              </span>
            </span>
            <span className="hidden text-xs font-mono tracking-[0.2em] text-[#E8E6E3]/40 sm:block uppercase">
              System Online
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium tracking-wide">
            <a
              href="https://nekkodojo.vercel.app"
              className="text-[#E8E6E3]/60 transition-colors hover:text-[#E5B73B]"
            >
              Back to Dojo
            </a>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 text-[#E8E6E3] transition-colors hover:text-[#E5B73B]">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              {/* Hollow Gold Border Button just like "START PRACTICE" */}
              <a
                href="/chat"
                className="border border-[#E5B73B] px-6 py-2.5 text-[#E5B73B] text-xs font-bold tracking-widest transition-all hover:bg-[#E5B73B]/10"
              >
                OPEN APP
              </a>
            </Show>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Small top text (like the Japanese text in your screenshot) */}
            <p className="mb-4 text-sm font-medium tracking-[0.3em] text-[#E5B73B]">
              ネットワークを極める
            </p>

            {/* Massive Glowing Title */}
            <h1 className="mb-6 text-7xl font-black tracking-tighter sm:text-8xl md:text-9xl">
              NEKKO
              <span className="text-[#E5B73B] drop-shadow-[0_0_40px_rgba(229,183,59,0.4)]">
                CHAT
              </span>
            </h1>

            {/* The divider with small text */}
            <div className="mb-8 flex items-center justify-center gap-4 text-[#E8E6E3]/40">
              <div className="h-px w-12 bg-[#E8E6E3]/20"></div>
              <span className="text-sm tracking-widest">通信</span>
              <div className="h-px w-12 bg-[#E8E6E3]/20"></div>
            </div>

            {/* Exact Subtitle formatting */}
            <p className="mx-auto mb-12 max-w-2xl text-lg font-light tracking-wide text-[#E8E6E3]/70">
              Enhance your{" "}
              <span className="font-semibold text-[#E8E6E3]">
                Communication & Collaboration
              </span>{" "}
              skills <br className="hidden sm:block" />
              in the sanctuary of code.
            </p>

            {/* Call to Action matching "START PRACTICE" */}
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Show when="signed-in">
                <a
                  href="/chat"
                  className="group flex items-center gap-3 border border-[#E5B73B] bg-[#E5B73B]/5 px-10 py-4 text-sm font-bold tracking-[0.2em] text-[#E5B73B] transition-all hover:bg-[#E5B73B]/15"
                >
                  ENTER SANCTUARY
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="group flex items-center gap-3 border border-[#E5B73B] bg-[#E5B73B]/5 px-10 py-4 text-sm font-bold tracking-[0.2em] text-[#E5B73B] transition-all hover:bg-[#E5B73B]/15">
                    INITIATE LINK
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignInButton>
              </Show>
            </div>
          </div>
        </main>

        {/* Faint Footer Elements to anchor the grid */}
        <div className="absolute bottom-8 left-8 text-xs font-mono tracking-widest text-[#E8E6E3]/20">
          SECURE CONNECTION // CONVERSE FREELY
        </div>
      </div>
    </div>
  );
}
