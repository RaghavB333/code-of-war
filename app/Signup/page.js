"use client"
import React from 'react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { signIn} from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';
const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setemail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [tab, setTab] = useState('signup');
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");

    const inputRefs = useRef([]);
    const RESEND_COOLDOWN = 60;

      // Countdown timer
      useEffect(() => {
        if (secondsLeft <= 0) return;

        const timer = setInterval(() => {
          setSecondsLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
      }, [secondsLeft]);

    // Format timer: 01:00, 00:59, etc.
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;
    };


      useEffect(() => {
        const getProfile = async() => {
          try{
            const response = await axios.get('/api/profile', {withCredentials: true});
            if(response.status === 200){
                router.push('/');
            }
            else{
              setMessage(response.data.message);
            }
          }catch(error){
            console.log(error);
          }
        }
        getProfile();
    }, []);


    const createAccount = async() => {
      const newUser = {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      };
      try{
        const response = await axios.post(`/api/user`, newUser, {withCredentials: true});
    
        if(response.status === 200){
          setUsername('');
          setemail('');
          setPassword('');
          setConfirmPassword('');
          router.push(redirectPath ? `/Login?redirect=${encodeURIComponent(redirectPath)}` : '/Login');
        }
      }catch(error){
        setMessage(error.response.data.message);
      }
    }
  
    const handleSendOtp = async(isResend = false) => {
      if (isSendingOtp || (isResend && secondsLeft > 0)) return;

      if(!username || !email || !password || !confirmPassword){
        setMessage("Please fill all the fields");
        return;
      }
      if(password !== confirmPassword){
        setMessage("Passwords do not match");
        return;
      }
      setIsSendingOtp(true);
      setMessage("");
      setError("");

      try{
        const response = await axios.post('/api/otpservices/send-otp', {email: email, purpose: 'verify_email'});
        if(response.status === 200){
          setMessage(
          response.data?.message ||
            (isResend ? "OTP resent successfully." : "OTP sent to your email.")
          );
          setSecondsLeft(RESEND_COOLDOWN);
          if (!isResend) {
            setTab("otp");
          }
        }
      }catch(error){
        const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
        setMessage("");
        setError(errorMessage);

        console.error("Failed to send OTP:", error);
      } finally {
        setIsSendingOtp(false);
      }
    }

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



  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    console.log("Verifying OTP for email: ", email, " with OTP: ", otp);
    try {
      const response = await axios.post(
        "/api/otpservices/verify-otp",
        {
          email: email.trim(),
          otp: otp.join(""),
          purpose: "verify_email",
        }
      );

      if (response.status === 200 && response.data?.success) {
        setIsEmailVerified(true);
        setMessage(
          response.data.message || "Email verified successfully."
        );
        createAccount();
        setError("");
        setSecondsLeft(0);

        // Move to the next signup step if required.
        // Example: setTab("signup");
      } else {
        setMessage("");
        setError(
          response.data?.message || "OTP verification failed."
        );
      }
    } catch (error) {
      const status = error.response?.status;
      const errorMessage =
        error.response?.data?.message ||
        "Unable to verify OTP. Please try again.";

      setMessage("");
      setError(errorMessage);

      // If the server confirms that the OTP is invalid,
      // expired, or attempts are exhausted, allow correction.
      if ([400, 401, 410, 429].includes(status)) {
        setIsEmailVerified(false);
      }

      console.error(
        "OTP verification failed:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

    const boxs = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

    return (
      <div className='max-h-screen relative flex flex-wrap gap-4 overflow-hidden'>
        {boxs.map((box,index)=> (
          <div key={index} className='w-9 h-9 rounded-lg border border-blue-400'></div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_40%,black_90%)] pointer-events-none"></div>
      <div className="min-h-screen absolute w-full bg-[#0a0a0ab3] flex items-center justify-center mx-4">
      <div className="bg-[#09090b] rounded-2xl border border-white/10 shadow-xl px-8 py-3 w-full max-w-[450px]">
        <div>
          <Image src='/cow1.png' alt='logo' width={220} height={100} className='mx-auto'></Image>
        </div>

        <form className="space-y-4">
          
        {tab === 'signup' ? (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 block">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                minLength={6}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                minLength={6}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <p className={message == '' ? 'hidden' : 'block text-center'}>{message}</p>

          <button
            type="submit"
            disabled={isSendingOtp || !email.trim()}
            onClick={(e) => {
              e.preventDefault();
              handleSendOtp(false);
            }}
            className="w-full cursor-pointer bg-white hover:bg-white/90 text-black font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            {isSendingOtp ? "Creating Account..." : "Create Account"}
            
          </button>
            
          </>
        ) : (
          <div>

            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Verify your email
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
              Verify your email to complete your Code of War
              registration.
            </p>

          </div>
        )}
        </form>

        <div className="flex mt-3 items-center gap-3 before:h-px before:flex-1 before:bg-white/30 after:h-px after:flex-1 after:bg-white/30">
          <span className="text-xs text-muted-foreground">Or</span>
        </div>

          <button onClick={() => signIn("google", { callbackUrl: redirectPath ? `/${redirectPath}` : '/' })} className="w-full flex justify-center items-center mt-3 bg-[#09090b] text-white border border-white/10 font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
              <FcGoogle className="mr-2 size-5" />
              Continue with Google
          </button>

        <p className="text-center mt-2 text-[#8f8f99] pb-2">
          Already have an account?{' '}
          <a href={redirectPath ? `/Login?redirect=${encodeURIComponent(redirectPath)}` : '/Login'} className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
    </div>
    )
}

export default Signup
