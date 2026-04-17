import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { useAuth } from "@clerk/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AddMemberDialog({
  chatId,
  isOpen,
  onClose,
}: {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchAbortController, setSearchAbortController] =
    useState<AbortController | null>(null);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAbortController?.abort();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    setSearchAbortController(controller);
    try {
      const token = await getToken();
      const res = await fetch(`/api/users?name=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Search failed");
    }
  };

  const handleAddMember = async (userId: string) => {
    setIsAdding(true);
    try {
      const token = await getToken();
      // Hits the PUT route we created earlier
      const res = await fetch(`/api/chats/group/participants/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantIds: [userId] }),
      });
      if (res.ok) {
        onClose(); // Success! Close the dialog
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add member.");
      }
    } catch (error) {
      console.error("Add member failed:", error);
      toast.error("Failed to add member.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-sm text-[#E8E6E3]">
        <DialogHeader>
          <DialogTitle className="text-[#E8E6E3] font-black tracking-widest uppercase text-lg border-b border-[#E5B73B]/20 pb-4">
            Summon Ninja
          </DialogTitle>
        </DialogHeader>
        <div className="relative mb-4 mt-2">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5B73B]/50"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search terminal..."
            className="w-full bg-[#1A1A1A]/50 border border-[#E5B73B]/20 focus:border-[#E5B73B]/60 py-2 pl-9 pr-3 rounded-sm outline-none text-xs tracking-widest transition-all text-[#E8E6E3]"
          />
        </div>
        <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-2 bg-transparent border border-[#E5B73B]/10 hover:bg-[#E5B73B]/10 transition-colors rounded-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profileUrl}
                  className="w-6 h-6 rounded-sm object-cover border border-[#E5B73B]/30"
                  alt=""
                />
                <span className="text-xs tracking-widest uppercase">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => handleAddMember(user._id)}
                disabled={isAdding}
                aria-label={`Add ${user.name} to group`}
                title={`Add ${user.name}`}
                className="text-[#E5B73B] hover:text-[#0C0806] hover:bg-[#E5B73B] border border-[#E5B73B]/30 p-1 rounded-sm transition-all"
              >
                <UserPlus size={14} />
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
