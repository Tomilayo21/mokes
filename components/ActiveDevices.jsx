"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function ActiveDevices() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState([]);

  // Update sessions when session changes
    useEffect(() => {
      const fetchSessions = async () => {
        const res = await fetch("/api/user/sessions");
        const data = await res.json();

        if (res.ok) {
          setSessions(data.sessions || []);
        }
      };

      fetchSessions();
    }, []);

    const handleLogout = async (token) => {
    const confirmLogout = await new Promise((resolve) => {
        toast((t) => (
        <div className="flex flex-col space-y-2 p-2">
            <p>Are you sure you want to remove this device?</p>
            <div className="flex justify-end space-x-2">
            <button
                className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => { toast.dismiss(t.id); resolve(false); }}
            >
                Cancel
            </button>
            <button
                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => { toast.dismiss(t.id); resolve(true); }}
            >
                Remove
            </button>
            </div>
        </div>
        ), { duration: Infinity });
    });

    if (!confirmLogout) return;

    try {
        const res = await fetch("/api/user/logout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
        toast.error(data?.message || "Failed to remove device");
        return;
        }

        toast.success("Device removed successfully!");

        // 🔥 If user removed their own active device → force real logout
        if (token === session?.user?.currentToken) {
        return signOut({ callbackUrl: "/" });
        }

        // Remove from UI
        setSessions((prev) => prev.filter((s) => s.token !== token));
    } catch (err) {
        toast.error("Failed to remove device");
    }
    };


  if (status === "loading") return <p>Loading devices...</p>;
  if (!session?.user) return <p>No user session found.</p>;

  const displaySessions = [...new Map(
    sessions.map(s => [`${s.os}-${s.browser}-${s.ip}`, s])
  ).values()].sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

  return (
    <div className="bg-gray-50 dark:bg-gray-50 border dark:border-white p-3 rounded-sm text-xs space-y-3">
      <Toaster position="top-right" />
      <p className="text-gray-700 dark:text-gray-700 font-medium mb-1">Active Devices</p>

      {displaySessions.length > 0 ? (
        displaySessions.map((s, idx) => (
          <div
            key={idx}
            className="flex justify-between items-start border-b dark:border-gray-700 pb-2 last:border-b-0"
          >
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400">
                {s.os || "Unknown OS"} • {s.browser || "Unknown Browser"}
              </p>

              <p className="text-gray-500 dark:text-gray-400">
                {s.city && s.country ? `${s.city}, ${s.country}` : "Location unknown"}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Last Active: {new Date(s.lastActive).toLocaleString()}
              </p>
            </div>
            <button
              className="text-red-500 text-xs hover:underline mt-1"
              onClick={() => handleLogout(s.token)}
            >
              Log out
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No active devices found.</p>
      )}
    </div>
  );
}
