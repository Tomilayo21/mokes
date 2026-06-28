"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { UAParser } from "ua-parser-js";

export default function SessionTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const trackSession = async () => {
      const parser = new UAParser();
      const result = parser.getResult();

      const os = result.os.name || "Unknown OS";
      const browser = result.browser.name || "Unknown Browser";

      let city = "Unknown";
      let country = "Unknown";
      let ip = "unknown";

      // 🌍 Get location + IP
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();

        if (data.success) {
          city = data.city || "Unknown";
          country = data.country || "Unknown";
          ip = data.ip || "unknown";
        }
      } catch (err) {
        console.log("Location fetch failed:", err);
      }

      // 🚀 Send EVERYTHING to backend
      await fetch("/api/user/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          os,
          browser,
          city,
          country,
          ip,
        }),
      });
    };

    trackSession();

    const interval = setInterval(trackSession, 60000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return null;
}