import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import axios from "axios";

export default function ChatInitializationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        // 1. Get the JWT token from Clerk
        const token = await getToken();

        // 2. Ping your Express sync endpoint
        const response = await axios.post(
          "http://localhost:8000/api/sync-user",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setIsSynced(true);
        }
      } catch (err) {
        console.error("Sync failed:", err);
        setError("Failed to synchronize with the Dojo.");
      }
    };

    if (isLoaded && isSignedIn) {
      syncWithBackend();
    }
  }, [isLoaded, isSignedIn, getToken]);

  // Loading State: Show the pulsing gold icon matching your screenshot
  if (!isSynced && !error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0C0806] text-[#E8E6E3]">
        <div className="mb-4 inline-block border border-[#E5B73B]/30 p-4 text-[#E5B73B]">
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
          ESTABLISHING SECURE LINK...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0C0806] text-[#CC4444]">
        <p className="tracking-widest font-bold uppercase">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
}
