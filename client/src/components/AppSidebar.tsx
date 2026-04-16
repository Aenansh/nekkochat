import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Search, Cat } from "lucide-react";
import NekkoSearch from "./NekkoSearch";
import ActiveScrolls from "./ActiveScrolls"; // 1. IMPORT THE NEW COMPONENT

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SidebarProvider className="dark">
      <div className="relative flex h-screen w-full bg-[#0C0806] text-[#E8E6E3] overflow-hidden">
        {/* The Dojo Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5B73B08_1px,transparent_1px),linear-gradient(to_bottom,#E5B73B08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none z-0"></div>

        {/* The Sidebar Itself */}
        <Sidebar className="border-r border-[#E5B73B]/20 bg-[#0C0806]! z-10">
          <SidebarHeader className="p-4 border-b border-[#E5B73B]/10">
            {/* BRANDING: Matching the Landing Page */}
            <div className="flex items-center gap-3 mb-6 px-2 mt-2">
              <div className="border border-[#E5B73B]/30 p-1.5 text-[#E5B73B] shadow-[0_0_10px_rgba(229,183,59,0.15)] bg-[#E5B73B]/5 rounded-sm">
                <Cat size={22} strokeWidth={1.5} />
              </div>
              {/* Split Typography with Glow */}
              <div className="font-black tracking-[0.02em] text-2xl uppercase select-none">
                <span className="text-[#E8E6E3]">NEKKO</span>
                <span className="text-[#E5B73B] drop-shadow-[0_0_10px_rgba(229,183,59,0.5)]">
                  DOJO
                </span>
              </div>
            </div>

            {/* Sidebar Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-3 bg-[#E5B73B]/5 border border-[#E5B73B]/20 text-[#E5B73B]/70 hover:bg-[#E5B73B]/10 hover:border-[#E5B73B]/50 hover:text-[#E5B73B] transition-all group duration-300 rounded-sm"
            >
              <Search
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-xs tracking-[0.15em] uppercase font-medium">
                Summon Ninja...
              </span>
            </button>
          </SidebarHeader>

          <SidebarContent className="p-4 bg-[#0C0806]! custom-scrollbar">
            <p className="text-[10px] font-bold text-[#E5B73B]/50 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#E5B73B] animate-pulse rounded-full shadow-[0_0_5px_rgba(229,183,59,0.8)]"></span>
              Active Scrolls
            </p>

            {/* 2. MOUNT THE COMPONENT HERE */}
            <ActiveScrolls />
          </SidebarContent>
        </Sidebar>

        {/* Main Application Area */}
        <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
          {/* Header */}
          <header className="h-14 border-b border-[#E5B73B]/20 bg-[#0C0806]/90 backdrop-blur-md flex items-center px-6 shrink-0">
            <SidebarTrigger className="text-[#E5B73B] hover:text-[#E5B73B]/70 transition-colors" />
            <div className="ml-4 flex items-center gap-3">
              {/* Branding with Japanese Sub-tag */}
              <div className="font-black tracking-wider text-lg uppercase select-none flex items-baseline gap-2">
                <span className="text-[#E5B73B]/40 text-xs tracking-widest font-medium">
                  通信 {/* Tsūshin: Communication */}
                </span>
              </div>

              <span className="text-[#E5B73B]/30">|</span>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[#E5B73B] text-[11px] tracking-[0.25em] font-bold">
                  秘匿回線接続{" "}
                </span>
              </div>
            </div>
          </header>

          {/* Chat Interface Renders Here */}
          <div className="flex-1 overflow-hidden flex-col flex">{children}</div>
        </main>

        {/* The Search Modal Component */}
        <NekkoSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </SidebarProvider>
  );
}
