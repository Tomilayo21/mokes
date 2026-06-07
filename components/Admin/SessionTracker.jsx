"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function SessionTracker() {
  const { data: session } = useSession();
  const tracked = useRef(false);

    useEffect(() => {
    fetch("/api/user/sessions"); // ONLY fetch, no create
    }, []);

  return null;
}