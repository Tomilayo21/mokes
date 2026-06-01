"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Signup from "@/components/Signup";


export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();




  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1 flex justify-center items-center pt-[calc(var(--navbar-height)+1rem)] bg-gray-50 dark:bg-gray-50 md:px-16 lg:px-32 py-16">
        <Signup />
      </main>

      <Footer />
    </div>
  );
}
