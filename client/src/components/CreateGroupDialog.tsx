import { useState, useRef, useMemo, useEffect } from "react";
import { Users, ImagePlus, X, Search, Check } from "lucide-react";
import { useAuth } from "@clerk/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChats } from "./ChatInitWrapper";

export default function CreateGroupDialog() {
  const { getToken } = useAuth();
  const { chats, setChats } = useChats();

  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 🛡️ NEW: The Request Guard to prevent stale search results
  const searchRequestIdRef = useRef(0);

  // Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 1. Derive the 5 most recent 1-on-1 chats for quick selection (BULLETPROOF)
  const recentNinjas = useMemo(() => {
    // A. Strictly filter out anything that is a group or missing a recipient ID
    const oneOnOneChats = chats.filter(
      (chat) => chat.isGroup === false && chat.recipientId,
    );

    // B. Use a Map to guarantee we don't accidentally list the same ninja twice
    const uniqueNinjasMap = new Map();

    oneOnOneChats.forEach((chat) => {
      if (!uniqueNinjasMap.has(chat.recipientId)) {
        uniqueNinjasMap.set(chat.recipientId, {
          _id: chat.recipientId,
          name: chat.displayName,
          profileUrl: chat.displayIcon,
        });
      }
    });

    // C. Return only the first 5 unique users
    return Array.from(uniqueNinjasMap.values()).slice(0, 5);
  }, [chats]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // 2. Handle File Selection (Preview locally before ImageKit upload)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 3. Toggle User Selection
  const toggleUser = (user: any) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u._id === user._id);
      if (isSelected) return prev.filter((u) => u._id !== user._id);
      return [...prev, user];
    });
  };

  // 4. Secure Search Function
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Grab a new ticket number for this specific request
    const currentRequestId = ++searchRequestIdRef.current;

    try {
      const token = await getToken();
      const res = await fetch(`/api/users?name=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        // 🛡️ GUARD CHECK: Only update state if this is still the most recent request
        if (currentRequestId === searchRequestIdRef.current) {
          setSearchResults(data.users || []);
        }
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  // 5. The Master Creation Function
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;
    setIsCreating(true);

    try {
      const token = await getToken();
      let uploadedAvatarUrl = "";

      // Step A: Upload to ImageKit (if file selected)
      if (avatarFile) {
        try {
          // 1. Ask the Dojo backend for an upload signature
          const authRes = await fetch("/api/upload/imagekit-auth", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!authRes.ok) throw new Error("Failed to get upload signature");
          const {
            signature,
            expire,
            token: uploadToken,
          } = await authRes.json();

          // 2. Package the file and the signature for ImageKit
          const formData = new FormData();
          formData.append("file", avatarFile);
          formData.append("fileName", `clan_${Date.now()}_${avatarFile.name}`);
          formData.append(
            "publicKey",
            import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
          );
          formData.append("signature", signature);
          formData.append("expire", expire.toString());
          formData.append("token", uploadToken);
          formData.append("folder", "/nekkodojo/clans"); // Keeps your ImageKit dashboard clean

          // 3. Fire it directly at ImageKit's servers
          const uploadRes = await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            {
              method: "POST",
              body: formData,
            },
          );

          if (!uploadRes.ok) throw new Error("ImageKit upload failed");

          const uploadData = await uploadRes.json();
          uploadedAvatarUrl = uploadData.url; // WE GOT THE SECURE URL!
        } catch (uploadErr) {
          console.error("Avatar upload failed:", uploadErr);
          setIsCreating(false);
          return; // Stop group creation if the avatar fails to upload
        }
      }

      // Step B: Create the Group in the DB
      const res = await fetch("/api/chats/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupName,
          participantIds: selectedUsers.map((u) => u._id),
          groupAvatar: uploadedAvatarUrl, // Live and ready!
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newGroup = data.newGroup;

        const formattedGroup = {
          ...newGroup,
          isGroup: true,
          displayName: newGroup.groupName,
          displayIcon: newGroup.groupAvatar,
        };
        setChats((prev) => [formattedGroup, ...prev]);

        // Reset and Close
        setGroupName("");
        setSelectedUsers([]);
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsOpen(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to forge group scroll.");
      }
    } catch (error) {
      console.error("Failed to forge group scroll", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* The Trigger Button that will live in the Sidebar */}
        <button className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-2 bg-transparent border border-[#E5B73B]/20 text-[#E5B73B]/70 hover:bg-[#E5B73B]/10 hover:border-[#E5B73B]/50 hover:text-[#E5B73B] transition-all group duration-300 rounded-sm">
          <Users
            size={14}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-[10px] tracking-[0.15em] uppercase font-bold">
            Forge Clan
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#0C0806] border border-[#E5B73B]/30 shadow-[0_0_30px_rgba(229,183,59,0.15)] rounded-sm max-w-md p-6 text-[#E8E6E3]">
        <DialogHeader>
          <DialogTitle className="text-[#E8E6E3] font-black tracking-widest uppercase text-lg border-b border-[#E5B73B]/20 pb-4 mb-4">
            Forge Clan Scroll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Meta: Avatar & Name */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 shrink-0 rounded-sm border border-[#E5B73B]/40 flex items-center justify-center bg-[#E5B73B]/5 cursor-pointer hover:bg-[#E5B73B]/10 transition-colors group overflow-hidden"
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
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Clan Name..."
                className="w-full bg-[#1A1A1A]/50 border border-[#E5B73B]/20 focus:border-[#E5B73B]/60 rounded-sm px-3 py-2 outline-none text-sm text-[#E8E6E3] placeholder:text-[#E5B73B]/30 tracking-widest transition-all"
              />
            </div>
          </div>

          {/* Search & Select Ninjas */}
          <div>
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5B73B]/50"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search database for ninjas..."
                className="w-full bg-transparent border-b border-[#E5B73B]/20 focus:border-[#E5B73B]/60 py-2 pl-9 pr-3 outline-none text-xs tracking-widest transition-all"
              />
            </div>

            {/* Selected Users Pills */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-1 bg-[#E5B73B]/10 border border-[#E5B73B]/30 px-2 py-1 rounded-sm text-[10px] tracking-wider uppercase"
                  >
                    <span>{user.name}</span>
                    <X
                      size={10}
                      className="cursor-pointer hover:text-[#CC4444]"
                      onClick={() => toggleUser(user)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Ninja List (Shows Search Results OR Recent Contacts) */}
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 border border-[#E5B73B]/10 rounded-sm p-1">
              <p className="text-[9px] uppercase tracking-widest text-[#E5B73B]/40 px-2 py-1">
                {searchQuery ? "Search Results" : "Recent Contacts"}
              </p>

              {(searchQuery ? searchResults : recentNinjas).map((user) => {
                const isSelected = selectedUsers.some(
                  (u) => u._id === user._id,
                );
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className={`flex items-center justify-between p-2 rounded-sm cursor-pointer transition-colors border ${
                      isSelected
                        ? "bg-[#E5B73B]/20 border-[#E5B73B]/50"
                        : "bg-transparent border-transparent hover:bg-[#E5B73B]/5 hover:border-[#E5B73B]/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profileUrl}
                        className="w-6 h-6 rounded-sm border border-[#E5B73B]/30 object-cover"
                        alt=""
                      />
                      <span className="text-xs tracking-widest">
                        {user.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[#E5B73B]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleCreateGroup}
              disabled={
                isCreating || !groupName.trim() || selectedUsers.length < 2
              }
              className="bg-[#E5B73B]/10 border border-[#E5B73B]/50 text-[#E5B73B] hover:bg-[#E5B73B] hover:text-[#0C0806] px-6 py-2 rounded-sm uppercase tracking-widest text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Forging..." : "Forge Scroll"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
