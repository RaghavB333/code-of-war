"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

// Screen width ke hisaab se weapon sizes + center touch positions
function getGeometry() {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
  const axeH = Math.min(380, vw * 0.44);   // axe ki length (rotate hone ke baad horizontal)
  const hammerH = axeH * 0.78;             // hammer thoda chhota
  const overlap = 6;                       // faces thoda dabke touch karein

  // Head image ke top edge se center tak ka distance (approx)
  const axeX = -(axeH * 0.48) + overlap;       // axe left side, head right ki taraf
  const hammerX = hammerH * 0.42 - overlap;    // hammer right side, head left ki taraf

  return {
    vw,
    axeH,
    hammerH,
    axeX,
    hammerX,
    axeStartX: -(vw / 2 + axeH),
    hammerStartX: vw / 2 + hammerH,
  };
}

export default function PageLoader({
  isLoading = true,
  imageSrc = "/images/hex.png",      // Leviathan Axe (LEFT se)
  hammerSrc = "/images/hammer.png",  // Mjolnir (RIGHT se)
  soundSrc = "/sounds/impact.mp3",
  onFinish,
}) {
  const [phase, setPhase] = useState("entering"); // "entering" | "collision"
  const [minTimeComplete, setMinTimeComplete] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [geo, setGeo] = useState(getGeometry);

  const hexControls = useAnimationControls();
  const hammerControls = useAnimationControls();
  const soundRef = useRef(null);

  // Resize pe size update
  useEffect(() => {
    const onResize = () => setGeo(getGeometry());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cinematic sequence
  useEffect(() => {
    let cancelled = false;
    const g = getGeometry();

    async function runAnimation() {
      // Dono ko screen ke bahar set karo (spin ke saath)
      hexControls.set({ x: g.axeStartX, y: 0, rotate: 90 - 720 });
      hammerControls.set({ x: g.hammerStartX, y: 0, rotate: -90 + 720 });

      // 1. Dono bahar se spin karte hue aate hain aur center me takrate hain
      //    (ease-in: speed badhti jaati hai, impact jaisa feel)
      await Promise.all([
        hexControls.start({
          x: g.axeX,
          rotate: 90,
          transition: { duration: 1.5, ease: [0.45, 0, 0.9, 0.55] },
        }),
        hammerControls.start({
          x: g.hammerX,
          rotate: -90,
          transition: { duration: 1.5, ease: [0.45, 0, 0.9, 0.55] },
        }),
      ]);

      if (cancelled) return;

      // 2. IMPACT
      setPhase("collision");

      try {
        if (soundRef.current) {
          soundRef.current.currentTime = 0;
          soundRef.current.volume = 0.7;
          soundRef.current.play().catch(() => {});
        }
      } catch {}

      // 3. Dono center me touch karke hilte rahenge (position nahi chhodte)
      hexControls.start({
        x: [g.axeX, g.axeX + 5, g.axeX - 2, g.axeX + 3, g.axeX],
        y: [0, -4, 3, -2, 0],
        rotate: [90, 92.5, 88.5, 91, 90],
        transition: { duration: 0.22, repeat: Infinity, ease: "easeInOut" },
      });

      hammerControls.start({
        x: [g.hammerX, g.hammerX - 5, g.hammerX + 2, g.hammerX - 3, g.hammerX],
        y: [0, 4, -3, 2, 0],
        rotate: [-90, -92.5, -88.5, -91, -90],
        transition: { duration: 0.22, repeat: Infinity, ease: "easeInOut" },
      });

      // 4. Minimum clash time
      await new Promise((r) => setTimeout(r, 2600));
      if (cancelled) return;
      setMinTimeComplete(true);
    }

    runAnimation();

    return () => {
      cancelled = true;
      hexControls.stop();
      hammerControls.stop();
    };
  }, [hexControls, hammerControls]);

  // Exit tabhi jab animation complete + data ready
  useEffect(() => {
    if (minTimeComplete && !isLoading && !exiting) setExiting(true);
  }, [minTimeComplete, isLoading, exiting]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => onFinish?.(), 900);
    return () => clearTimeout(timer);
  }, [exiting, onFinish]);

  const weaponBox = (h, w) => ({
    height: h,
    width: w,
    marginLeft: -w / 2,
    marginTop: -h / 2,
  });

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#0a0a0a]"
      initial={{ opacity: 1, scale: 1 }}
      animate={
        exiting
          ? { opacity: [1, 1, 0], scale: [1, 1.6, 3.5] } // zoom-in, phir page show
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.9, times: [0, 0.4, 1], ease: [0.7, 0, 0.3, 1] }}
    >
      {/* Impact ke baad poori screen halka shake */}
      <motion.div
        className="absolute inset-0"
        animate={
          phase === "collision"
            ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.3, repeat: phase === "collision" ? Infinity : 0 }}
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.2),transparent_70%)]" />

        {/* Shockwave ring */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/20 sm:h-[360px] sm:w-[360px]"
          animate={{
            scale: phase === "collision" ? [0.95, 1.25, 0.95] : [0.9, 1.05, 0.9],
            opacity: phase === "collision" ? [0.3, 0.8, 0.3] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: phase === "collision" ? 1.0 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Impact flash */}
        {phase === "collision" && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400"
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{
              opacity: [0, 1, 0.2, 0.7, 0.15],
              scale: [0.1, 2.2, 2.8, 2, 0.9],
            }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            style={{ filter: "blur(40px)" }}
          />
        )}

        {/* Axe — LEFT se */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-30"
          style={weaponBox(geo.axeH, geo.axeH * 0.58)}
          initial={{ x: -2000, rotate: -630 }}
          animate={hexControls}
        >
          <img
            src={imageSrc}
            alt="Leviathan Axe"
            draggable="false"
            className="h-full w-full select-none object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.85)]"
          />
        </motion.div>

        {/* Hammer — RIGHT se */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-30"
          style={weaponBox(geo.hammerH, geo.hammerH)}
          initial={{ x: 2000, rotate: 630 }}
          animate={hammerControls}
        >
          <img
            src={hammerSrc}
            alt="Mjolnir Hammer"
            draggable="false"
            className="h-full w-full select-none object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.85)]"
          />
        </motion.div>

        {/* Lightning — dono ke touch point (center) par */}
        {phase === "collision" && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-44 w-36 -translate-x-1/2 -translate-y-1/2 sm:h-56 sm:w-48">
            <svg viewBox="0 0 120 160" className="h-full w-full overflow-visible" fill="none">
              <defs>
                <filter id="clash-lightning-glow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {[0, 1, 2, 3].map((line) => (
                <motion.path
                  key={line}
                  d={
                    line === 0
                      ? "M60 0 L40 35 L75 52 L35 85 L68 110 L48 160"
                      : line === 1
                      ? "M60 0 L82 30 L50 60 L85 82 L52 120 L75 160"
                      : line === 2
                      ? "M60 0 L22 45 L60 68 L28 102 L60 132 L40 160"
                      : "M60 0 L70 38 L35 70 L78 95 L45 135 L60 160"
                  }
                  stroke={line % 2 === 1 ? "#ffffff" : "#60a5fa"}
                  strokeWidth={line % 2 === 1 ? 3 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#clash-lightning-glow)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0.2, 0.95, 0],
                    pathLength: [0.15, 1, 0.6, 1],
                  }}
                  transition={{
                    duration: 0.24 + line * 0.06,
                    repeat: Infinity,
                    repeatDelay: 0.04,
                    ease: "linear",
                    delay: line * 0.05,
                  }}
                />
              ))}
            </svg>
          </div>
        )}

        {/* Spark particles */}
        {phase === "collision" &&
          Array.from({ length: 12 }).map((_, index) => {
            const angle = (index / 12) * Math.PI * 2;
            return (
              <motion.div
                key={index}
                className="absolute left-1/2 top-1/2 z-20 h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_12px_4px_rgba(59,130,246,0.9)]"
                animate={{
                  x: [0, Math.cos(angle) * 80, Math.cos(angle) * 120],
                  y: [0, Math.sin(angle) * 80, Math.sin(angle) * 120],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.8, 0],
                }}
                transition={{
                  duration: 0.55,
                  repeat: Infinity,
                  delay: index * 0.07,
                  ease: "easeOut",
                }}
              />
            );
          })}

        {/* Status banner */}
        <div className="absolute bottom-[12%] left-0 right-0 z-50 text-center">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] uppercase tracking-[0.35em] text-blue-400 sm:text-xs"
          >
            {phase === "entering" ? "Preparing Your Arena" : "Clash of Code"}
          </motion.p>

          <div className="mx-auto mt-4 h-[2px] w-36 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full w-1/2 bg-blue-500 shadow-[0_0_12px_#3b82f6]"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>

      <audio ref={soundRef} src={soundSrc} preload="auto" />
    </motion.div>
  );
}