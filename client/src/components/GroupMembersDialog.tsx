import { useState, useEffect } from "react";
import { ShieldAlert, UserMinus, MessageSquare } from "lucide-react";
import { useAuth, useUser } from "@clerk/react"; // Added useUser
import { useNavigate } from "react-router-dom"; // Added useNavigate
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChats } from "./ChatInitWrapper"; // Added useChats

export default function GroupMembersDialog({
  chatId,
  isOpen,
  onClose,
}: {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser(); // Get current active user
  const navigate = useNavigate();
  const { setChats } = useChats();

  const [members, setMembers] = useState<any[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null); // Track which user is being linked

  useEffect(() => {
    if (!isOpen) return;
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMembers(data.chat.participants || []);
          setAdminId(data.chat.groupAdmin || null);
        } else {
          const err = await res.json().catch(() => null);
          alert(err?.error || "Failed to load group members.");
          setMembers([]);
        }
      } catch (error) {
        console.error("Failed to fetch members");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, [isOpen, chatId, getToken]);

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Banish this ninja from the Dojo?")) return;
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/chats/group/participants/${chatId}?participantId=${memberId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== memberId));
      } else {
        const err = await res.json();
        alert(err.error || "Only the Dojo Master can remove members.");
      }
    } catch (error) {
      console.error("Failed to remove member");
    }
  };

  // NEW: Forge or Fetch a 1-on-1 link with the selected disciple
  const handleDirectMessage = async (targetUser: any) => {
    setIsLinking(targetUser._id);
    try {
      const token = await getToken();

      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: targetUser._id }),
      });

      if (res.ok) {
        const chatData = await res.json();
        const newChat = chatData.newChat || chatData.chat; // Handles both fresh creates and existing fetches

        // Inject into Sidebar State to avoid needing a hard refresh
        setChats((prevChats) => {
          if (prevChats.some((c) => c._id === newChat._id)) {
            return prevChats;
          }

          const formattedNewChat = {
            _id: newChat._id,
            isGroup: false,
            displayName: targetUser.name,
            displayIcon: targetUser.profileUrl,
            recipientId: targetUser._id,
            updatedAt: newChat.updatedAt || new Date().toISOString(),
            lastMessageText: "Secure Link Established.",
            allParticipantNames: [targetUser.name],
          };

          return [formattedNewChat, ...prevChats];
        });

        // Teleport the user to the 1-on-1 chat and close the dialog
        navigate(`/chat/${newChat._id}`);
        onClose();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || "Failed to create secure link."); 
      }
    } catch (error) {
      console.error("Failed to establish secure link:", error);
    } finally {
      setIsLinking(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-sm text-[#E8E6E3]">
        <DialogHeader>
          <DialogTitle className="text-[#E5B73B] font-black tracking-widest uppercase text-lg border-b border-[#E5B73B]/20 pb-4">
            Clan Disciples
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 mt-2">
          {isLoading ? (
            <div className="text-center text-xs tracking-widest text-[#E5B73B]/50 animate-pulse">
              Scanning signatures...
            </div>
          ) : (
            members.map((member) => {
              const isAdmin = member._id === adminId;
              const isMe = member.clerkId === clerkUser?.id; // Identify if this row is the current user

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 bg-[#E5B73B]/5 border border-[#E5B73B]/10 rounded-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.profileUrl}
                      alt="avatar"
                      className="w-8 h-8 rounded-sm object-cover border border-[#E5B73B]/30"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs tracking-widest uppercase flex items-center gap-2">
                        {member.name}
                        {isMe && (
                          <span className="text-[9px] text-[#E8E6E3]/40">
                            (YOU)
                          </span>
                        )}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] text-[#E5B73B] tracking-[0.2em] flex items-center gap-1 mt-0.5">
                          <ShieldAlert size={10} /> DOJO MASTER
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Container */}
                  <div className="flex items-center gap-1">
                    {/* Direct Message Button (Hide for self) */}
                    {!isMe && (
                      <button
                        onClick={() => handleDirectMessage(member)}
                        disabled={isLinking === member._id}
                        className="text-[#E5B73B]/50 hover:text-[#E5B73B] disabled:opacity-50 transition-colors p-1"
                        title="Secure Link (DM)"
                      >
                        <MessageSquare
                          size={14}
                          className={
                            isLinking === member._id ? "animate-pulse" : ""
                          }
                        />
                      </button>
                    )}

                    {/* Banish Button (Hide for Dojo Master row) */}
                    {!isAdmin && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-[#CC4444]/50 hover:text-[#CC4444] transition-colors p-1 ml-1 border-l border-[#E5B73B]/10 pl-2"
                        title="Banish"
                      >
                        <UserMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
