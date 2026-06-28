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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewerImage, setViewerImage] = useState(null);
  const zoomPercent = Math.round(zoom * 100);


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
              className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <p className="flex-1 text-sm font-medium text-red-700 dark:text-red-300">
                {errMsg}
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
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
              t.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <p className="flex-1 text-sm font-normal text-black tracking-wide dark:text-black">
              Profile updated successfully!
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
              className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <p className="flex-1 text-sm font-medium text-red-700 dark:text-red-300">
                {errMsg}
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
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
              t.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <p className="flex-1 text-sm font-normal text-black tracking-wide dark:text-black">
              Password changed successfully!
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

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo({
      os: result.os.name || "Unknown OS",
      browser: result.browser.name || "Unknown Browser",
    });


    const now = new Date();
    setTime(
      now.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );

    // Get location (city, country) using a free IP-based service
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setLocation(`${data.city}, ${data.country_name}`))
      .catch(() => setLocation("Unknown Location"));
  }, []);


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
            ? "w-6 h-6 rounded-full overflow-hidden shadow"
            : ""
        }`}
      >
        {user?.image ? (
         <div className="relative w-6 h-6 cursor-pointer rounded-full overflow-hidden">
            <Image
              src={user.image}
              alt={user.name || "User"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <FaRegUser className="w-4 h-4 text-black" />
        )}
      </button>

      {/* ================= DESKTOP DROPDOWN ================= */}
      {desktopMenuOpen && (
        <div className="hidden md:block absolute left-1/2 top-10 transform -translate-x-[66%] w-72 bg-gray-50 dark:bg-gray-50 rounded-sm shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Profile Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            {user?.image ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
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
                  href="\my-orders"
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
            <Dialog.Panel className="relative z-5000 w-full max-w-md mx-auto rounded-sm border dark:border-black bg-gray-50 dark:bg-gray-50 shadow-2xl overflow-hidden">
              {/* Profile Header */}

              <div className="flex items-center gap-3 px-5 py-4 border-b">
                {user?.image ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
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
          <Dialog.Panel className="w-full max-w-3xl md:max-w-4xl max-h-[90vh] md:max-h-[80vh] rounded-sm bg-white dark:bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar */}
            <div className="flex md:flex-col w-full md:w-52 border-b md:border-b-0 md:border-r border-gray-200 bg-white">

              {["profile", "security"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative flex-1 md:flex-none text-sm font-medium px-4 py-3 transition-all duration-200
                    text-left
                    hover:bg-gray-50
                    ${tab === t
                      ? "bg-gray-100 text-black"
                      : "text-gray-600"
                    }
                  `}
                >

                  {/* Active Indicator Bar */}
                  {tab === t && (
                    <span className="absolute left-0 top-0 h-full w-[3px] bg-black rounded-r" />
                  )}

                  {/* Label */}
                  <span className="ml-1">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>

                </button>
              ))}

            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
              {tab === "profile" && (
                <div className="space-y-6">

                  {/* Profile Card */}
                  <div className="bg-white border rounded-lg p-5 space-y-6">

                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-5">

                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                        {imagePreview ? (
                          <div
                            className="relative w-full h-full cursor-pointer"
                            onClick={() => {
                              setViewerImage(user.image);
                              setViewerOpen(true);
                              setZoom(1);
                            }}
                          >
                            <Image
                              src={user.image}
                              alt="User avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <User className="w-10 h-10 text-gray-500" />
                        )}
                      </div>

                      {/* Upload Actions */}
                      <div className="flex-1 w-full space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Profile Picture
                        </p>

                        <div className="flex flex-wrap items-center gap-3">

                          <label className="cursor-pointer bg-black text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition">
                            Choose Image
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
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>

                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid gap-5">

                      {/* Full Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-1/3 text-sm font-medium text-gray-700">
                          Full Name
                        </label>

                        <input
                          value={localName}
                          onChange={(e) => setLocalName(e.target.value)}
                          className="w-full sm:w-2/3 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black text-black"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Username */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-1/3 text-sm font-medium text-gray-700">
                          Username
                        </label>

                        <input
                          value={localUsername}
                          onChange={(e) => setLocalUsername(e.target.value)}
                          className="w-full sm:w-2/3 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black text-black"
                          placeholder="Enter username"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="sm:w-1/3 text-sm font-medium text-gray-700">
                          Email Address
                        </p>

                        <p className="w-full sm:w-2/3 text-sm text-gray-600 break-all">
                          {user?.email}
                        </p>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">

                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="bg-black text-white text-sm px-5 py-2 rounded-md hover:opacity-90 transition"
                      >
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        onClick={() => {
                          setModalOpen(false);
                          setTab("profile");
                        }}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>

                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {!isLoading && tab === "security" && (
                <div className="space-y-6">

                  {/* PASSWORD SECTION CARD */}
                  <div className="bg-white border rounded-lg p-5 space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Password Security
                      </h3>

                      <button
                        className="text-xs text-gray-600 hover:underline"
                        onClick={() => setTab("password")}
                      >
                        Change password
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleChangePassword} className="space-y-4">

                      {/* Current Password */}
                      <div className="relative">
                        <input
                          disabled={isGoogleUser}
                          type={showCurrent ? "text" : "password"}
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-md text-black pr-10
                            ${isGoogleUser ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                            focus:outline-none focus:ring-1 focus:ring-black`}
                        />

                        <button
                          type="button"
                          disabled={isGoogleUser}
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* New Password */}
                      <div className="relative">
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
                          className={`w-full px-3 py-2 text-sm border text-black rounded-md pr-10
                            ${isGoogleUser ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                            focus:outline-none focus:ring-1 focus:ring-black`}
                        />

                        <button
                          type="button"
                          disabled={isGoogleUser}
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Password Errors */}
                      {passwordErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                          <ul className="text-xs text-red-600 space-y-1">
                            {passwordErrors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isGoogleUser || changingPass}
                        className={`text-sm px-5 py-2 rounded-md transition
                          ${isGoogleUser
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-black text-white hover:opacity-90"
                          }`}
                      >
                        {isGoogleUser
                          ? "Google account (locked)"
                          : changingPass
                            ? "Updating..."
                            : "Update password"}
                      </button>

                    </form>
                  </div>

                  {/* DEVICE SECTION CARD */}
                    <ActiveDevices />

                  {/* DELETE ACCOUNT */}
                  <div className="bg-white border rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                      Danger Zone
                    </h3>

                    <DeleteAccountModal />
                  </div>

                </div>
              )}

            </div>
            </Dialog.Panel>
          </div>
      </Dialog>

      <Transition show={viewerOpen} as={Fragment}>
        <Dialog
          onClose={() => setViewerOpen(false)}
          className="relative z-[100000]"
        >
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/95" />
          </Transition.Child>

          {/* Center */}
          <div className="fixed inset-0 flex items-center justify-center">
            
            <Dialog.Panel className="relative w-full h-full flex items-center justify-center">

              {/* IMAGE WRAPPER (IMPORTANT FIX) */}
              <div
                className="transition-transform duration-150 select-none"
                style={{
                  transform: `scale(${zoom})`,
                  touchAction: "none"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={viewerImage}
                  alt="preview"
                  width={700}
                  height={700}
                  className="object-contain max-h-[90vh] max-w-[90vw] pointer-events-none"
                />
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setViewerOpen(false)}
                className="absolute top-5 right-5 cursor-pointer text-white text-3xl z-50"
              >
                ✕
              </button>

              {/* Zoom indicator (animated) */}
              <div
                className="absolute bottom-20 text-white/80 text-sm font-medium px-3 py-1 rounded bg-black/30 backdrop-blur-md transition-all duration-200"
                style={{
                  transform: "translateY(0px)",
                }}
              >
                {zoomPercent}%
              </div>
              {/* CONTROLS (FIXED — NO CLOSE BUBBLE) */}
              <div className="absolute bottom-8 flex gap-3 z-50">

                {/* MINUS */}
                <button
                  type="button"
                  disabled={zoom <= 1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (zoom > 1) setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)));
                  }}
                  className={`px-4 py-2 rounded transition
                    ${zoom <= 1
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                    }`}
                >
                  −
                </button>

                {/* PLUS */}
                <button
                  type="button"
                  disabled={zoom >= 3}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (zoom < 3) setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)));
                  }}
                  className={`px-4 py-2 rounded transition
                    ${zoom >= 3
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                    }`}
                >
                  +
                </button>

                {/* RESET */}
                <button
                  type="button"
                  disabled={zoom === 1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom(1);
                  }}
                  className={`px-4 py-2 rounded transition
                    ${zoom === 1
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                    }`}
                >
                  Reset
                </button>

              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}