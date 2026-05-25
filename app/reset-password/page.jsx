// app/reset-password/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Signup from "@/components/Signup";
import SuperAdminUnlock from "@/components/admin/SuperAdminUnlock";

export default function ResetPasswordPage({ searchParams }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [superAdminVerified, setSuperAdminVerified] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(true);

  useEffect(() => {
    setMounted(true);

    if (status === "authenticated") {
      // Redirect logged-in users to home
      router.replace("/");
      return;
    }
  }, [status, router]);

  const handleUnlockSuccess = () => {
    setSuperAdminVerified(true);
    setShowUnlockPrompt(false);
  };

  const handleUnlockCancel = () => {
    setShowUnlockPrompt(false);
    // superAdminVerified is still false → ResetPassword cannot render
  };

  if (!mounted) return null;

  // Show unlock modal if prompt is active OR not verified
  if (!superAdminVerified && showUnlockPrompt) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <SuperAdminUnlock
          onSuccess={handleUnlockSuccess}
          onCancel={handleUnlockCancel}
        />
      </div>
    );
  }

  // If not verified and modal is closed, show locked message
  if (!superAdminVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You do not have permission to access this page. Please unlock to continue.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setShowUnlockPrompt(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
            >
              Unlock
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition transform hover:scale-105"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex justify-center items-center mt-16 bg-gray-50 dark:bg-gray-50 px-4 md:px-16 lg:px-32 py-16">
        <Signup initialMode="reset" />
      </main>

      <Footer />
    </div>
  );
}
