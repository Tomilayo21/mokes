// components/SessionTracker.jsx

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SessionTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/user/sessions", {
      method: "POST",
    });
  }, [session]);

  return null;
}