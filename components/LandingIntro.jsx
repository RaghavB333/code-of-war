"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Elder Futhark Norse runes for authentic God of War aesthetic
const NORSE_RUNES = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ",
  "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ",
  "ᛚ", "ᛜ", "ᛞ", "ᛟ"
];

const PHASES = [
  { at: 0, text: "COMMUNING WITH THE NINE REALMS...", sub: "Yggdrasil Core v4.2" },
  { at: 25, text: "FORGING LEVIATHAN ALGORITHMS...", sub: "Asgardian Protocol Synchronized" },
  { at: 55, text: "CHARGING MJÖLNIR COMPILERS...", sub: "Zero-Lag Matchmaking Online" },
  { at: 82, text: "THE WARRIORS AWAKEN...", sub: "Arena Gate Unsealed" },
  { at: 100, text: "WELCOME TO THE BATTLEFIELD", sub: "Press Any Key or Click to Enter" },
];

export default function LandingIntro({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(PHASES[0]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const audioCtxRef = useRef(null);
  const canvasRef = useRef(null);

  // Web Audio Synth for cinematic immersion (No external MP3 required)
  const playSwell = useCallback((freq = 55, duration = 2.5) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") {
        audioCtxRef.current?.resume();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Trigger smooth exit transition
  const handleFinish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 1100);
  }, [isExiting, onComplete]);

  // Main progress sequence (total ~6.8 seconds for rich cinematic feel)
  useEffect(() => {
    const startTime = Date.now();
    const totalDuration = 6800; // 6.8s total duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgress(pct);

      // Update text phase based on percent
      const matched = [...PHASES].reverse().find((p) => pct >= p.at);
      if (matched) setCurrentPhase(matched);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(handleFinish, 900);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [handleFinish]);

  // Keyboard shortcut: ESC or Space to skip
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.code === "Space" || e.key === "Enter") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFinish]);

  // Background Particle System (Rune Dust & Electric Sparks)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -Math.random() * 1.4 - 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.05 + 0.01,
      color: Math.random() > 0.4 ? "#38bdf8" : "#60a5fa",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Central radial glow
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.55
      );
      grad.addColorStop(0, "rgba(29, 78, 216, 0.15)");
      grad.addColorStop(0.4, "rgba(15, 23, 42, 0.08)");
      grad.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw embers
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * 0.003 + p.x) * 0.01;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        scale: isExiting ? 1.08 : 1,
        filter: isExiting ? "blur(12px)" : "blur(0px)",
      }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#040404] text-white overflow-hidden select-none"
    >
      {/* 1. Ambient Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* 2. Top Bar: Branding mark + Skip button */}
      <div className="relative z-20 w-full max-w-7xl px-6 pt-6 flex items-center justify-between text-xs font-mono uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse" />
          <span className="text-gray-400 font-semibold tracking-[0.2em]">Code of War</span>
          <span className="text-gray-600">/</span>
          <span className="text-blue-400/80 hidden sm:inline">Genesis Sequence</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playSwell(65, 3);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 hover:text-white transition-all backdrop-blur-md"
          >
            <span>{soundEnabled ? "🔊 AUDIO ON" : "🔇 AUDIO OFF"}</span>
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/20 hover:bg-blue-600/20 text-[11px] text-blue-300 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <span>SKIP INTRO</span>
            <span className="text-[9px] text-blue-400/60 font-sans tracking-normal group-hover:text-blue-200">
              [ESC]
            </span>
          </button>
        </div>
      </div>

      {/* 3. Center Hero Stage: Norse Rune Rings + Weapons + Cinematic Logo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 max-w-5xl">
        
        {/* Sacred Outer Rune Ring (Slow Clockwise Rotation) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
          className="absolute pointer-events-none w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] md:w-[680px] md:h-[680px] rounded-full border border-blue-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.12)]"
        >
          {NORSE_RUNES.map((rune, idx) => {
            const angle = (idx / NORSE_RUNES.length) * 2 * Math.PI;
            const radius = 245; // base radius
            return (
              <span
                key={idx}
                style={{
                  position: "absolute",
                  transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) rotate(${angle + Math.PI / 2}rad)`,
                }}
                className="text-xs sm:text-sm md:text-base font-serif text-blue-400/40 select-none transition-colors duration-500 hover:text-blue-200"
              >
                {rune}
              </span>
            );
          })}
        </motion.div>

        {/* Counter-Rotating Inner Geometric Rune Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="absolute pointer-events-none w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-dashed border-cyan-400/25"
        />

        {/* Concentric Pulsing Light Orbs */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none animate-pulse" />

        {/* Mythic Weapon Shadows / Entrances */}
        {/* Left: Leviathan Axe gliding in */}
        <motion.div
          initial={{ opacity: 0, x: -160, y: -40, rotate: -25, scale: 0.7 }}
          animate={{
            opacity: progress > 15 ? 0.85 : 0,
            x: progress > 15 ? -110 : -160,
            y: progress > 15 ? 0 : -40,
            rotate: -12,
            scale: progress > 50 ? 0.95 : 0.85,
          }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute hidden md:block left-[12%] lg:left-[18%] pointer-events-none drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]"
        >
          <Image
            src="/images/hex.png"
            alt="Leviathan Axe"
            width={170}
            height={170}
            className="object-contain filter brightness-110 contrast-125"
          />
        </motion.div>

        {/* Right: Mjölnir Hammer gliding in */}
        <motion.div
          initial={{ opacity: 0, x: 160, y: 40, rotate: 25, scale: 0.7 }}
          animate={{
            opacity: progress > 22 ? 0.85 : 0,
            x: progress > 22 ? 110 : 160,
            y: progress > 22 ? 0 : 40,
            rotate: 12,
            scale: progress > 50 ? 0.95 : 0.85,
          }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute hidden md:block right-[12%] lg:right-[18%] pointer-events-none drop-shadow-[0_0_35px_rgba(96,165,250,0.6)]"
        >
          <Image
            src="/images/hammer.png"
            alt="Mjölnir Hammer"
            width={170}
            height={170}
            className="object-contain filter brightness-110 contrast-125"
          />
        </motion.div>

        {/* Center: Cinematic Remastered CODE OF WAR Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 25 }}
          animate={{
            opacity: progress > 28 ? 1 : 0,
            scale: progress > 28 ? 1 : 0.75,
            y: progress > 28 ? 0 : 25,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 flex flex-col items-center justify-center text-center"
        >
          {/* Logo container with multi-layer glow */}
          <div className="relative group max-w-[280px] sm:max-w-[420px] md:max-w-[560px]">
            {/* Underlying Aura */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-cyan-400/20 to-blue-600/30 rounded-2xl blur-2xl opacity-75 animate-pulse pointer-events-none" />

            <Image
              src="/images/cow_cinematic.png"
              alt="Code of War"
              width={540}
              height={175}
              priority
              className="relative object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            />

            {/* Light Sheen Sweep Overlay */}
            <motion.div
              initial={{ x: "-120%" }}
              animate={{ x: progress > 45 ? "150%" : "-120%" }}
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />
          </div>

          {/* Subtitle / Battle Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: progress > 40 ? 1 : 0, y: progress > 40 ? 0 : 15 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
            <p className="font-mono text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.35em] text-blue-200/90 font-medium">
              WHERE WARRIORS FORGE ALGORITHMS
            </p>
            <span className="text-[10px] font-mono tracking-widest text-gray-500">
              SOLVE · CLASH · CONQUER
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. Bottom Cinematic Timeline & Progress Bar */}
      <div className="relative z-20 w-full max-w-4xl px-6 pb-8 sm:pb-12 flex flex-col items-center">
        {/* Status Line */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-gray-400 mb-3 px-1">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
            <span className="tracking-wider text-white font-medium text-[11px] sm:text-xs">
              {currentPhase.text}
            </span>
          </div>

          <div className="font-mono text-blue-400 text-xs sm:text-sm font-bold tracking-widest">
            {progress}%
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-1.5 sm:h-2 rounded-full bg-white/[0.07] overflow-hidden border border-white/10 shadow-inner">
          <motion.div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)] relative"
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
          </motion.div>
        </div>

        {/* Bottom Sub-info */}
        <div className="w-full mt-3 flex items-center justify-between text-[10px] font-mono text-gray-500 tracking-wider">
          <span>{currentPhase.sub}</span>
          <span className="hidden sm:inline text-gray-600">Norse Matchmaking Engine</span>
          <span>VALHALLA SECURED</span>
        </div>

        {/* Final CTA if 100% */}
        {progress >= 100 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleFinish}
            className="mt-5 px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:scale-105 transition-all"
          >
            ENTER THE ARENA →
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
