"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function SessionTracker() {
  const { data: session } = useSession();
  const tracked = useRef(false);

  useEffect(() => {
    if (!session?.user || tracked.current) return;

    tracked.current = true;

    fetch("/api/user/sessions", {
      method: "POST",
    });
  }, [session]);

  return null;
}