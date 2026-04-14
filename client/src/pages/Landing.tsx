import { Show, SignInButton } from "@clerk/react";
import { ArrowRight, MessageSquare, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    // Background: Warm Shoji Paper (#F4EFE6), Text: Deep Wood (#2C1A0F)
    <div className="min-h-screen bg-[#F4EFE6] text-[#2C1A0F] font-sans selection:bg-[#D4AF37]/30">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          {/* Logo Icon: Gold Accent */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-[#2C1A0F] shadow-sm">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-wide text-[#2C1A0F]">
            Nekkochat
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          {/* Wood Light for subtle links */}
          <a
            href="https://nekkodojo.vercel.app"
            className="text-[#8B5A2B] hover:text-[#2C1A0F] transition-colors"
          >
            Back to Dojo
          </a>

          <Show when="signed-out">
            <SignInButton mode="modal">
              {/* Primary Wood Button */}
              <button className="rounded-full bg-[#4A2F1D] px-6 py-2.5 text-[#F4EFE6] transition-all hover:bg-[#8B5A2B] hover:shadow-md">
                Enter Dojo
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            {/* Primary Gold Button */}
            <a
              href="/chat"
              className="rounded-full bg-[#D4AF37] px-6 py-2.5 text-[#2C1A0F] font-semibold transition-all hover:bg-[#F3C937] hover:shadow-md"
            >
              Open Chat Scroll
            </a>
          </Show>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-32 text-center">
        <div className="mx-auto max-w-3xl">
          {/* Status Pill: Tatami Mat background with Gold pulse */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#8B5A2B]/20 bg-[#E8DFCE] px-4 py-1.5 text-xs font-semibold text-[#8B5A2B]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4AF37]"></span>
            </span>
            Dojo Gates Open
          </div>

          <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight text-[#2C1A0F] md:text-7xl">
            Focus your mind. <br />
            <span className="text-[#8B5A2B]">Connect your spirit.</span>
          </h1>

          <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-[#4A2F1D]/80">
            Leave the noise outside the gates. Nekkochat is a highly
            disciplined, minimalist messaging environment forged for focused
            collaboration.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Show when="signed-in">
              <a
                href="/chat"
                className="group flex items-center gap-2 rounded-full bg-[#4A2F1D] px-8 py-4 text-sm font-medium text-[#F4EFE6] transition-all hover:bg-[#8B5A2B] hover:shadow-lg hover:-translate-y-0.5"
              >
                Unroll the Scrolls
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="group flex items-center gap-2 rounded-full bg-[#4A2F1D] px-8 py-4 text-sm font-medium text-[#F4EFE6] transition-all hover:bg-[#8B5A2B] hover:shadow-lg hover:-translate-y-0.5">
                  Begin Your Training
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      {/* Wood Light border to separate the section cleanly */}
      <section className="border-t border-[#8B5A2B]/20 bg-[#E8DFCE]/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Feature Cards: Tatami Mat background (#E8DFCE) */}
            <div className="group rounded-xl bg-[#E8DFCE] border border-[#8B5A2B]/10 p-8 shadow-sm transition-all hover:shadow-md hover:border-[#8B5A2B]/30">
              <div className="mb-6 inline-flex rounded-lg bg-[#4A2F1D] p-3 text-[#D4AF37]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-[#2C1A0F]">
                Lightning Fast
              </h3>
              <p className="text-sm leading-relaxed text-[#4A2F1D]/80">
                Strikes faster than the eye can see. Profiles and messages are
                cached in Upstash Redis for sub-millisecond retrieval.
              </p>
            </div>

            <div className="group rounded-xl bg-[#E8DFCE] border border-[#8B5A2B]/10 p-8 shadow-sm transition-all hover:shadow-md hover:border-[#8B5A2B]/30">
              <div className="mb-6 inline-flex rounded-lg bg-[#4A2F1D] p-3 text-[#D4AF37]">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-[#2C1A0F]">
                Iron Clad
              </h3>
              <p className="text-sm leading-relaxed text-[#4A2F1D]/80">
                Guarded by Clerk infrastructure. Every socket connection is
                cryptographically verified against your true Dojo identity.
              </p>
            </div>

            <div className="group rounded-xl bg-[#E8DFCE] border border-[#8B5A2B]/10 p-8 shadow-sm transition-all hover:shadow-md hover:border-[#8B5A2B]/30">
              <div className="mb-6 inline-flex rounded-lg bg-[#4A2F1D] p-3 text-[#D4AF37]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-[#2C1A0F]">
                Flowing Harmony
              </h3>
              <p className="text-sm leading-relaxed text-[#4A2F1D]/80">
                Your data flows like water between our distributed architecture,
                syncing Postgres and MongoDB silently in the background.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
