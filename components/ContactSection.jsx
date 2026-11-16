"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import ParticleSphereRefactor from "./ParticleSphere";


export default function ContactSection() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status.type) setStatus({ type: "", message: "" });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email.trim() || !formData.message.trim()) {
    setStatus({
      type: "error",
      message: "Please fill out all transmission fields.",
    });
    return;
  }

  setIsSubmitting(true);
  setStatus({ type: "", message: "" });

  try {
    const { data } = await axios.post("/api/contact", {
      email: formData.email.trim(),
      message: formData.message.trim(),
    });

    setStatus({
      type: "success",
      message: data.message || "Signal transmitted successfully! We will get back to you soon.",
    });

    setFormData({ email: "", message: "" });
  } catch (err) {
    setStatus({
      type: "error",
      message:
        err?.response?.data?.message ||
        "Failed to transmit message. Please try again.",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 px-5 md:py-20 lg:px-12 text-white">
      {/* Background ambient lighting matching Code of War theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[450px] w-[450px] rounded-full bg-blue-900/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.06),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: CONTACT FORM                                                */}
          {/* ========================================================================= */}
          <div className="relative z-10 flex flex-col justify-center">
            {/* Tag Badge */}
            <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-blue-400 backdrop-blur-sm">
              Get In Touch
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight">
              SEND A <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-300 bg-clip-text text-transparent">TRANSMISSION</span>
            </h2>

            {/* Subtitle */}
            <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-base max-w-lg">
              Have feedback, discovered a bug in the arena, or want to partner with Code of War? 
              Drop your coordinates and message below.
            </p>

            {/* Status notification banner */}
            {status.message && (
              <div
                className={`mt-6 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${
                  status.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-gray-400"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  Your Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="spartan@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-[#121212]/80 px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-blue-500/60 focus:bg-[#161616] focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-gray-400"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                  Your Message
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message, battlefield query or feedback..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#121212]/80 p-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-blue-500/60 focus:bg-[#161616] focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {/* Subtle shine line effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Transmit Message</span>
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom info note */}
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500/80" />
              <span>Response usually within 24 hours.</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: 3D MODEL CIRCLE SLOT                                       */}
          {/* ========================================================================= */}
          <div className="relative flex items-center justify-center py-6 lg:py-0">
 
            <div className="relative z-10 flex h-[310px] w-[310px] sm:h-[390px] sm:w-[390px] lg:h-[420px] lg:w-[420px] shrink-0 items-center justify-center">
             
                <div className="relative h-full w-full flex items-center justify-center">
                  <ParticleSphereRefactor/>
                </div>

              {/* Pedestal Bottom Highlight Arc */}
              <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-16 w-48 rounded-[100%] bg-blue-500/20 blur-md" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
