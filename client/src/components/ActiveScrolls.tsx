import { Link, useLocation } from "react-router-dom";
import { useChats } from "./ChatInitWrapper";
import { Users } from "lucide-react";

export default function ActiveScrolls() {
  const { chats } = useChats();
  const location = useLocation();
  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-[#E5B73B]/30 text-xs tracking-widest italic border border-[#E5B73B]/10 rounded-sm bg-[#E5B73B]/5 mt-2">
        No scrolls established.
      </div>
    );
  }

  return (
    <div className="space-y-1 mt-2">
      {chats.map((chat) => {
        const isActive = location.pathname === `/chat/${chat._id}`;
        const targetName = chat.displayName || "Unknown Node";
        const targetAvatar = chat.displayIcon;

        // ✅ Subtitle: group shows participant names, 1-on-1 shows last message
        const subtitle = chat.isGroup
          ? chat.allParticipantNames?.length
            ? chat.allParticipantNames.join(", ")
            : "Group chat"
          : chat.lastMessageText || "Secure Link Established."; // ✅ now actually populated

        return (
          <Link
            key={chat._id}
            to={`/chat/${chat._id}`}
            className={`flex items-center gap-3 p-3 rounded-sm transition-all border group ${
              isActive
                ? "bg-[#E5B73B]/10 border-[#E5B73B]/50 shadow-[inset_2px_0_0_0_#E5B73B]"
                : "bg-transparent border-transparent hover:bg-[#E5B73B]/5 hover:border-[#E5B73B]/20"
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={targetAvatar}
                className={`w-10 h-10 rounded-sm border object-cover transition-colors ${
                  isActive
                    ? "border-[#E5B73B]"
                    : "border-[#E5B73B]/30 group-hover:border-[#E5B73B]/60"
                }`}
                alt="avatar"
              />
              {chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-[#0C0806] border border-[#E5B73B] text-[#E5B73B] p-0.5 rounded-sm">
                  <Users size={10} />
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={`text-sm tracking-wider truncate transition-colors ${
                  isActive
                    ? "text-[#E5B73B] font-bold"
                    : "text-[#E8E6E3] font-medium group-hover:text-[#E5B73B]/80"
                }`}
              >
                {targetName}
              </span>

              <span className="text-[10px] text-[#E8E6E3]/50 truncate tracking-wide mt-0.5">
                {subtitle}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
