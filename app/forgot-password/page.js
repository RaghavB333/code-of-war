"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft} from "lucide-react";
import { useSearchParams } from "next/navigation";


  const boxs = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inputRefs = useRef([]);
  const RESEND_COOLDOWN = 60;

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(
      () => setSecondsLeft((s) => s - 1),
      1000
    );

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

        // Format timer: 01:00, 00:59, etc.
    const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
    };

  const handleSendOtp = async (resend = false) => {
    if (loading || (resend && secondsLeft > 0)) return;

    setLoading(true);
    setIsSendingOtp(true);
    clearMessages();

    try {
      const response = await axios.post(
        "/api/otpservices/send-otp",
        {
          email: email.trim(),
          purpose: "reset_password",
        }
      );

      setMessage(
        response.data.message || "OTP sent successfully."
      );
      setStep("otp");
      setSecondsLeft(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (loading) return;


    setLoading(true);
    clearMessages();

    try {
      const response = await axios.post(
        "/api/otpservices/verify-otp",
        {
          email: email.trim(),
          otp: otp.join(""),
          purpose: "reset_password",
        }
      );

      // The backend must issue a short-lived,
      // password-reset-only token after OTP verification.
      if (!response.data?.success || !response.data?.resetToken) {
        setError(
          "Reset authorization was not returned by the server."
        );
        return;
      }

      setResetToken(response.data.resetToken);
      setMessage("OTP verified successfully.");
      setStep("password");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await axios.post(
        "/api/reset-password",
        {
          resetToken,
          password,
        }
      );

      setMessage(
        response.data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setStep("done");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


    const handleChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updatedOtp = [...otp];

    updatedOtp[index] = digit;
    setOtp(updatedOtp);
    setError("");
    setMessage("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < 5
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

    const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const digits = Array(6).fill("");

    pasted.split("").forEach((digit, index) => {
      digits[index] = digit;
    });

    setOtp(digits);
    setError("");
    setMessage("");

    inputRefs.current[
      Math.min(pasted.length, 5)
    ]?.focus();
  };

  return (
    <main className='max-h-screen relative flex flex-wrap gap-4 overflow-hidden'>
        {boxs.map((box,index)=> (
          <div key={index} className='w-9 h-9 rounded-lg border border-blue-400'></div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_40%,black_90%)] pointer-events-none"></div>

      <section className="min-h-screen absolute w-full bg-[#0a0a0ab3] flex items-center justify-center px-4">
        <div className="bg-[#09090b] rounded-2xl shadow-[0_0_60px_20px_rgba(0,0,0,0.8)] w-full px-8 max-w-[420px] border border-white/10">
        <Image
          src="/cow1.png"
          alt="Code of War"
          width={220}
          height={100}
          className="mx-auto"
          priority
        />

        <div className="mt-5 text-center">

          <h1 className="text-xl font-semibold text-white">
            {step === "email" && "Forgot Password?"}
            {step === "password" && "Create New Password"}
            {step === "done" && "Password Reset Complete"}
          </h1>

          <p className="mt-2 text-sm text-[#8f8f99]">
            {step === "email" &&
              "Enter your email to receive a reset OTP."}
            {step === "password" &&
              "Choose a strong new password."}
            {step === "done" &&
              "Your password has been updated successfully."}
          </p>
        </div>

        {step === "email" && (
          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOtp();
            }}
          >
            <label className="block text-sm text-white">
              Email
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#67676e]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#09090b] py-2 pl-10 pr-4 text-white outline-none transition focus:border-white/80 focus:ring-2 focus:ring-white/20"
                />
              </div>
            </label>

                {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400"
                >
                  {message}
                </p>
              )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-white py-2 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
        <div>

            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Verify Your Email
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Enter the 6-digit code sent to
              </p>

              <p className="mt-1 break-all font-medium text-gray-900 dark:text-gray-200">
                {email}
              </p>
            </div>

            <div className='mt-6'>
              <label
                className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="otp-0"
              >
                Verification code
              </label>

              <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0 ? "one-time-code" : "off"
                    }
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleChange(event.target.value, index)
                    }
                    onKeyDown={(event) =>
                      handleKeyDown(event, index)
                    }
                    onPaste={handlePaste}
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={loading}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-gray-300 text-center text-xl font-semibold text-white outline-none transition focus:border-white focus:ring-2 focus:ring-white disabled:opacity-60 dark:border-gray-700 bg-[#080808]"
                  />
                ))}
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400"
                >
                  {message}
                </p>
              )}

              <button
                onClick={(e)=> handleVerifyOtp(e)}
                disabled={loading || isEmailVerified || otp.some((digit) => !digit)}
                className="mt-6 w-full cursor-pointer bg-white hover:bg-white/90 text-black font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive the code?{" "}

              {secondsLeft > 0 ? (
                <span className="font-medium text-gray-400">
                  Resend in {formatTime(secondsLeft)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendOtp(true);
                  }}
                  disabled={isSendingOtp}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400"
                >
                  {isSendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <p className="mt-2 text-center text-xs leading-5 text-gray-400">
              Verify your email to reset your password.
            </p>

          </div>
        )}

        {step === "password" && (
          <form
            className="mt-7 space-y-4"
            onSubmit={handleResetPassword}
          >
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-white outline-none focus:border-white/80"
            />

            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              required
              className="w-full rounded-lg border border-white/10 bg-[#09090b] px-4 py-3 text-white outline-none focus:border-white/80"
            />

                {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400"
                >
                  {message}
                </p>
              )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-white py-2 font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <Link
            href={redirectPath ? `/Login?redirect=${encodeURIComponent(redirectPath)}` : '/Login'}
            className="mt-7 mb-6 block w-full rounded-lg bg-white py-2 text-center font-semibold text-black hover:bg-white/90"
          >
            Back to Login
          </Link>
        )}

        {step !== "done" && (
          <Link
            href={redirectPath ? `/Login?redirect=${encodeURIComponent(redirectPath)}` : '/Login'}
            className="mt-6 mb-6 flex items-center justify-center gap-2 pb-5 text-sm text-[#8f8f99] hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        )}
        </div>
      </section>
    </main>
  );
}
