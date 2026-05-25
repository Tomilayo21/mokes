// DeleteAccountModal.jsx
"use client";

import { Dialog } from "@headlessui/react";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function DeleteAccountModal({ triggerButtonClass = "", triggerText = "Delete account" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error || "Failed to delete");
        return;
      }

      // 🚀 Force cookie removal + redirect
      await signOut({ redirect: true, callbackUrl: "/" });
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1 text-red-600 dark:text-red-400 text-sm hover:underline ${triggerButtonClass}`}
      >
        <AlertCircle className="w-4 h-4" />
        {triggerText}
      </button>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-5000 flex items-center justify-center px-4"
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        {/* Panel */}
        <Dialog.Panel className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-xl flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-normal text-black dark:text-white">
              Confirm Deletion
            </Dialog.Title>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning */}
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-thin">
              This will permanently delete your account. Are you sure?
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 dark:text-white hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-70"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
