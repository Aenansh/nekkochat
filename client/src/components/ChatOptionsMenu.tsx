import { useEffect, useState } from "react";
import {
  MoreVertical,
  User,
  Trash2,
  XSquare,
  Users,
  UserPlus,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Import the sub-components we just built
import GroupMembersDialog from "./GroupMembersDialog";
import AddMemberDialog from "./AddMemberDialog";
import GroupSettingsDialog from "./GroupSettingDialoge";
import { toast } from "sonner";

interface ChatOptionsMenuProps {
  chatId: string;
}

export default function ChatOptionsMenu({ chatId }: ChatOptionsMenuProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { setChats, chats } = useChats();

  // Loading States
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog Controllers
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const activeChat = chats.find((c) => c._id === chatId);
  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      navigate("/chat");
    }
  }, [activeChat, chats.length, navigate]);

  if (!activeChat) return null;

  // --- API Actions ---
  const executeDeleteChat = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        navigate("/chat");
      } else {
        const err = await res.json();
        alert(err.error || "Only the Dojo Master can burn this scroll.");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const executeLeaveGroup = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      // Hits the leave group route you made earlier
      const res = await fetch(`/api/chats/group/${chatId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        navigate("/chat");
        return;
      }
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Failed to leave the clan.");
    } catch (error) {
      console.error("Error leaving chat:", error);
    } finally {
      setIsProcessing(false);
      setShowLeaveDialog(false);
    }
  };
  console.log(activeChat.isGroup);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-[#E5B73B]/50 hover:text-[#E5B73B] transition-colors p-2 outline-none group">
            <MoreVertical
              size={20}
              className="group-data-[state=open]:text-[#E5B73B]"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 bg-[#0C0806] border-[#E5B73B]/30 shadow-[0_0_20px_rgba(229,183,59,0.1)] rounded-sm p-1"
        >
          {/* ----- 1-on-1 ONLY OPTIONS ----- */}
          {!activeChat.isGroup && (
            <DropdownMenuItem className="flex items-center gap-2 text-[#E8E6E3]/70 focus:bg-[#E5B73B]/10 focus:text-[#E5B73B] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2">
              <a
                className="flex items-center gap-2 w-full"
                href={`https://nekkodojo.vercel.app/member/${activeChat.recipientId}`}
              >
                <User size={14} /> Target Profile
              </a>
            </DropdownMenuItem>
          )}

          {/* ----- GROUP ONLY OPTIONS ----- */}
          {activeChat.isGroup && (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowMembers(true);
                }}
                className="flex items-center gap-2 text-[#E8E6E3]/70 focus:bg-[#E5B73B]/10 focus:text-[#E5B73B] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2"
              >
                <Users size={14} /> View Disciples
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowAddMember(true);
                }}
                className="flex items-center gap-2 text-[#E8E6E3]/70 focus:bg-[#E5B73B]/10 focus:text-[#E5B73B] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2"
              >
                <UserPlus size={14} /> Summon Ninja
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowSettings(true);
                }}
                className="flex items-center gap-2 text-[#E8E6E3]/70 focus:bg-[#E5B73B]/10 focus:text-[#E5B73B] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2"
              >
                <Settings size={14} /> Clan Protocol
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E5B73B]/10 my-1" />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowLeaveDialog(true);
                }}
                className="flex items-center gap-2 text-[#E5B73B]/70 focus:bg-[#E5B73B]/10 focus:text-[#E5B73B] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2"
              >
                <LogOut size={14} /> Leave Clan
              </DropdownMenuItem>
            </>
          )}

          {/* ----- GLOBAL OPTIONS ----- */}
          <DropdownMenuSeparator className="bg-[#E5B73B]/10 my-1" />
          <DropdownMenuItem
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2 text-[#E8E6E3]/70 focus:bg-[#E5B73B]/10 focus:text-[#E5B73B] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2"
          >
            <XSquare size={14} /> Close Channel
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
            className="flex items-center gap-2 text-[#CC4444]/70 focus:bg-[#CC4444]/10 focus:text-[#CC4444] cursor-pointer tracking-widest text-[10px] uppercase rounded-sm transition-colors py-2"
          >
            <Trash2 size={14} /> Burn Scroll
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ----- MODALS & DIALOGS OVERLAYS ----- */}
      <GroupMembersDialog
        chatId={chatId}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
      />
      <AddMemberDialog
        chatId={chatId}
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
      <GroupSettingsDialog
        chatId={chatId}
        currentName={activeChat.displayName || ""}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Burn Scroll Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E8E6E3] font-bold tracking-widest uppercase text-lg flex items-center gap-2">
              <Trash2 className="text-[#CC4444]" size={20} /> Burn Scroll?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#E8E6E3]/60 tracking-wide text-sm">
              {activeChat.isGroup
                ? "This will permanently delete the group for ALL members. Only the Dojo Master can do this."
                : "This action cannot be undone. This will permanently sever the link."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-1">
            <AlertDialogCancel className="bg-transparent border border-[#E5B73B]/30 text-[#E5B73B] hover:bg-[#E5B73B]/10 hover:text-[#E5B73B] rounded-sm uppercase tracking-widest text-xs transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeDeleteChat();
              }}
              disabled={isProcessing}
              className="bg-[#CC4444]/10 border border-[#CC4444]/50 text-[#CC4444] hover:bg-[#CC4444] hover:text-[#0C0806] rounded-sm uppercase tracking-widest text-xs transition-colors"
            >
              {isProcessing ? "Purging..." : "Confirm Burn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Group Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E8E6E3] font-bold tracking-widest uppercase text-lg flex items-center gap-2">
              <LogOut className="text-[#E5B73B]" size={20} /> Leave Clan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#E8E6E3]/60 tracking-wide text-sm">
              You will be removed from this group. If you are the Dojo Master,
              leadership will be passed to another ninja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-1">
            <AlertDialogCancel className="bg-transparent border border-[#E5B73B]/30 text-[#E5B73B] hover:bg-[#E5B73B]/10 hover:text-[#E5B73B] rounded-sm uppercase tracking-widest text-xs transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeLeaveGroup();
              }}
              disabled={isProcessing}
              className="bg-[#E5B73B]/10 border border-[#E5B73B]/50 text-[#E5B73B] hover:bg-[#E5B73B] hover:text-[#0C0806] rounded-sm uppercase tracking-widest text-xs transition-colors"
            >
              {isProcessing ? "Leaving..." : "Confirm Departure"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
