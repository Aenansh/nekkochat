import { useState } from "react";
import { Link2 } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

interface UserSearchResultProps {
  user: {
    _id: string;
    name: string;
    profileUrl: string;
  };
  onCloseSearch: () => void;
}

export default function UserSearchResult({
  user,
  onCloseSearch,
}: UserSearchResultProps) {
  const [isLinking, setIsLinking] = useState(false);
  const { getToken } = useAuth();
  const router = useNavigate();
  const handleCreateChat = async () => {
    setIsLinking(true);
    try {
      const token = await getToken();

      // Update this route to match your backend chat creation endpoint
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: user._id }),
      });

      if (res.ok) {
        const chatData = await res.json();
        console.log("Secure Link Established:", chatData.newChat);

        router(`/chat/${chatData.newChat._id}`);

        onCloseSearch(); // Close the terminal after successful link
      }
    } catch (error) {
      console.error("Failed to establish secure link", error);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-[#E5B73B]/5 rounded-sm transition-all border border-transparent hover:border-[#E5B73B]/30 group">
      <div className="flex items-center gap-4">
        {/* Avatar with gold border */}
        <div className="relative">
          <img
            src={user.profileUrl}
            className="w-10 h-10 rounded-sm border border-[#E5B73B]/40 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            alt=""
          />
          {/* Decorative corner accent expands on hover */}
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-[#E5B73B] transition-all duration-300 group-hover:w-3 group-hover:h-3"></div>
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-[#E8E6E3] tracking-wider text-sm flex items-center gap-2">
            {/* Terminal cursor appears on hover */}
            <span className="text-[#E5B73B]/0 group-hover:text-[#E5B73B] transition-colors duration-300 font-black">
              {`>`}
            </span>
            <span className="-ml-2 group-hover:ml-0 transition-all duration-300">
              {user.name}
            </span>
          </span>
          {/* Faux System ID for aesthetic depth */}
          <span className="text-[9px] text-[#E5B73B]/40 tracking-[0.25em] uppercase mt-0.5 ml-2 group-hover:ml-4 transition-all duration-300">
            SIG_ID: {user._id.slice(-6)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleCreateChat}
        disabled={isLinking}
        className="flex items-center gap-2 text-[10px] bg-transparent text-[#E5B73B] border border-[#E5B73B]/30 group-hover:bg-[#E5B73B] group-hover:text-[#0C0806] px-4 py-2 rounded-sm font-bold tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLinking ? "Syncing..." : "Link"}
        {!isLinking && (
          <Link2 size={12} className="opacity-50 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}
