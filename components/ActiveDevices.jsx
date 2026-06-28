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

        toast.custom(
          (t) => (
            <div
              className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <p className="flex-1 text-sm font-normal text-black tracking-wide dark:text-black">
                Device successfully removed
              </p>
  
              {/* Close */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 cursor-pointer hover:text-black transition"
              >
                ✕
              </button>
  
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
                <div
                  className="h-full bg-[var(--sage)]"
                  style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );

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

  const displaySessions = sessions.sort(
    (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
  );

  const deviceLabel = displaySessions.length === 1 ? "device" : "devices";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Active Devices
        </h2>

        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {displaySessions.length} {deviceLabel}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {displaySessions.map((s) => (
          <div
            key={s.token}
            className="group flex items-start justify-between gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition"
          >
            {/* Left */}
            <div className="space-y-1">
              
              {/* OS + Browser */}
              <p className="text-sm font-medium text-gray-800">
                {s.os}{" "}
                <span className="text-gray-400">•</span>{" "}
                {s.browser}
              </p>

              {/* Location */}
              <p className="text-xs text-gray-500">
                📍 {s.city}, {s.country}
              </p>

              {/* Time */}
              <p className="text-[11px] text-gray-400">
                Last active: {new Date(s.lastActive).toLocaleString()}
              </p>
            </div>

            {/* Right */}
            <button
              onClick={() => handleLogout(s.token)}
              className="text-xs px-3 py-1.5 cursor-pointer rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
            >
              Log out
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
