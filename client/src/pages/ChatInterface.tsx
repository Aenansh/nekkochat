import { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Terminal } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

// Placeholder messages
const DUMMY_MESSAGES = [
  {
    id: 1,
    text: "Connection established. Secure link active.",
    sender: "system",
    time: "10:00",
  },
  {
    id: 2,
    text: "Hey! Just checking the new Dojo interface.",
    sender: "other",
    time: "10:01",
  },
  {
    id: 3,
    text: "Looking sharp. The terminal aesthetic is working.",
    sender: "me",
    time: "10:02",
  },
];

export default function ChatInterface() {
  const { chatId } = useParams();
  const { getToken } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for the target user's details
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [DUMMY_MESSAGES]);

  // Fetch Chat Details on Load
  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const token = await getToken();

        if (!token) {
          setFetchError("Authentication failed");
          setIsLoading(false);
          return;
        }

        // Adjust this endpoint to match your backend logic for fetching a specific chat
        const res = await fetch(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const chat = data.chat;
          // For 1:1 chats, use recipient; for groups, use group info
          if (chat?.isGroup) {
            setTargetUser({
              name: chat.groupName || "Group Chat",
              firstName: chat.groupName || "Group",
              lastName: "",
              profileUrl: chat.groupAvatar || "",
            });
          } else {
            setTargetUser(
              chat?.recipient || {
                name: "Unknown Ninja",
                firstName: "Unknown",
                lastName: "",
                profileUrl: "",
              },
            );
          }
        } else {
          setFetchError("Failed to load chat");
        }
      } catch (error) {
        console.error("Failed to fetch chat data", error);
        setFetchError("Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId) fetchChatDetails();
  }, [chatId, getToken]);

  return (
    // 'w-full h-full' ensures it fills the available space next to the sidebar
    <div className="absolute inset-0 flex flex-col bg-transparent text-[#E8E6E3] z-10">
      {/* 1. Chat Header */}
      <header className="h-16 shrink-0 border-b border-[#E5B73B]/20 bg-[#0C0806]/80 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {isLoading ? (
              <div className="w-10 h-10 bg-[#E5B73B]/10 border border-[#E5B73B]/40 rounded-sm animate-pulse"></div>
            ) : (
              <img
                src={
                  targetUser?.profileUrl ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=ninja"
                }
                alt="Target Avatar"
                className="w-10 h-10 border border-[#E5B73B]/40 rounded-sm object-cover"
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-[#E5B73B]"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold tracking-widest uppercase text-[#E8E6E3]">
              {isLoading ? "SYNCING..." : targetUser?.name || "TARGET NINJA"}
            </h2>
            <span className="text-[10px] tracking-[0.2em] text-[#E5B73B] uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#E5B73B] rounded-full animate-pulse shadow-[0_0_5px_rgba(229,183,59,0.8)]"></span>
              {isLoading ? "LINKING" : "ONLINE"}
            </span>
          </div>
        </div>

        <button className="text-[#E5B73B]/50 hover:text-[#E5B73B] transition-colors p-2">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* 2. Message Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#0C0806]/50">
        {/* System Greeting */}
        <div className="flex justify-center my-6">
          <span className="text-[10px] text-[#E5B73B]/40 uppercase tracking-[0.3em] bg-[#E5B73B]/5 px-4 py-1 border border-[#E5B73B]/10 rounded-sm flex items-center gap-2">
            <Terminal size={12} /> Encrypted Channel {chatId?.slice(-6)}
          </span>
        </div>

        {DUMMY_MESSAGES.map((msg) => {
          const isMe = msg.sender === "me";
          const isSystem = msg.sender === "system";

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center text-[#E5B73B]/60 text-xs italic tracking-widest my-2"
              >
                &lt; {msg.text} &gt;
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-sm p-3 relative group ${
                  isMe
                    ? "bg-[#E5B73B]/10 border border-[#E5B73B]/30 text-[#E8E6E3]"
                    : "bg-[#1A1A1A]/80 border border-[#E5B73B]/10 text-gray-300"
                }`}
              >
                {/* Avatar context for received messages */}
                {!isMe && (
                  <span className="text-[9px] uppercase tracking-widest text-[#E5B73B]/50 block mb-1 border-b border-[#E5B73B]/10 pb-1 w-max">
                    {targetUser?.firstName || "NINJA"}
                  </span>
                )}

                {isMe && (
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#E5B73B]/50"></div>
                )}

                <p className="text-sm tracking-wide leading-relaxed">
                  {msg.text}
                </p>
                <span
                  className={`text-[9px] uppercase tracking-widest block mt-2 ${isMe ? "text-[#E5B73B]/50 text-right" : "text-gray-500"}`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. Input Console */}
      <footer className="shrink-0 p-4 bg-[#0C0806] border-t border-[#E5B73B]/20 relative z-20">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[#E5B73B] font-black">{`>`}</span>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setMessage("")}
            placeholder="Transmit message..."
            className="w-full bg-[#1A1A1A]/50 border border-[#E5B73B]/20 focus:border-[#E5B73B]/60 rounded-sm py-3 pl-10 pr-14 outline-none text-sm text-[#E8E6E3] placeholder:text-[#E5B73B]/30 tracking-widest transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E5B73B]/10 hover:bg-[#E5B73B] text-[#E5B73B] hover:text-[#0C0806] border border-[#E5B73B]/30 p-2 rounded-sm transition-all duration-300 group">
            <Send
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </footer>
    </div>
  );
}
