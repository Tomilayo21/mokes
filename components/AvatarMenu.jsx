"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { User, LogOut, ShieldCheck, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import DeleteAccountModal from "./DeleteAccountModal";
import ActiveDevices from "./ActiveDevices";
import Link from "next/link";
import { UAParser } from "ua-parser-js";
import toast from "react-hot-toast";
import { XCircle, CheckCircle } from "lucide-react";
import { FaRegUser } from "react-icons/fa6";
import Image from "next/image";



export default function AvatarMenu() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isGoogleUser = session?.user?.authProvider === "google";
  

  const router = useRouter();
  const user = session?.user;

  const menuRef = useRef(null);

  if (!user) return null;

  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("profile");
  const [localName, setLocalName] = useState(user?.name || "");
  const [localUsername, setLocalUsername] = useState(user?.username || "");
  const [imagePreview, setImagePreview] = useState(user?.image || user?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);


  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: `${window.location.origin}/`,
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDesktopMenuOpen(false);
      }
    }
    if (desktopMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopMenuOpen]);


  useEffect(() => {
    if (session?.user) {
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
      // ✅ Always use full name for localName
      setLocalName(session.user.name || "User");

      // ✅ Keep username separate
      setLocalUsername(session.user.username || "");
    }
  }, [session]);

  const [footerData, setFooterData] = useState({
    footerName: "",
  });

  useEffect(() => {
    const fetchFooter = async () => {
      const res = await fetch("/api/settings/footerdetails");
      const data = await res.json();
      setFooterData({
        footerName: data.footerName,
      });
    };
    fetchFooter();
  }, []);

  const handleAdminClick = () => router.push("/"); //add admin link*

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }


  async function handleSaveProfile() {
    try {
      setSavingProfile(true);

      let dataUrl = null;
      if (imageFile) {
        dataUrl = await fileToDataUrl(imageFile);
      }

      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: localUsername,
          dataUrl,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        const errMsg = err?.error || "Failed to update";

        // ❌ ERROR TOAST
        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-red-50 dark:bg-red-900 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <XCircle className="text-red-500" size={20} />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {errMsg}
              </p>
            </div>
          ),
          { duration: 4000, position: "top-right" }
        );

        throw new Error(errMsg);
      }

      // refresh UI
      router.refresh();
      setImageFile(null);

      // ✅ SUCCESS TOAST
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-green-50 dark:bg-green-900 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Profile updated successfully!
            </p>
          </div>
        ),
        { duration: 3500, position: "top-right" }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  }


  async function handleRemoveImage() {
    if (!confirm("Remove profile image?")) return;
    const res = await fetch("/api/user/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeImage: true }),
    });
    if (!res.ok) {
      const j = await res.json(); alert(j.error || "Failed");
      return;
    }
    router.refresh();
    setImagePreview(null);
    setImageFile(null);
  }


  async function handleChangePassword(e) {
    e.preventDefault();
    setChangingPass(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) {
        const errMsg = json.error || "Could not update password";

        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-red-50 dark:bg-red-900 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <XCircle className="text-red-500" size={20} />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {errMsg}
              </p>
            </div>
          ),
          { duration: 4000, position: "top-right" }
        );

        throw new Error(errMsg);
      }

      // Reset fields
      setCurrentPassword("");
      setNewPassword("");

      // ✅ SUCCESS TOAST
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-green-50 dark:bg-green-900 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Password changed successfully!
            </p>
          </div>
        ),
        { duration: 3500, position: "top-right" }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setChangingPass(false);
    }
  }

  function checkPasswordRules(password) {
    const errors = [];

    if (!password || password.length < 8)
      errors.push("Password must be at least 8 characters");

    if (!/[A-Z]/.test(password))
      errors.push("Must include at least one uppercase letter");

    if (!/[!@#$%^&*(),.?\":{}|<>[\]\\\/~`+=;:_-]/.test(password))
      errors.push("Must include at least one special character");

    return errors;
  }



  return (
    <div className="relative" ref={menuRef}>
    
      {/* Avatar button */}
      <button
        onClick={() => {
          if (window.innerWidth >= 768) setDesktopMenuOpen(!desktopMenuOpen);
          else setMobileMenuOpen(true);
        }}
        className={`flex items-center justify-center transition hover:opacity-90 ${
          user?.image
            ? "w-9 h-9 rounded-full overflow-hidden shadow"
            : ""
        }`}
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <FaRegUser className="w-4 h-4 text-black" />
        )}
      </button>

      {/* ================= DESKTOP DROPDOWN ================= */}
      {desktopMenuOpen && (
        <div className="hidden md:block absolute left-1/2 top-10 transform -translate-x-[66%] w-72 bg-gray-50 dark:bg-gray-50 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Profile Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
            )}
            <div className="text-gray-900 dark:text-gray-900">
              <p className="font-normal">{user?.name}</p>
              <p className="text-sm font-normal break-words max-w-[180px]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col py-2">

            {mounted && user ? (
              <>
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition font-normal cursor-pointer"
                >
                  My Orders
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition font-normal cursor-pointer"
                >
                  Wishlist
                </Link>
              </>
            ) : null }

            <button
              onClick={() => {
                setDesktopMenuOpen(false);
                setTab("profile");
                setModalOpen(true);
              }}
              className="flex items-center gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition cursor-pointer"
            >
              <span className="font-normal">Manage Account</span>
            </button>
            {mounted && user?.role === "admin" && (
              <div
                onClick={handleAdminClick}
                className="flex items-center gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition font-normal cursor-pointer"
              >
                <span className="">Admin</span>
                {/* <ShieldAlert className="w-5 h-5 text-black" /> */}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3 text-[var(--sage)] dark:text-[var(--sage)] hover:bg-gray-50 dark:hover:text-black dark:hover:bg-white transition cursor-pointer"
            >
              <span className="font-normal">Sign out</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 px-5 py-3 text-xs text-gray-400 dark:text-gray-700 bg-gray-50 dark:bg-gray-50 border-t border-gray-200 dark:border-gray-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-light">
              Secured by <span className="font-light">{footerData.footerName}</span>
            </span>
          </div>
        </div>
      )}

      {/* ================= MOBILE SHEET ================= */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="md:hidden fixed inset-0 z-5000 flex items-center justify-center"
          onClose={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-4000" />
          </Transition.Child>

          {/* Centered Panel */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative z-5000 w-full max-w-md mx-auto rounded-md border dark:border-black bg-gray-50 dark:bg-gray-50 shadow-2xl overflow-hidden">
              {/* Profile Header */}

              <div className="flex items-center gap-3 px-5 py-4 border-b">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 border border-black dark:border-black rounded-full bg-white flex items-center justify-center">
                    <User className="w-6 h-6 text-black" />
                  </div>
                )}
                <div className="font-normal text-gray-900 dark:text-black">
                  <p>{user?.name}</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
              </div>



              {/* Actions */}
              <div className="flex flex-col py-2">
              {mounted && user ? (
                <>
                  <Link
                    href="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition font-normal cursor-pointer"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition font-normal cursor-pointer"
                  >
                    Wishlist
                  </Link>
                </>
              ) : null }

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTab("profile");
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition cursor-pointer"
                >
                  <span className="font-normal">Manage Account</span>
                </button>

                {mounted && user?.role === "admin" && (
                  <div
                    onClick={handleAdminClick}
                    className="flex items-center gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-black dark:hover:text-black dark:hover:bg-white transition font-normal cursor-pointer"
                  >
                    <span className="">Admin</span>
                    {/* <ShieldAlert className="w-5 h-5 text-black" /> */}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-5 py-3 text-[var(--sage)] dark:text-[var(--sage)] hover:bg-gray-50 dark:hover:text-black dark:hover:bg-white transition cursor-pointer"
                >
                  <span className="font-normal">Sign out</span>
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-2 px-5 py-3 text-xs text-gray-400 dark:text-gray-700 bg-gray-50 dark:bg-gray-50 border-t border-gray-200 dark:border-gray-700">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-light">
                  Secured by <span className="font-light">{footerData.footerName}</span>
                </span>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>


      {/* ================= FULL ACCOUNT MODAL (desktop+mobile) ================= */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-5000">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Centered modal */}
        <div className="fixed inset-0 flex items-center justify-center px-4 sm:px-6">
          <Dialog.Panel className="w-full max-w-3xl md:max-w-4xl max-h-[90vh] md:max-h-[80vh] rounded-2xl bg-white dark:bg-black shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar */}
            <div className="flex md:flex-col w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              {["profile", "security"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 md:flex-none text-center md:text-left px-3 py-2 font-medium border-b md:border-b-0 md:border-l md:first:border-l-0
                    ${tab === t
                      ? "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
              {tab === "profile" && (
                <div className="space-y-5">
                  {/* Avatar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-20 h-20 border dark:border-white rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-black w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block font-thin text-black dark:text-white">
                        Change avatar
                      </label>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <label className="inline-block cursor-pointer border dark:border-white bg-gray-50 dark:bg-black text-black dark:text-white text-sm px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-black transition">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="font-thin text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Name & Username */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="font-thin text-black dark:text-white w-full sm:w-1/3">
                      Full Name
                    </p>
                    <input
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full sm:w-2/3 px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-white
                        transition-colors duration-300"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="font-thin text-black dark:text-white w-full sm:w-1/3">
                      Username
                    </p>
                    <input
                      value={localUsername}
                      onChange={(e) => setLocalUsername(e.target.value)}
                      className="w-full sm:w-2/3 px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-white
                        transition-colors duration-300"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <p className="font-thin text-black dark:text-white">
                      Email Address
                    </p>
                    <p className="text-gray-500 font-thin dark:text-gray-400 break-all text-sm">
                      {user?.email}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-gray-600 text-sm text-white px-5 py-2 rounded-md cursor-pointer hover:bg-gray-700 transition"
                    >
                      {savingProfile ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        setTab("profile");
                      }}
                      className="text-sm text-gray-600 dark:text-white hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

              )}

              {/* Security */}
              {!isLoading && tab === "security" && (
                <div className="space-y-5">

                  {/* Password Section */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="font-normal text-black dark:text-gray-200">Password</p>
                    <button
                      className="text-sm text-gray-600 hover:underline"
                      onClick={() => setTab("password")}
                    >
                      Update password
                    </button>
                  </div>

                  {/* Password Change Form */}
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    {/* Current Password */}
                    <div className="relative w-full sm:w-2/3 md:w-1/2">
                      <input
                        disabled={isGoogleUser}
                        type={showCurrent ? "text" : "password"}
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full px-3 py-2 font-normal rounded border 
                          ${isGoogleUser ? "bg-gray-200 dark:bg-neutral-800 opacity-60 cursor-not-allowed" : "bg-white dark:bg-neutral-900"}
                          border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100
                          placeholder-gray-400 dark:placeholder-gray-500 pr-10 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-300`}
                      />
                      <button
                        type="button"
                        disabled={isGoogleUser}
                        onClick={() => setShowCurrent(!showCurrent)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2
                          ${isGoogleUser ? "text-gray-400 cursor-not-allowed" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* New Password */}
                    <div className="relative w-full sm:w-2/3 md:w-1/2">
                      <input
                        disabled={isGoogleUser}
                        type={showNew ? "text" : "password"}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => {
                          if (isGoogleUser) return;
                          const val = e.target.value;
                          setNewPassword(val);
                          setPasswordErrors(checkPasswordRules(val));
                        }}
                        className={`w-full px-3 py-2 font-normal rounded border 
                          ${isGoogleUser ? "bg-gray-200 dark:bg-neutral-800 opacity-60 cursor-not-allowed" : "bg-white dark:bg-neutral-900"}
                          border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 
                          placeholder-gray-400 dark:placeholder-gray-500 pr-10 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-300`}
                      />
                      <button
                        type="button"
                        disabled={isGoogleUser}
                        onClick={() => setShowNew(!showNew)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2
                          ${isGoogleUser ? "text-gray-400 cursor-not-allowed" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {passwordErrors.length > 0 && (
                      <ul className="text-xs text-red-500 space-y-1 mt-1">
                        {passwordErrors.map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    )}

                    <button
                      type="submit"
                      disabled={isGoogleUser || changingPass}
                      className={`text-sm px-5 py-2 rounded-md transition cursor-pointer 
                        ${isGoogleUser ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-gray-600 text-white hover:bg-gray-700"}`}
                    >
                      {isGoogleUser ? "Google Account — Password Locked" 
                                    : changingPass ? "Updating..." 
                                    : "Update password"}
                    </button>
                  </form>

                  {/* Active Sessions / Devices */}

                  <ActiveDevices />


                  {/* Delete Account */}
                  <div className="mt-2 flex flex-col gap-1">
                    <DeleteAccountModal />
                  </div>
                </div>
              )}

            </div>
            </Dialog.Panel>
          </div>
      </Dialog>


    </div>
  );
}