import { useUser } from "@clerk/react";
import { LucideCircleArrowRight } from "lucide-react";

export default function Header() {
  // We use this hook to grab the user's data (like their profile picture) directly
  const { user } = useUser();

  return (
    <header className="relative z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#E8E6E3]/10 bg-[#0C0806]/80 px-6 backdrop-blur-md">
      {/* LEFT: Branding & Status */}
      <div className="flex items-center gap-4">
        {/* Exact same glowing logo from the landing page */}
        <span className="text-xl font-black tracking-widest text-[#E8E6E3]">
          NEKKO
          <span className="text-[#E5B73B] drop-shadow-[0_0_8px_rgba(229,183,59,0.5)]">
            CHAT
          </span>
        </span>

        {/* Subtle decorative divider */}
        <div className="hidden h-4 w-px bg-[#E8E6E3]/20 sm:block"></div>

        {/* System Status Text */}
        <span className="hidden items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-[#E5B73B] sm:flex uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E5B73B] opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E5B73B]"></span>
          </span>
          Secure Link Active
        </span>
      </div>

      {/* RIGHT: Navigation & Profile */}
      <div className="flex items-center gap-2">
        {/* Custom 1-Click Profile Avatar */}
        {user &&
          (user.username ? (
            <a
              href={`https://nekkodojo.vercel.app/member/${user.username}`}
              title="View Dojo Profile"
              className="group relative flex items-center justify-center rounded-full border border-[#E5B73B]/30 p-0.5 transition-all hover:border-[#E5B73B]"
            >
              {/* The actual profile picture */}
              <img
                src={user.imageUrl}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover transition-transform group-hover:scale-95"
              />

              {/* The outer glowing ring on hover */}
              <div className="absolute inset-0 rounded-full ring-2 ring-[#E5B73B] opacity-0 blur-[2px] transition-opacity group-hover:opacity-100"></div>
            </a>
          ) : (
            <div
              title="Profile"
              className="group relative flex items-center justify-center rounded-full border border-[#E5B73B]/30 p-0.5 transition-all hover:border-[#E5B73B]"
            >
              {/* The actual profile picture */}
              <img
                src={user.imageUrl}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover transition-transform group-hover:scale-95"
              />

              {/* The outer glowing ring on hover */}
              <div className="absolute inset-0 rounded-full ring-2 ring-[#E5B73B] opacity-0 blur-[2px] transition-opacity group-hover:opacity-100"></div>
            </div>
          ))}
        <a
          href="https://nekkodojo.vercel.app"
          className="group hidden sm:flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#E8E6E3]/50 transition-colors hover:text-[#E5B73B]"
        >
          <LucideCircleArrowRight className="h-10 w-10 hover:bg-[#E5B73B]/5 rounded-full p-1" />
        </a>
      </div>
    </header>
  );
}
