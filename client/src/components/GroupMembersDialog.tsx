import { useState, useEffect } from "react";
import { ShieldAlert, UserMinus, MessageSquare } from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useChats } from "./ChatInitWrapper";
import { toast } from "sonner";

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
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const { setChats } = useChats();

  const [members, setMembers] = useState<any[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);

  // 🛡️ NEW: Banishment Dialog States
  const [memberToBanish, setMemberToBanish] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

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
          toast.error(err?.error || "Failed to load group members.");
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

  const confirmRemoveMember = async () => {
    if (!memberToBanish) return;

    setIsRemoving(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/chats/group/participants/${chatId}?participantId=${memberToBanish}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== memberToBanish));
        toast.success("Disciple banished successfully.");
      } else {
        const err = await res.json();
        toast.error(err.error || "Only the Dojo Master can remove members.");
      }
    } catch (error) {
      console.error("Failed to remove member");
      toast.error("An error occurred while banishing the disciple.");
    } finally {
      setIsRemoving(false);
      setMemberToBanish(null); // Close the dialog
    }
  };

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
        const newChat = chatData.newChat || chatData.chat;

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

        navigate(`/chat/${newChat._id}`);
        onClose();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to create secure link.");
      }
    } catch (error) {
      console.error("Failed to establish secure link:", error);
    } finally {
      setIsLinking(null);
    }
  };

  const isCurrentUserAdmin = members.some(
    (m) => m.clerkId === clerkUser?.id && m._id === adminId,
  );

  return (
    <>
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
                const isMe = member.clerkId === clerkUser?.id;

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

                    <div className="flex items-center gap-1">
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

                      {/* 🛡️ Triggers the AlertDialog instead of window.confirm */}
                      {isCurrentUserAdmin && !isAdmin && (
                        <button
                          onClick={() => setMemberToBanish(member._id)}
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

      {/* 🛡️ The Banishment Alert Dialog */}
      <AlertDialog
        open={!!memberToBanish}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setMemberToBanish(null);
        }}
      >
        <AlertDialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E8E6E3] font-bold tracking-widest uppercase text-lg flex items-center gap-2">
              <UserMinus className="text-[#CC4444]" size={20} /> Banish
              Disciple?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#E8E6E3]/60 tracking-wide text-sm">
              Are you sure you want to banish this ninja from the Dojo? They
              will instantly lose all access to this Clan Scroll.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-1">
            <AlertDialogCancel
              disabled={isRemoving}
              className="bg-transparent border border-[#E5B73B]/30 text-[#E5B73B] hover:bg-[#E5B73B]/10 hover:text-[#E5B73B] rounded-sm uppercase tracking-widest text-xs transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Keep modal open while async task runs
                confirmRemoveMember();
              }}
              disabled={isRemoving}
              className="bg-[#CC4444]/10 border border-[#CC4444]/50 text-[#CC4444] hover:bg-[#CC4444] hover:text-[#0C0806] rounded-sm uppercase tracking-widest text-xs transition-colors"
            >
              {isRemoving ? "Banishing..." : "Confirm Banish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
