import React from 'react'

const AccessModal = ({ onLogin }) => {
  return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-[#0a0a0a] px-4 text-white">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#101116] px-6 py-10 text-center shadow-2xl sm:px-10">

          {/* Background Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Access Denied
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
            You are not authorized to access this arena.
            Please log in to your account before continuing.
          </p>

          {/* Login Button */}
          {/* <button
            onClick={onLogin}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] active:scale-[0.98]"
          >
            Login to Continue
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button> */}

          <p className="mt-5 text-[11px] text-gray-600">
            CODE OF WAR <span className="mx-1 text-blue-500">/</span> LOGIN REQUIRED
          </p>
        </div>
      </div>
  )
}

export default AccessModal
