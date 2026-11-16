"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const MIN_VISIBLE_MS = 800;
const TRICKLE_CAP = 90;

export default function HexLoader({
  isLoading = true,
  progress = 0, 
  imageSrc = "/images/hex.png",
  label = "Preparing Your Arena",
  onFinish,
}) {
  const [display, setDisplay] = useState(0);
  const [exiting, setExiting] = useState(false);

  const startRef = useRef(Date.now());
  const realRef = useRef(0);
  realRef.current = Math.min(95, Math.max(0, progress));


  useEffect(() => {
    if (!isLoading) return;

    const id = setInterval(() => {
      setDisplay((prev) => {
        const base = Math.max(prev, realRef.current);
        if (base >= TRICKLE_CAP) return base;
        return Math.min(TRICKLE_CAP, base + (TRICKLE_CAP - base) * 0.05 + 0.1);
      });
    }, 150);

    return () => clearInterval(id);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    setDisplay(100);

    const elapsed = Date.now() - startRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(() => setExiting(true), wait + 450);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const value = Math.min(100, Math.max(0, display));
  const done = value >= 100;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-6"
      initial={{ opacity: 1, scale: 1 }}
      animate={exiting ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (exiting) onFinish?.();
      }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.18),transparent_70%)]" />

      <div className="relative w-full max-w-[460px]">
        {/* Label */}
        <div className="mb-14 text-center">
          <motion.p
            key={done ? "ready" : "loading"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] uppercase tracking-[0.35em] text-blue-400"
          >
            {done ? "Arena Ready" : label}
          </motion.p>
        </div>

        <div className="relative mx-[52px] h-[3px] rounded-full bg-white/10">
     
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.9)]"
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

         
          <motion.div
            className="absolute top-1/2 z-10"
            animate={{ left: `${value}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ x: "-50%", y: "-50%" }}
          >
       
            {!done && (
              <>
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200 shadow-[0_0_16px_6px_rgba(96,165,250,0.9)]" />

                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-blue-200 shadow-[0_0_8px_2px_rgba(59,130,246,0.9)]"
                    animate={{
                      x: [0, -22 - i * 9],
                      y: [0, (i % 2 === 0 ? -1 : 1) * (8 + i * 3)],
                      opacity: [1, 0],
                      scale: [1.3, 0.2],
                    }}
                    transition={{
                      duration: 0.55,
                      repeat: Infinity,
                      delay: i * 0.09,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}

        
            <motion.div
              animate={done ? { rotate: 0 } : { rotate: [-3, 3, -3] }}
              transition={{
                duration: 0.7,
                repeat: done ? 0 : Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={imageSrc}
                alt="Loading"
                draggable="false"
                className="
                  h-[105px]
                  w-[105px]
                  select-none
                  object-contain
                  drop-shadow-[0_0_14px_rgba(59,130,246,0.5)]
                  -scale-x-100
                  translate-x-5
                  -translate-y-4
                  -rotate-[98deg]
                "
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Percentage */}
        <div className="mt-14 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            Loading
          </span>
          <span className="font-mono text-sm tabular-nums text-blue-400">
            {Math.round(value)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
