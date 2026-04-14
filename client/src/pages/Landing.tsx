import { Show, SignInButton } from "@clerk/react";
import { ArrowRight, MessageSquare, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-emerald-200">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-medium tracking-wide text-stone-700">
            Nekkochat
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <a
            href="https://nekkodojo.vercel.app"
            className="text-stone-500 hover:text-stone-800 transition-colors"
          >
            Back to Dojo
          </a>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full bg-stone-800 px-5 py-2.5 text-stone-100 transition-all hover:bg-stone-700 hover:shadow-md">
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <a
              href="/chat"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-white transition-all hover:bg-emerald-700 hover:shadow-md"
            >
              Open App
            </a>
          </Show>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-32 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/50 px-4 py-1.5 text-xs font-semibold text-stone-500 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Systems Online & Synced
          </div>

          <h1 className="mb-8 text-5xl font-semibold leading-tight tracking-tight text-stone-800 md:text-7xl">
            A calm space to <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-indigo-500">
              connect & collaborate.
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-stone-500">
            Step away from the noise. Nekkochat is a minimalist,
            high-performance messaging environment designed strictly for focused
            conversations and seamless sharing.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Show when="signed-in">
              <a
                href="/chat"
                className="group flex items-center gap-2 rounded-full bg-stone-800 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-stone-700 hover:shadow-lg hover:-translate-y-0.5"
              >
                Enter the Chat World
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="group flex items-center gap-2 rounded-full bg-stone-800 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-stone-700 hover:shadow-lg hover:-translate-y-0.5">
                  Join the Network
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="border-t border-stone-200/60 bg-white/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group rounded-3xl bg-[#FDFBF7] p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex rounded-2xl bg-indigo-50 p-4 text-indigo-500 transition-colors group-hover:bg-indigo-100">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-medium text-stone-800">
                Redis Accelerated
              </h3>
              <p className="text-sm leading-relaxed text-stone-500">
                Sub-millisecond data retrieval powered by Upstash. Your profile
                and chats load instantly before you even blink.
              </p>
            </div>

            <div className="group rounded-3xl bg-[#FDFBF7] p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex rounded-2xl bg-emerald-50 p-4 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-medium text-stone-800">
                Clerk Verified
              </h3>
              <p className="text-sm leading-relaxed text-stone-500">
                Enterprise-grade security. Every message and socket connection
                is cryptographically verified through your Dojo identity.
              </p>
            </div>

            <div className="group rounded-3xl bg-[#FDFBF7] p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 inline-flex rounded-2xl bg-amber-50 p-4 text-amber-600 transition-colors group-hover:bg-amber-100">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-medium text-stone-800">
                Seamless Sync
              </h3>
              <p className="text-sm leading-relaxed text-stone-500">
                Built on a distributed architecture. Your data flows
                effortlessly between Postgres and MongoDB in real-time via
                webhooks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
