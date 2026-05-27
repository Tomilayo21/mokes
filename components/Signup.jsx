// components/AuthForm.jsx
"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
  Check,
} from "lucide-react";
import { VscEye, VscEyeClosed } from "react-icons/vsc"
import { FiLock } from "react-icons/fi"
import { IoMailOutline } from "react-icons/io5"
import { FcGoogle } from "react-icons/fc"
import { FaRegUser } from "react-icons/fa6";
import toast from "react-hot-toast";
import Image from "next/image";


export default function AuthForm({ initialMode = "login", onSuccess }) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(initialMode); // signup | login | forgot | reset

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    verifyPassword: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  

  // Detect reset token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setMode("reset");
    }
  }, [searchParams]);



  // Password criteria
  const password = form.password || "";
  const passCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>[\]\\\/~`+=;:_-]/.test(password),
  };
  const passMetCount = Object.values(passCriteria).filter(Boolean).length;
  const passPercent = Math.round(
    (passMetCount / Object.keys(passCriteria).length) * 100
  );

  // validation helpers
  function validateField(name, value) {
    const e = {};
    if (name === "name" && mode === "signup") {
      if (!value?.trim()) e.name = "Full name is required";
    }
    if (name === "username" && mode === "signup") {
      if (!value) e.username = "Username is required";
      else if (!/^[a-zA-Z0-9_]{3,30}$/.test(value))
        e.username = "3–30 chars; letters, numbers or underscore";
    }
    if (name === "email") {
      if (!value) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        e.email = "Please enter a valid email";
    }
    if (name === "password") {
      if (!value) e.password = "Password is required";
      else {
        const msgs = [];
        if (value.length < 8) msgs.push("At least 8 characters");
        if (!/[A-Z]/.test(value)) msgs.push("An uppercase letter");
        if (!/[!@#$%^&*(),.?\":{}|<>[\]\\\/~`+=;:_-]/.test(value))
          msgs.push("A special character");
        if (msgs.length) e.password = "Password must include: " + msgs.join(", ");
      }
    }
    if (name === "verifyPassword" && mode === "signup") {
      if (!value) e.verifyPassword = "Please confirm your password";
      else if (value !== form.password)
        e.verifyPassword = "Passwords do not match";
    }
    return e;
  }

  function validateAllSignup() {
    const fieldErrors = {};
    ["name", "username", "email", "password", "verifyPassword"].forEach((k) => {
      const val = form[k];
      const result = validateField(k, val);
      if (result && result[k]) fieldErrors[k] = result[k];
    });
    setErrors(fieldErrors);
    return fieldErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      const fieldErr = validateField(name, value);
      if (fieldErr[name]) copy[name] = fieldErr[name];
      else delete copy[name];
      return copy;
    });
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // Signup mode
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (!res.ok) {
          if (data.fieldErrors) {
            Object.values(data.fieldErrors).forEach((errMsg) => {
              toast.custom(
                (t) => (
                  <div
                    className={`max-w-md w-full bg-red-50 dark:bg-red-900 shadow-sm rounded-sm flex items-center gap-3 p-4 transform transition-all duration-300 ${
                      t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                    }`}
                  >
                    {/* <XCircle className="text-red-500" size={20} /> */}
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {errMsg}
                    </p>
                  </div>
                ),
                { duration: 4000, position: "top-right" }
              );
            });
          } else {
            throw new Error(data.error || "Signup failed");
          }
          return;
        }

        // Success
        setSuccess(true);

        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-gray-50 shadow-sm rounded-sm flex items-center gap-3 p-4 transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <p className="text-sm font-light tracking-wide text-gray-900">
                Verification email sent. Please check your inbox.
              </p>
            </div>
          ),
          {
            duration: 3000,
            position: "top-right",
          }
        );

        // Wait so user sees success state + toast
        setTimeout(() => {
          setSuccess(false);
          setMode("login");

          // optionally prefill email
          setForm((prev) => ({
            ...prev,
            password: "",
            verifyPassword: "",
          }));
        }, 3000);
        } else if (mode === "login") {
          const res = await signIn("credentials", {
            redirect: false,
            email: form.email,
            password: form.password,
          });

          if (res.error) {
            let message = "Login failed";

            switch (res.error) {
              case "INVALID_CREDENTIALS":
                message = "Invalid email or password";
                break;

              case "EMAIL_NOT_VERIFIED":
                message = "Please verify your email before logging in";
                break;

              default:
                message = "Something went wrong";
            }

            toast.custom((t) => (
              <div className={`max-w-md w-full bg-gray-50 shadow-sm rounded-sm flex items-center gap-3 p-4 transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}>
                <p className="text-sm font-light tracking-wide text-red-700">
                  {message}
                </p>
              </div>
            ), {
              duration: 4000,
              position: "top-right",
            });

            return;
          }

          // success flow
          let locationData = { ip: "Unknown", city: "Unknown", country: "Unknown" };

          try {
            const locRes = await fetch("https://ipapi.co/json/");
            if (locRes.ok) locationData = await locRes.json();
          } catch (err) {
            console.warn("Failed to fetch location", err);
          }

          const deviceInfo = {
            os: navigator.platform || "Unknown",
            browser: navigator.userAgent || "Unknown",
            ip: locationData.ip || "Unknown",
            city: locationData.city || "Unknown",
            country: locationData.country_name || "Unknown",
          };

          await fetch("/api/user/track-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deviceInfo),
          });

          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);

          toast.custom((t) => (
            <div className={`max-w-md w-full bg-gray-50 dark:bg-gray-50 shadow-sm rounded-sm flex items-center gap-3 p-4 transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}>
              <p className="text-sm font-light tracking-wide text-gray-800 dark:text-gray-800">
                Login successful
              </p>
            </div>
          ), {
            duration: 3000,
            position: "top-right",
          });

          if (onSuccess) onSuccess();
          window.location.href = "/";

      } else if (mode === "forgot") {
        // Forgot password mode
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Reset failed");

        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-yellow-50 dark:bg-yellow-900 shadow-sm rounded-sm flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <CheckCircle className="text-yellow-600" size={20} />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Reset link sent! Check your email.
              </p>
            </div>
          ),
          { duration: 3000, position: "top-right" }
        );

        setResetEmail("");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-red-50 dark:bg-red-900 shadow-sm rounded-sm flex items-center gap-3 p-4 transform transition-all duration-300 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {err.message}
            </p>
          </div>
        ),
        { duration: 4000, position: "top-right" }
      );
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Image for Signup / Forgot (desktop only) */}
      {["signup", "forgot"].includes(mode) && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-gray-200 to-gray-100 p-6 md:p-10">
          <Image
            src={mode === "signup" ? "/Fingerprint-pana.png" : "/Forgot password-pana.png"}
            alt="Illustration"
            className="w-full max-w-xs md:max-w-md mx-auto rounded-sm shadow-sm"
          />
        </div>
      )}

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 py-8 md:py-12 bg-[url('/Image_background.png')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/10 md:bg-transparent"></div>
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mx-auto w-full max-w-md sm:max-w-lg bg-white/95 backdrop-blur-md px-5 py-6 sm:px-8 sm:py-8 md:p-10 rounded-md shadow-xl"
        >
          <h2 className="text-2xl sm:text-2xl font-nromal text-black mb-4 justify-left">
            {mode === "signup"
              ? "Create an account"
              : mode === "login"
              ? "Sign in"
              : mode === "forgot"
              ? "Forgot Password"
              : "Reset Password"}
          </h2>

          {/* Intro Text */}
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {mode === "signup" &&
              "Create your account to shop the latest drops, save your favorite pieces, and enjoy a faster checkout experience."}

            {mode === "login" &&
              "Welcome back! Log in to continue shopping, track your orders, and access your saved items."}

            {mode === "forgot" &&
              "Enter your email address and we’ll send you a link to reset your password so you can get back to shopping."}

            {mode === "reset" &&
              "Set a new password for your account to securely regain access and continue your shopping experience."}
          </p>

          {/* Google Auth */}
          {["signup", "login"].includes(mode) && (
            <>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full py-3 border text-gray-900 border-gray-300 rounded-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition mb-4"
              >
                <FcGoogle alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="px-2 text-gray-400 text-sm">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>
            </>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {mode === "signup" && (
              <>
                <InputField
                  icon={<FaRegUser className="w-5 h-5 text-gray-400" />}
                  placeholder="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <InputField
                  icon={<FaRegUser className="w-5 h-5 text-gray-400" />}
                  placeholder="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  error={errors.username}
                />
              </>
            )}

            {["signup", "login"].includes(mode) && (
              <>
                <InputField
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                  placeholder="Email address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  type="email"
                />

                <InputField
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  // ✅ Only show password errors in signup mode
                  error={mode === "signup" ? errors.password : ""}
                  showToggle
                  show={showPassword}
                  setShow={setShowPassword}
                  type={showPassword ? "text" : "password"}
                />
              </>
            )}


            {mode === "signup" && form.password && (
              <>
                {/* Password Strength: hides when fully valid */}
                {passPercent < 100 && (
                  <div className="mb-3 transition-all duration-300">
                    <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full ${
                          passPercent >= 66
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${passPercent}%` }}
                      />
                    </div>
                    <ul className="mt-2 text-xs space-y-1">
                      <li className="flex items-center gap-1">
                        {passCriteria.length ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-1">
                        {passCriteria.uppercase ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-1">
                        {passCriteria.special ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        One special character
                      </li>
                    </ul>
                  </div>
                )}

                {/* Confirm Password: always visible after typing password */}
                <InputField
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  placeholder="Confirm Password"
                  name="verifyPassword"
                  value={form.verifyPassword}
                  onChange={(e) => {
                    handleChange(e);
                    if (form.password !== e.target.value) {
                      setErrors((prev) => ({
                        ...prev,
                        verifyPassword: "Passwords do not match",
                      }));
                    } else {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.verifyPassword;
                        return copy;
                      });
                    }
                  }}
                  error={errors.verifyPassword}
                  showToggle
                  show={showVerifyPassword}
                  setShow={setShowVerifyPassword}
                  type={showVerifyPassword ? "text" : "password"}
                />
              </>
            )}


            {mode === "forgot" && (
              <InputField
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            )}

            {mode === "reset" && (
              <>
                <InputField
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);

                    // validate password rules
                    const val = e.target.value;
                    if (!val) {
                      setErrors((prev) => ({ ...prev, newPassword: "Password is required" }));
                    } else {
                      const msgs = [];
                      if (val.length < 8) msgs.push("At least 8 characters");
                      if (!/[A-Z]/.test(val)) msgs.push("An uppercase letter");
                      if (!/[!@#$%^&*(),.?\":{}|<>[\]\\\/~`+=;:_-]/.test(val))
                        msgs.push("A special character");

                      if (msgs.length) {
                        setErrors((prev) => ({
                          ...prev,
                          newPassword: "Password must include: " + msgs.join(", "),
                        }));
                      } else {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.newPassword;
                          return copy;
                        });
                      }
                    }
                  }}
                  error={errors.newPassword}
                  showToggle
                  show={showPassword}
                  setShow={setShowPassword}
                  type={showPassword ? "text" : "password"}
                />

                <InputField
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);

                    // validate confirm password
                    if (!e.target.value) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: "Please confirm your password",
                      }));
                    } else if (e.target.value !== newPassword) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: "Passwords do not match",
                      }));
                    } else {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.confirmPassword;
                        return copy;
                      });
                    }
                  }}
                  error={errors.confirmPassword}
                  showToggle
                  show={showVerifyPassword}
                  setShow={setShowVerifyPassword}
                  type={showVerifyPassword ? "text" : "password"}
                />
              </>
            )}
          </div>

          {/* Newsletter + Terms */}
          {mode === "signup" && (
            <div className="mt-6 space-y-3 text-sm text-gray-600">

              {/* Newsletter */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(e) => setSubscribe(e.target.checked)}
                  className="mt-1 accent-[var(--sage)]"
                />
                <span>
                  Subscribe to our newsletter for exclusive drops, early access, and style updates.
                </span>
              </label>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 accent-[var(--sage)]"
                />
                <span>
                  By creating an account, you agree to our{" "}
                  <span className="underline hover:text-[var(--sage)] cursor-pointer">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="underline hover:text-[var(--sage)] cursor-pointer">
                    Privacy Policy
                  </span>.
                </span>
              </label>

            </div>
          )}

          {mode === "login" && (
            <div className="mt-6 space-y-3 text-sm text-gray-600">

              {/* Newsletter */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-1 accent-[var(--sage)]"
                />
                <span>Keep me signed in</span>
              </label>

            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success || (mode === "signup" && !agreeTerms)}
            className="
              w-full mt-6
              cursor-pointer bg-[var(--sage)] text-white hover:bg-zinc-500
              text-white text-lg
              py-2 px-4
              rounded-sm
              shadow-md
              hover:shadow-xl hover:scale-[1.03]
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
              transition-transform duration-200 ease-in-out
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {success ? (
              <>
                <Check className="w-5 h-5" />
                Success
              </>
            ) : (
              <>
                {mode === "signup"
                  ? "Create Account"
                  : mode === "login"
                  ? "Login"
                  : mode === "forgot"
                  ? "Send Reset Link"
                  : "Reset Password"}
              </>
            )}
          </button>

          {/* Links */}
          <div className="mt-4 text-center text-sm space-y-2">
            {mode === "signup" && (
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="cursor-pointer text-zinc-500 hover:text-[var(--sage)] font-medium hover:underline"
                >
                  Login
                </button>
              </p>
            )}
            {mode === "login" && (
              <div className="flex flex-col gap-1">
                <p className="text-gray-600">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="cursor-pointer text-zinc-500 hover:text-[var(--sage)] font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="cursor-pointer text-zinc-500 hover:text-[var(--sage)] font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            {["forgot", "reset"].includes(mode) && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="cursor-pointer text-zinc-500 hover:text-[var(--sage)] font-medium hover:underline"
              >
                Back to Login
              </button>
            )}
          </div>
        </form>

        {/* Right Image for Login / Reset (desktop only) */}
        {["login", "reset"].includes(mode) && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-6 md:p-10">
            <Image
              src={mode === "login" ? "/Mobile login-pana.png" : "/Forgot password-pana.png"}
              alt="Illustration"
              width={100}
              height={100}
              className="w-full max-w-xs md:max-w-md mx-auto rounded-md shadow-lg"
            />
          </div>
        )}
      </div>
    </div>


  );
}

// Reusable InputField Component
function InputField({ icon, placeholder, name, value, onChange, error, type = "text", showToggle, show, setShow }) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-3.5">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pl-10 pr-10 py-2.5 border rounded-md w-full text-gray-700 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3.5 text-gray-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
