import { useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "@clerk/react";
import axios from "axios";

export interface ChatType {
  _id: string;
  isGroup: boolean;

  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: string;

  displayName: string;
  displayIcon: string;
  allParticipantNames: string[];

  recipientClerkId?: string;
  recipientId?: string;
  lastSeen?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
}

// 2. Create the Context
interface ChatContextType {
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Custom hook to use chats anywhere in the Dojo
export const useChats = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatInitializationWrapper");
  }
  return context;
};

export default function ChatInitializationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State to hold the user's active scrolls
  const [chats, setChats] = useState<ChatType[]>([]);

  useEffect(() => {
    const initializeDojo = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setError("Unable to retrieve authentication token.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [syncRes, chatsRes] = await Promise.all([
          axios.post(
            `${import.meta.env.VITE_API_URL}/api/sync-user`,
            {},
            { headers, withCredentials: true },
          ),
          axios.get(`${import.meta.env.VITE_API_URL}/api/chats`, {
            headers,
            withCredentials: true,
          }),
        ]);

        if (syncRes.data.success) {
          if (!chatsRes.data.success) {
            console.error("Failed to fetch chats:", chatsRes.data.error);
          }

          // 1. Grab the raw chats
          const rawChats = chatsRes.data.userChats || [];

          const formattedChats = rawChats.map((chat: any) => ({
            ...chat,
            isGroup: chat.isGroup === true,
          }));

          setChats(formattedChats);
          setIsSynced(true);
        } else {
          setError(syncRes.data.error || "Sync failed unexpectedly.");
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        setError("Failed to synchronize with the Dojo.");
      }
    };

    if (isLoaded && isSignedIn) {
      initializeDojo();
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isSynced && !error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0C0806] text-[#E8E6E3]">
        <div className="mb-4 inline-block border border-[#E5B73B]/30 p-4 text-[#E5B73B] shadow-[0_0_15px_rgba(229,183,59,0.1)]">
          <svg
            className="h-8 w-8 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-medium tracking-[0.2em] text-[#E5B73B]">
          SYNCING SPIRIT
        </h2>
        <p className="mt-2 text-xs tracking-widest text-[#E8E6E3]/40">
          ESTABLISHING SECURE LINK & RETRIEVING SCROLLS...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0C0806] text-[#CC4444]">
        <p className="tracking-widest font-bold">{error}</p>
      </div>
    );
  }

  // 4. Wrap children in the Provider so they can access the chats
  return (
    <ChatContext.Provider value={{ chats, setChats }}>
      {children}
    </ChatContext.Provider>
  );
}
