import { useState, useEffect } from "react";
import { Search, X, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/react";
import UserSearchResult from "./UserSearchResult";

interface NekkoSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NekkoSearch({ isOpen, onClose }: NekkoSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setPage(1);
    }
  }, [isOpen]);
  const { getToken } = useAuth();
  const fetchUsers = async (isNewSearch = false) => {
    if (!query.trim()) return;
    setLoading(true);
    const targetPage = isNewSearch ? 1 : page;
    const token = await getToken();
    try {
      const res = await fetch(
        `/api/users?name=${encodeURIComponent(query)}&page=${targetPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error(`Search request failed with status ${res.status}`);
      }
      const data = await res.json();

      setResults((prev) =>
        isNewSearch ? data.users : [...prev, ...data.users],
      );
      setHasMore(data.hasMore);
      setPage(targetPage + 1);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* True Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0C0806]/80 backdrop-blur-md"
          />

          {/* Dojo Search Terminal */}
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-[#0C0806] rounded-sm shadow-[0_0_40px_rgba(229,183,59,0.1)] border border-[#E5B73B]/30 overflow-hidden"
          >
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#E5B73B]/50 to-transparent"></div>

            <div className="p-6">
              {/* Terminal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5B73B]/10">
                <h3 className="font-medium text-[#E5B73B] flex items-center gap-3 uppercase tracking-[0.2em] text-xs">
                  <Terminal size={14} className="animate-pulse" />
                  Network Query
                </h3>
                <button
                  onClick={onClose}
                  className="text-[#E5B73B]/40 hover:text-[#E5B73B] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Input Field */}
              <div className="relative mb-6">
                <input
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 bg-[#E5B73B]/5 border border-[#E5B73B]/20 focus:border-[#E5B73B]/60 rounded-sm outline-none transition-all text-[#E8E6E3] placeholder:text-[#E5B73B]/30 tracking-widest text-sm"
                  placeholder="ENTER NINJA DESIGNATION..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers(true)}
                />
                <Search
                  className="absolute left-4 top-[1.1rem] text-[#E5B73B]/50"
                  size={18}
                />
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {results.map((user) => (
                  <UserSearchResult
                    key={user._id}
                    user={user}
                    onCloseSearch={onClose}
                  />
                ))}

                {/* Empty State / Loading */}
                {results.length === 0 && !loading && query && (
                  <div className="text-center py-8 text-[#E5B73B]/40 uppercase tracking-widest text-xs">
                    No matching signatures found.
                  </div>
                )}

                {/* Load More Trigger */}
                {hasMore && (
                  <button
                    onClick={() => fetchUsers(false)}
                    className="w-full mt-4 py-3 text-xs text-[#E5B73B] uppercase tracking-[0.2em] font-medium border border-[#E5B73B]/10 hover:border-[#E5B73B]/30 hover:bg-[#E5B73B]/5 transition-all rounded-sm"
                  >
                    {loading ? "Scanning..." : "Expand Search Area"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
