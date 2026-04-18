import { useState, useEffect, useRef } from "react";
import { ImagePlus, Settings } from "lucide-react";
import { useAuth } from "@clerk/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChats } from "./ChatInitWrapper"; // 🛡️ Import this to update sidebar state
import { toast } from "sonner"; // 🛡️ Import toast for feedback

export default function GroupSettingsDialog({
  chatId,
  isOpen,
  onClose,
  currentName,
}: {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
}) {
  const { getToken } = useAuth();
  const { setChats } = useChats(); // Grab the updater function

  const [groupName, setGroupName] = useState(currentName);
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setGroupName(currentName);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsUpdating(false); // Reset loading state when opened
  }, [isOpen, chatId, currentName]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    let newName = currentName;
    let newAvatarUrl = "";
    let hasUpdates = false;

    try {
      const token = await getToken();

      // 1. Update Name
      if (groupName.trim() && groupName !== currentName) {
        const renameRes = await fetch(`/api/chats/group/name/${chatId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newGroupName: groupName.trim() }),
        });

        if (!renameRes.ok) throw new Error("Failed to rename clan scroll.");
        newName = groupName.trim();
        hasUpdates = true;
      }

      // 2. Update Avatar (ImageKit Logic)
      if (avatarFile) {
        const authRes = await fetch("/api/upload/imagekit-auth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!authRes.ok)
          throw new Error("Failed to authenticate upload server.");

        const { signature, expire, token: uploadToken } = await authRes.json();
        const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

        if (!publicKey) throw new Error("Missing Upload Key.");

        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("fileName", `clan_update_${Date.now()}`);
        formData.append("publicKey", publicKey);
        formData.append("signature", signature);
        formData.append("expire", expire.toString());
        formData.append("token", uploadToken);
        formData.append("folder", "/nekkodojo/clans");

        const uploadRes = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadRes.ok)
          throw new Error("Failed to upload image to ImageKit.");

        const uploadData = await uploadRes.json();
        newAvatarUrl = uploadData.url;

        // Send new URL to backend
        const avatarRes = await fetch(`/api/chats/group/avatar/${chatId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newGroupAvatar: newAvatarUrl }),
        });

        if (!avatarRes.ok)
          throw new Error("Failed to update avatar in database.");
        hasUpdates = true;
      }

      // 3. UI Updates
      if (hasUpdates) {
        // Instantly update the sidebar without needing a refresh!
        setChats((prev) =>
          prev.map((chat) => {
            if (chat._id === chatId) {
              return {
                ...chat,
                displayName: newName,
                displayIcon: newAvatarUrl || chat.displayIcon,
              };
            }
            return chat;
          }),
        );
        toast.success("Clan Protocol updated successfully.");
      }

      onClose(); // Force close dialog on success
    } catch (error: any) {
      console.error("Update failed", error);
      toast.error(error.message || "Failed to update Clan Protocol.");
    } finally {
      // Guaranteed to stop the "Syncing..." spinner, even on error
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-sm text-[#E8E6E3]">
        <DialogHeader>
          <DialogTitle className="text-[#E8E6E3] font-black tracking-widest uppercase text-lg border-b border-[#E5B73B]/20 pb-4 flex items-center gap-2">
            <Settings size={18} className="text-[#E5B73B]" /> Clan Protocol
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 shrink-0 rounded-sm border border-[#E5B73B]/40 flex items-center justify-center bg-[#E5B73B]/5 cursor-pointer hover:bg-[#E5B73B]/10 transition-colors overflow-hidden group"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlus
                  size={20}
                  className="text-[#E5B73B]/50 group-hover:text-[#E5B73B]"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-[#E5B73B]/50 uppercase tracking-widest mb-1 block">
                Rename Scroll
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-[#1A1A1A]/50 border border-[#E5B73B]/20 focus:border-[#E5B73B]/60 rounded-sm px-3 py-2 outline-none text-sm text-[#E8E6E3] transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-[#E5B73B]/10 border border-[#E5B73B]/50 text-[#E5B73B] hover:bg-[#E5B73B] hover:text-[#0C0806] px-6 py-2 rounded-sm uppercase tracking-widest text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Syncing..." : "Update Protocol"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
