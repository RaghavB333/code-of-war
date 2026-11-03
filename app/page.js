"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserDataContext } from "@/context/UserContext";
import { LobbyDataContext } from "@/context/LobbyContext";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import {
  motion,
  animate,
  AnimatePresence,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import axios from "axios";

const customFont = localFont({
  src: "../public/fonts/GODOFWAR.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-custom",
});

const mono = "font-mono uppercase tracking-widest";
const ease = [0.22, 1, 0.36, 1];

/* ================================================================== */
/* THE NINE REALMS (navigation + theming)                              */
/* ================================================================== */

const realms = [
  { id: "midgard", name: "Midgard", role: "The Homeland", desc: "Return to the front gates and the start of your journey.", href: "/", accent: "#ef4444", fg: "#ffffff", rune: "ᛗ" },
  { id: "muspelheim", name: "Muspelheim", role: "The Arena", desc: "Trial by fire. Enter the Playground and duel.", href: "/Playground", accent: "#ff6a2b", fg: "#0a0a0a", rune: "ᚠ" },
  { id: "asgard", name: "Asgard", role: "The War Room", desc: "Your dashboard: party, submissions and battle history.", href: "/Dashboard", accent: "#f5c542", fg: "#0a0a0a", rune: "ᚨ" },
  { id: "alfheim", name: "Alfheim", role: "The Protocols", desc: "Study the architecture that powers every battle.", href: "#features", accent: "#2dd4bf", fg: "#0a0a0a", rune: "ᛉ" },
  { id: "helheim", name: "Helheim", role: "Hall of Immortals", desc: "Where the top gladiators are carved in stone.", href: "#leaderboard", accent: "#a78bfa", fg: "#0a0a0a", rune: "ᚺ" },
  { id: "svartalfheim", name: "Svartalfheim", role: "The Forge", desc: "Send a raven to the forgemasters. Get in touch.", href: "/contact", accent: "#ec4899", fg: "#ffffff", rune: "ᛞ" },
  { id: "niflheim", name: "Niflheim", role: "Realm of Ice", desc: "Sealed. This path opens in a future season.", href: null, accent: "#7dd3fc", fg: "#0a0a0a", rune: "ᚾ", locked: true },
  { id: "jotunheim", name: "Jotunheim", role: "Land of Giants", desc: "Sealed. This path opens in a future season.", href: null, accent: "#94a3b8", fg: "#0a0a0a", rune: "ᛃ", locked: true },
  { id: "vanaheim", name: "Vanaheim", role: "Realm of the Vanir", desc: "Sealed. This path opens in a future season.", href: null, accent: "#86efac", fg: "#0a0a0a", rune: "ᚹ", locked: true },
];
const realmById = Object.fromEntries(realms.map((r) => [r.id, r]));

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/* ================================================================== */
/* Scroll animation helpers                                            */
/* ================================================================== */

const offsets = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: -80 },
  right: { x: 80 },
  scale: { scale: 0.88, y: 30 },
};

const itemVariants = {
  hidden: (from) => ({ opacity: 0, ...from }),
  visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.8, ease } },
};

function Reveal({ dir = "up", delay = 0, className = "", children, as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  const from = reduce ? {} : offsets[dir];
  return (
    <M
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.8, ease, delay }}
      className={className}
      {...rest}
    >
      {children}
    </M>
  );
}

function Stagger({ stagger = 0.12, delay = 0, onLoad = false, className = "", children, as = "div", ...rest }) {
  const M = motion[as];
  const variants = { hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } };
  const trigger = onLoad
    ? { animate: "visible" }
    : { whileInView: "visible", viewport: { once: true, amount: 0.15, margin: "0px 0px -60px 0px" } };
  return (
    <M initial="hidden" variants={variants} className={className} {...trigger} {...rest}>
      {children}
    </M>
  );
}

function Item({ dir = "up", className = "", children, as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M custom={reduce ? {} : offsets[dir]} variants={itemVariants} className={className} {...rest}>
      {children}
    </M>
  );
}

function CountUp({ to, duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, ease, onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString("en-US")}</span>;
}

function MaskLine({ children, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        initial={{ y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease, delay }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* "01 / Section name ———" label with a line that draws itself */
function SectionLabel({ n, name, className = "" }) {
  return (
    <Reveal dir="up" className={`flex items-center gap-3 ${mono} text-[10px] ${className}`}>
      <span className="text-[var(--accent)]">{n} /</span>
      <span className="text-gray-400 whitespace-nowrap">{name}</span>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease, delay: 0.2 }}
        className="h-px flex-1 origin-left bg-white/10"
      />
    </Reveal>
  );
}

/* ================================================================== */
/* Visual effects                                                      */
/* ================================================================== */

/* Floating embers on a canvas, tinted with the current realm colour */
function Embers({ color, count = 55 }) {
  const ref = useRef(null);
  const colorRef = useRef(color);
  const reduce = useReducedMotion();

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf;
    const parts = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (init) => ({
      x: Math.random() * w,
      y: init ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.25 + Math.random() * 0.8,
      ph: Math.random() * 6.28,
      sp: 0.01 + Math.random() * 0.02,
      a: 0.3 + Math.random() * 0.6,
    });

    resize();
    for (let i = 0; i < count; i++) parts.push(spawn(true));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = hexToRgb(colorRef.current);
      for (const p of parts) {
        p.y -= p.vy;
        p.ph += p.sp;
        p.x += Math.sin(p.ph) * 0.4;
        if (p.y < -10) Object.assign(p, spawn(false));
        const fade = Math.max(0, Math.min(1, p.y / (h * 0.6)));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a * fade})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce, count]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* Slowly rotating ring of Elder Futhark runes */
function RuneRing() {
  const reduce = useReducedMotion();
  const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(120vw,820px)] aspect-square pointer-events-none opacity-[0.14]">
      <motion.svg
        viewBox="0 0 600 600"
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: 140, ease: "linear", repeat: Infinity }}
        className="w-full h-full text-[var(--accent)]"
      >
        <defs>
          <path id="rune-path" d="M300,300 m-250,0 a250,250 0 1,1 500,0 a250,250 0 1,1 -500,0" />
        </defs>
        <circle cx="300" cy="300" r="292" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="300" cy="300" r="205" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" />
        <text fill="currentColor" fontSize="26">
          <textPath href="#rune-path" textLength="1560" lengthAdjust="spacing">
            {runes + runes}
          </textPath>
        </text>
      </motion.svg>
    </div>
  );
}

/* Cursor ring that follows the mouse (desktop / fine pointers only) */
function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [big, setBig] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 450, damping: 38, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 450, damping: 38, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setBig(!!e.target.closest?.("a,button,[data-cursor]"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div style={{ x: sx, y: sy }} className="fixed top-0 left-0 z-[300] pointer-events-none">
        <motion.div
          animate={{ scale: big ? 1.7 : 1 }}
          transition={{ duration: 0.25 }}
          className="w-9 h-9 -ml-[18px] -mt-[18px] rounded-full border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
        />
      </motion.div>
      <motion.div style={{ x, y }} className="fixed top-0 left-0 z-[300] pointer-events-none">
        <div className="w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[var(--accent)]" />
      </motion.div>
    </>
  );
}

/* Infinite scrolling ticker (artcraft-style) */
function Marquee({ items, reverse = false, duration = 40, className = "" }) {
  const reduce = useReducedMotion();
  const row = (k) => (
    <div key={k} className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={k > 0}>
      {items.map((t) => (
        <span key={t} className="flex items-center gap-8">
          {t}
          <span className="text-[var(--accent)]">ᛟ</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="flex w-max"
        animate={reduce ? {} : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {row(0)}
        {row(1)}
      </motion.div>
    </div>
  );
}

/* 3D tilt + moving light for cards */
function useTilt(max = 8) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 22 });
  const sry = useSpring(ry, { stiffness: 220, damping: 22 });
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const glow = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, rgba(255,255,255,0.09), transparent 70%)`;

  const onMouseMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 2 * max);
    rx.set(-(py - 0.5) * 2 * max);
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onMouseLeave = () => {
    rx.set(0);
    ry.set(0);
    mx.set(-400);
    my.set(-400);
  };
  return {
    props: { style: { rotateX: srx, rotateY: sry, transformPerspective: 900 }, onMouseMove, onMouseLeave },
    glow,
  };
}

/* ================================================================== */
/* Data                                                                */
/* ================================================================== */

const partyMembers = [
  { role: "CAPTAIN", name: "KRATOS_DEV", level: 84, rank: "Aesir Grandmaster", spec: "Graphs / C++", img: "/cp.png", tone: "border-red-500/60" },
  { role: "READY", name: "VIPER_SYNTAX", level: 72, rank: "Einherjar Master", spec: "DP / Python", img: "/cp2.webp", tone: "border-white/10" },
  { role: "READY", name: "JETT_CODER", level: 65, rank: "Valkyrie Elite", spec: "Strings / Rust", img: "/cp3.jpeg", tone: "border-white/10" },
  { role: "READY", name: "RUNIC_HACKER", level: 58, rank: "Jarl Champion", spec: "Trees / Java", img: "/cp.png", tone: "border-white/10" },
];

const pillars = [
  {
    tag: "< 15ms exec",
    title: "Judge0 Telemetry & Execution Engine",
    color: "text-green-400",
    border: "border-green-400/60",
    body: "Instant multi-language compiling across C++, Rust, Python, Java and JavaScript. Sandboxed with hardened micro-kernels, automated Big-O profiling, and visual runtime footprint heatmaps.",
    stats: [["Kernel Sandbox", "Hardened gVisor"], ["Execution Latency", "11.8ms avg"], ["Complexity Profiler", "Active AST Parser"]],
  },
  {
    tag: "custom lobbies",
    title: "War Playground & Custom Tournaments",
    color: "text-purple-400",
    border: "border-purple-400/60",
    body: "Create high-stakes private arenas. Wager rating points, draft algorithm ban picks, implement custom edge case sabotage, and host real-time spectator areas with caster overlays.",
    stats: [["Pick & Ban Phase", "Tactical Briefing"], ["Spectator Broadcast", "Ultra-Low Lag WebRTC"], ["Wager Matches", "Rank Points MMR"]],
  },
  {
    tag: "ranked tiers",
    title: "Gamified Progression: Valhalla Tiers",
    color: "text-pink-400",
    border: "border-pink-400/60",
    body: "Ascend from humble Thrall (Bronze) up to Valkyrie, Einherjar, Aesir Grandmaster, and legendary God of War. Unlock mythical Leviathan Frost and Spartan Fire code editor syntax themes, victory animations, and runic nameplate titles.",
    stats: [["Top Rank Title", "God of War (Top 0.01%)"], ["Cosmetic Rewards", "IDE Themes & Runes"], ["Season Circuit", "90-Day Seasons"]],
  },
];

const duelPlayers = [
  { n: "KRATOS_DEV", s: "1,488 MMR", l: "Lang: C++23 (GCC 13)", c: "border-red-500/50", code: "pq.push({d, src});", dir: "left" },
  { n: "VIPER_SYNTAX", s: "3,215 MMR", l: "Lang: Rust 1.78", c: "border-cyan-400/50", code: "10/14 Test Cases", dir: "right" },
];

const tickerA = ["SELF-HOSTED JUDGE0", "PARTY SYSTEM", "CYCLOMATIC ANALYSIS", "1V1 SPEED DSA", "5V5 CLAN WAR", "BOSS RAID", "LIVE LEADERBOARDS", "C++", "PYTHON", "JAVA", "JAVASCRIPT"];
const tickerB = ["MIDGARD", "MUSPELHEIM", "ASGARD", "ALFHEIM", "HELHEIM", "SVARTALFHEIM", "NIFLHEIM", "JOTUNHEIM", "VANAHEIM"];

const oaths = [
  { l: "A", t: "Self-hosted Judge0", d: "Every submission runs on our own Judge0 engine: fast, sandboxed and under our control." },
  { l: "B", t: "Free for competitive coders", d: "Sharpen your skills and duel your friends without a toll at the gates." },
  { l: "C", t: "Verified runtime", d: "Verdicts come from real execution, with complexity analysis attached to every run." },
];

/* ================================================================== */
/* Cards                                                               */
/* ================================================================== */

function PartyCard({ m }) {
  const { props, glow } = useTilt(9);
  return (
    <Item
      dir="up"
      whileHover={{ y: -6 }}
      {...props}
      className={`relative rounded-lg border ${m.tone} bg-black/40 overflow-hidden`}
    >
      <div className={`${mono} text-[9px] px-3 py-1.5 flex justify-between ${m.role === "CAPTAIN" ? "text-red-400" : "text-green-400"}`}>
        <span>{m.role}</span>
        <span>✓</span>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.div whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} className="absolute inset-0">
          <Image src={m.img} alt={m.name} fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 border border-white/10 rounded px-1.5 py-0.5">
          LVL {m.level}
        </span>
      </div>
      <div className="p-3">
        <p className="font-bold text-xs md:text-sm truncate">{m.name}</p>
        <p className={`${mono} text-[8px] text-gray-500 mt-0.5`}>{m.rank}</p>
        <p className={`${mono} text-[8px] text-gray-400 mt-2 border-t border-white/10 pt-2`}>Specialty: {m.spec}</p>
      </div>
      <motion.div style={{ background: glow }} className="absolute inset-0 pointer-events-none z-10" />
    </Item>
  );
}

function PillarCard({ p, i, pinned }) {
  const { props, glow } = useTilt(6);
  return (
    <motion.div
      {...props}
      className={`relative shrink-0 ${
        pinned ? "w-[82vw] sm:w-[440px] h-[min(72vh,580px)]" : "w-full"
      } rounded-2xl border-t-2 ${p.border} border-x border-b border-x-white/10 border-b-white/10 bg-[#0f0f10] p-6 md:p-8 flex flex-col overflow-hidden`}
    >
      <motion.div style={{ background: glow }} className="absolute inset-0 pointer-events-none" />
      <span className="absolute -right-2 -top-6 text-[9rem] md:text-[11rem] font-extrabold text-white/[0.04] leading-none select-none">
        0{i + 1}
      </span>
      <span className={`${mono} text-[10px] text-gray-500`}>Pillar 0{i + 1} / 03</span>
      <span className={`${mono} text-[9px] text-gray-500 mt-1`}>{p.tag}</span>
      <h3 className={`relative text-xl md:text-2xl font-bold mt-6 mb-4 ${p.color}`}>{p.title}</h3>
      <p className="relative text-xs md:text-sm text-gray-400 flex-1">{p.body}</p>
      <div className="relative mt-6 pt-4 border-t border-white/10 space-y-1.5">
        {p.stats.map(([k, v]) => (
          <div key={k} className={`${mono} flex justify-between gap-3 text-[9px]`}>
            <span className="text-gray-500">{k}:</span>
            <span className="text-gray-300 text-right">{v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* Pinned section: vertical scroll drives a horizontal track of cards */
function Protocols() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(p, [0, 1], [0, -dist]);

  useEffect(() => {
    const measure = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const t = setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const intro = (
    <div className="w-[82vw] sm:w-[400px] shrink-0 pr-2 md:pr-6">
      <SectionLabel n="03" name="Protocols of War" />
      <h2 className="text-3xl md:text-5xl font-extrabold mt-5 leading-tight">BATTLE-GRADE ARCHITECTURE</h2>
      <p className="text-xs md:text-sm text-gray-400 mt-4">
        Engineered for zero-lag algorithmic warfare. Three tactical pillars power the global Code of War matchmaking
        network.
      </p>
      {!reduce && (
        <motion.p
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className={`${mono} text-[10px] text-[var(--accent)] mt-8`}
        >
          Keep scrolling →
        </motion.p>
      )}
    </div>
  );

  if (reduce) {
    return (
      <section id="features" data-realm="alfheim" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
        {intro}
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {pillars.map((pl, i) => (
            <PillarCard key={pl.title} p={pl} i={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="features"
      data-realm="alfheim"
      ref={ref}
      style={{ height: `calc(100vh + ${dist}px)` }}
      className="relative mt-24"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <motion.div ref={track} style={{ x }} className="flex w-max items-center gap-5 md:gap-8 px-[6vw]">
          {intro}
          {pillars.map((pl, i) => (
            <PillarCard key={pl.title} p={pl} i={i} pinned />
          ))}
          <div className="w-[6vw] shrink-0" />
        </motion.div>
        <div className="absolute bottom-6 inset-x-6 md:inset-x-16 h-px bg-white/10">
          <motion.div style={{ scaleX: p }} className="h-full origin-left bg-[var(--accent)]" />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Realm selector overlay                                              */
/* ================================================================== */

function RealmMap({ open, onClose, onTravel, onPreview, currentId, accent }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="realm-map"
          role="dialog"
          aria-modal="true"
          aria-label="Realm selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[150] bg-[#050505]/95 backdrop-blur-md overflow-y-auto"
        >
          <div className="fixed inset-0 pointer-events-none">
            <Embers color={accent} count={45} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_60%)]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-5 py-8 md:py-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`${mono} text-[10px] text-[var(--accent)]`}>ᛉ Yggdrasil · Bifrost Gate</p>
                <h2 className={`${customFont.className} text-3xl md:text-5xl mt-2`}>CHOOSE YOUR REALM</h2>
                <p className="text-xs md:text-sm text-gray-400 mt-2">
                  Nine realms. Six are open. Press <kbd className="px-1.5 py-0.5 rounded border border-white/20 text-[10px]">Esc</kbd> to return.
                </p>
              </div>
              <button
                autoFocus
                onClick={onClose}
                aria-label="Close realm selector"
                className="shrink-0 w-10 h-10 rounded-full border border-white/20 hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
              >
                ✕
              </button>
            </div>

            <Stagger onLoad stagger={0.06} delay={0.15} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {realms.map((r) => (
                <Item
                  as="button"
                  dir="up"
                  key={r.id}
                  disabled={r.locked}
                  onClick={() => onTravel(r)}
                  onMouseEnter={() => !r.locked && onPreview(r.id)}
                  onMouseLeave={() => onPreview(null)}
                  onFocus={() => !r.locked && onPreview(r.id)}
                  onBlur={() => onPreview(null)}
                  whileHover={r.locked ? undefined : { y: -4 }}
                  style={{ "--c": r.accent }}
                  className="group relative text-left rounded-xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden transition-colors hover:border-[var(--c)] focus-visible:border-[var(--c)] outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 group-focus-visible:opacity-20 transition-opacity bg-[radial-gradient(circle_at_50%_130%,var(--c),transparent_65%)]" />
                  <div className="relative flex items-start justify-between">
                    <span className="text-4xl leading-none" style={{ color: r.accent }}>
                      {r.rune}
                    </span>
                    <span className={`${mono} text-[9px] text-gray-400`}>
                      {r.locked ? "Sealed" : currentId === r.id ? "● You are here" : "Travel →"}
                    </span>
                  </div>
                  <h3 className={`${customFont.className} relative text-2xl mt-5`}>{r.name}</h3>
                  <p className={`${mono} relative text-[10px] mt-1`} style={{ color: r.accent }}>
                    {r.role}
                  </p>
                  <p className="relative text-xs text-gray-400 mt-3">{r.desc}</p>
                </Item>
              ))}
            </Stagger>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function Home() {
  const [showMore, setShowMore] = useState(false);
  const [gladiators, setGladiators] = useState([]);
  const handleLearnMore = () => setShowMore((v) => !v);

  // realm state: which realm the viewport is in, hover preview, map + warp overlays
  const [realmId, setRealmId] = useState("midgard");
  const [preview, setPreview] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [warp, setWarp] = useState(null);
  const activeRealm = realmById[preview || realmId];

  const socketid = useRef(null);
  const { user } = useContext(UserDataContext);
  const { socket } = useContext(LobbyDataContext);
  const router = useRouter();

  const reduce = useReducedMotion();

  /* ---- scroll-linked effects ---- */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroP, [0, 1], [0, reduce ? 0 : 90]);
  const heroOpacity = useTransform(heroP, [0, 0.9], [1, 0]);

  const duelRef = useRef(null);
  const { scrollYProgress: duelP } = useScroll({ target: duelRef, offset: ["start end", "end start"] });
  const duelImgY = useTransform(duelP, [0, 1], reduce ? ["0%", "0%"] : ["-9%", "9%"]);
  const duelImgScale = useTransform(duelP, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.15, 1.05, 1.15]);

  /* ---- the page changes realm (and colour) as you scroll through it ---- */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setRealmId(e.target.dataset.realm);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    document.querySelectorAll("[data-realm]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---- keyboard: R toggles the realm map, Esc closes it ---- */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable) return;
      if (e.key === "Escape") setMapOpen(false);
      else if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey && !e.altKey) setMapOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mapOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mapOpen]);

  /* ---- Bifrost travel: rainbow wipe, then route / scroll ---- */
  const travel = (r) => {
    if (r.locked) return;
    setMapOpen(false);
    setPreview(null);
    setWarp(r);
    setTimeout(() => {
      if (r.href.startsWith("#")) {
        document.querySelector(r.href)?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => setWarp(null), 350);
      } else if (r.href === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setWarp(null), 350);
      } else {
        router.push(r.href);
        setTimeout(() => setWarp(null), 3000); // safety net if navigation is slow
      }
    }, 750);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("/api/leaderboard");
        setGladiators(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, []);

  const storesocketid = async () => {
    const email = user.email;
    const data = { socketid: socketid.current, email: email };
    const response = await axios.post("/api/storesocketid", data);
    console.log(response.data);
  };

  useEffect(() => {
    if (user && user.email && socketid.current != null) {
      storesocketid();
    }
  }, [user && user.email]);

  useEffect(() => {
    if (socket != null) {
      const registerUser = () => {
        if (user && user.email) {
          socket.emit("register-user", { email: user.email });
        }
      };

      socket.on("connect", () => {
        socketid.current = socket.id;
        registerUser();
      });

      socket.on("reconnect", () => {
        registerUser();
      });

      return () => {
        socket.off("connect");
        socket.off("reconnect");
      };
    }
  }, [user, socket]);

  return (
    <div
      className="realm-root min-h-screen bg-[#0a0a0a] text-white max-w-screen overflow-x-hidden"
      style={{ "--accent": activeRealm.accent, "--accent-fg": activeRealm.fg }}
    >
      {/* lets the realm colour cross-fade smoothly */}
      <style>{`
        @property --accent { syntax: '<color>'; inherits: true; initial-value: #ef4444; }
        @property --accent-fg { syntax: '<color>'; inherits: true; initial-value: #ffffff; }
        .realm-root { transition: --accent .9s ease, --accent-fg .9s ease; }
      `}</style>

      <Cursor />

      {/* scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] bg-gradient-to-r from-[var(--accent)] via-pink-500 to-blue-500"
      />

      {/* floating realm button */}
      <div className="fixed bottom-5 inset-x-0 z-[90] flex justify-center pointer-events-none">
        <motion.button
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8, ease }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMapOpen(true)}
          aria-label="Open realm selector"
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-black/70 backdrop-blur-md pl-2 pr-4 py-2 shadow-[0_0_30px_-8px_var(--accent)] hover:border-[var(--accent)] transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-lg">
            {activeRealm.rune}
          </span>
          <span className="text-left leading-tight">
            <span className={`${mono} block text-[8px] text-gray-500`}>Realm</span>
            <span className={`${customFont.className} block text-sm`}>{realmById[realmId].name}</span>
          </span>
          <kbd className="hidden md:inline text-[10px] text-gray-400 border border-white/20 rounded px-1.5 py-0.5 ml-1">R</kbd>
        </motion.button>
      </div>

      <RealmMap
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onTravel={travel}
        onPreview={setPreview}
        currentId={realmId}
        accent={activeRealm.accent}
      />

      {/* Bifrost warp */}
      <AnimatePresence>
        {warp && (
          <motion.div
            key="warp"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[200] bg-[linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#8b5cf6)]"
          >
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center px-6">
              <p className={`${mono} text-[10px] text-gray-400`}>Crossing the Bifrost</p>
              <h2 className={`${customFont.className} text-4xl md:text-7xl mt-3`} style={{ color: warp.accent }}>
                {warp.name}
              </h2>
              <p className={`${mono} text-[10px] text-gray-400 mt-3`}>{warp.role}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* HERO */}
        <section ref={heroRef} data-realm="midgard" className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_25%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_60%)]" />
          <RuneRing />
          <Embers color={activeRealm.accent} />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative px-5 pt-14 md:pt-24 pb-14 md:pb-20 flex flex-col items-center text-center"
          >
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight">
              <MaskLine>SHARPEN YOUR BLADES.</MaskLine>
              <MaskLine delay={0.15}>
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, var(--accent), #ec4899, #3b82f6)" }}
                >
                  WRITE YOUR DESTINY.
                </span>
              </MaskLine>
            </h1>

            <Stagger onLoad delay={0.5} stagger={0.12} className="flex flex-col items-center">
              <Item as="p" className="mt-5 max-w-2xl text-sm md:text-base text-gray-400">
                Revolutionizing Competitive Programming. Gamified DSA combat inspired by{" "}
                <span className={`${customFont.className} text-white`}>God of War</span> &amp; tactical esports like
                Valorant — party queues, head-to-head duels, and self-hosted Judge0 high-velocity code execution.
              </Item>

              <Item className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/Playground"
                    className="block bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 font-semibold py-3 px-8 rounded-lg transition"
                  >
                    ⚔ Enter the Arena →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/Dashboard"
                    className="block bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition"
                  >
                    Summon a Party <span className="text-gray-500 text-xs ml-1">1v1 / 5v5</span>
                  </Link>
                </motion.div>
              </Item>

              <Item className="flex items-center gap-5">
                <Link
                  onClick={handleLearnMore}
                  href="#"
                  className="inline-block mt-5 text-sm text-gray-400 hover:text-white underline underline-offset-4 transition"
                >
                  {showMore ? "Show Less" : "Learn More"}
                </Link>
                <button
                  onClick={() => setMapOpen(true)}
                  className={`${mono} mt-5 text-[10px] text-gray-500 hover:text-[var(--accent)] transition`}
                >
                  ᛉ Open realm map
                </button>
              </Item>
            </Stagger>
          </motion.div>
        </section>

        {/* ABOUT (toggle) */}
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="px-6 lg:px-20 py-10"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="tracking-tight font-semibold from-[#6FEE8D] to-[#17c964] text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b">
                About <span className={customFont.className}>CODE OF WAR</span>
              </h2>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6 lg:p-10 mt-6 text-left">
                <p className="text-lg text-gray-100 mb-6">
                  <span className="font-bold text-green-50">Code of War</span> is a cutting-edge competitive programming
                  platform crafted for developers, learners, and problem solvers. With real-time code execution via
                  self-hosted Judge0, cyclomatic analysis, and a playground to compete with friends, it is built to give a
                  whole new meaning to competitive programming, just like you are playing an online competitive game.
                </p>
                <h3 className="text-2xl font-bold text-purple-400 mb-3">Our Mission</h3>
                <p className="text-lg text-gray-100 mb-6">
                  We aim to provide a developer-first experience that balances learning with fun and competition like a
                  game. Whether you&rsquo;re preparing for FAANG interviews, brushing up your DSA, or just love solving
                  problems — this is your battlefield.
                </p>
                <h3 className="text-2xl font-bold text-yellow-300 mb-3">Who Is It For?</h3>
                <p className="text-lg text-gray-100">
                  From absolute beginners to seasoned engineers, Code of War provides tools, structure, and thrill for
                  every coder. Ready to join the fight? Let the war begin.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TICKER */}
        <div className="border-y border-white/10 py-5 md:py-6 -rotate-[0.6deg] bg-black/40">
          <Marquee
            items={tickerA}
            duration={45}
            className={`${customFont.className} text-3xl md:text-5xl text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]`}
          />
          <Marquee
            items={tickerB}
            reverse
            duration={55}
            className={`${mono} mt-3 text-[10px] md:text-xs text-gray-500`}
          />
        </div>

        {/* LIVE DUEL */}
        <Reveal dir="scale" as="section" data-realm="muspelheim" className="px-4 md:px-8 max-w-6xl mx-auto mt-20">
          <SectionLabel n="01" name="Live Arena" className="mb-5" />
          <div ref={duelRef} className="rounded-xl border border-white/10 bg-[#0f0f10] overflow-hidden">
            <div className={`${mono} flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[10px] text-gray-400 border-b border-white/10 bg-black/40`}>
              <span>
                <motion.span
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-red-500"
                >
                  ● Live Duel
                </motion.span>{" "}
                | Protocol: DSVP
              </span>
              <span className="hidden sm:inline">Node: Valhalla-Central-01</span>
              <span>⏱ 56:31.79 <span className="ml-2 bg-white/10 px-2 py-0.5 rounded">Graph Traversal</span></span>
            </div>

            <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[16/8] overflow-hidden">
              <motion.div style={{ y: duelImgY, scale: duelImgScale }} className="absolute inset-[-10%]">
                <Image src="/cp.png" alt="Live duel arena" fill priority className="object-cover opacity-80" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />

              <div className="absolute top-3 left-3 right-3 flex justify-between gap-2 text-left">
                {duelPlayers.map((p, i) => (
                  <Reveal
                    key={p.n}
                    dir={p.dir}
                    delay={0.3 + i * 0.15}
                    className={`w-[48%] md:w-[30%] rounded-lg border ${p.c} bg-black/70 backdrop-blur p-2 md:p-3`}
                  >
                    <div className="flex items-center justify-between text-[10px] md:text-xs font-bold">
                      <span>{p.n}</span>
                      <span className="text-gray-400">{p.s}</span>
                    </div>
                    <div className={`${mono} text-[8px] md:text-[10px] text-gray-400 mt-1`}>{p.l}</div>
                    <div className="hidden sm:block mt-2 font-mono text-[10px] text-green-300/80 truncate">{p.code}</div>
                  </Reveal>
                ))}
              </div>

              <div className="absolute bottom-3 inset-x-0 flex justify-center px-2">
                <Reveal
                  dir="up"
                  delay={0.6}
                  className={`${mono} w-[92%] md:w-auto flex flex-wrap justify-center gap-x-4 gap-y-1 text-[8px] md:text-[10px] text-gray-300 bg-black/70 border border-white/10 rounded-full px-4 py-2`}
                >
                  <span>Judge0 Telemetry: 11.2ms</span>
                  <span>Memory: 4.8MB</span>
                  <span>Spectators: <CountUp to={3142} /></span>
                </Reveal>
              </div>
            </div>

            <div className={`${mono} flex flex-wrap justify-between gap-2 px-4 py-3 text-[9px] text-gray-500 border-t border-white/10`}>
              <span className="text-green-400">● Anti-Cheat Kernel v4.2 Active</span>
              <span>Deterministic Seed: #0426-8J7</span>
              <span>Time Limit: 3000ms · Stack Limit: 256MB · Sudden Death: Ready</span>
            </div>
          </div>
        </Reveal>

        {/* PARTY FORMATION */}
        <section data-realm="asgard" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
          <SectionLabel n="02" name="Tactical Roster Array" />
          <div className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <Reveal dir="left">
              <h2 className="text-3xl md:text-5xl font-extrabold">VALHALLA PARTY FORMATION</h2>
            </Reveal>
            <Reveal dir="right" delay={0.15} as="p" className="max-w-sm text-xs md:text-sm text-gray-400">
              Assemble your 5-stack algorithmic strike team. Synchronize voice comms, strategize algorithm ban picks, and
              dominate global ranked brackets.
            </Reveal>
          </div>

          <Reveal dir="up" delay={0.1} className="mt-6 rounded-xl border border-white/10 bg-[#0f0f10] p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className={`${mono} text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 rounded px-2 py-1`}>
                  Party Leader
                </span>
                <span className="font-bold text-sm">TEAM VALKYRIE PRIME</span>
                <span className="text-xs text-gray-500">[NA-West / Lane]</span>
              </div>
              <div className={`${mono} text-[10px] text-gray-400`}>
                <span className="text-green-400">●</span> Voice: Connected (4/5) · Party: 4 / 5 Slots
              </div>
            </div>

            <Stagger stagger={0.14} className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-5">
              {partyMembers.map((m) => (
                <PartyCard key={m.name} m={m} />
              ))}

              <Item
                dir="scale"
                className="rounded-lg border border-dashed border-white/15 bg-black/20 flex flex-col items-center justify-center text-center p-4 col-span-2 md:col-span-1 min-h-[140px]"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-xl text-gray-400"
                >
                  +
                </motion.div>
                <p className="font-bold text-xs mt-3">SUMMON WARRIOR</p>
                <p className="text-[10px] text-gray-500">Click to copy party link</p>
                <span className={`${mono} text-[9px] text-gray-500 mt-2 border border-white/10 rounded px-2 py-0.5`}>Invite +1</span>
              </Item>
            </Stagger>

            <Reveal
              dir="up"
              delay={0.2}
              className="mt-5 pt-5 border-t border-white/10 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between"
            >
              <div className="flex flex-wrap gap-2">
                {["1v1 Speed DSA", "5v5 Clan War", "Boss Raid (Hard DP)"].map((m, i) => (
                  <button
                    key={m}
                    className={`${mono} text-[10px] rounded-lg px-4 py-2 border transition ${
                      i === 0
                        ? "border-green-400/50 bg-green-400/10 text-green-300"
                        : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/Playground"
                  className="block text-center bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 font-semibold py-3 px-8 rounded-lg transition text-sm"
                >
                  ▶ Queue Competitive Duel
                </Link>
              </motion.div>
            </Reveal>
          </Reveal>
        </section>

        {/* PROTOCOLS: pinned horizontal scroll */}
        <Protocols />

        {/* LEADERBOARD */}
        <section id="leaderboard" data-realm="helheim" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
          <SectionLabel n="04" name="Hall of Immortals" />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <Reveal dir="left">
              <h2 className="text-3xl md:text-5xl font-extrabold">VALHALLA TOP GLADIATORS</h2>
            </Reveal>
            <Reveal dir="right" delay={0.1} className="flex items-center gap-3">
              <span className={`${mono} text-[9px] text-gray-500 hidden sm:inline`}>Global Ranked Matchmaking MMR</span>
              <button className={`${mono} text-[10px] border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg px-4 py-2 transition`}>
                View All Rankings ↗
              </button>
            </Reveal>
          </div>

          <Reveal dir="up" delay={0.1} className="mt-6 rounded-xl border border-white/10 bg-[#0f0f10] overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className={`${mono} text-[9px] text-gray-500 border-b border-white/10`}>
                  {["Rank", "Gladiator", "Tier Status", "Win Rate", "Streak", "Dominant Weapon", "Quick Duel"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <Stagger as="tbody" stagger={0.12} delay={0.2}>
                {gladiators.map((g) => (
                  <Item
                    as="tr"
                    dir="left"
                    key={g.name}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition"
                  >
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold bg-white/10 rounded px-2 py-1">{g.rank}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-md bg-green-400/20 text-green-300 text-[10px] font-bold flex items-center justify-center">
                          {g.init}
                        </span>
                        <div>
                          <p className="text-xs font-bold">{g.name}</p>
                          <p className="text-[10px] text-gray-500">{g.clan}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${mono} px-4 py-4 text-[9px] text-gray-300`}>{g.tier}</td>
                    <td className="px-4 py-4 text-sm font-bold text-green-400">{g.win}</td>
                    <td className={`${mono} px-4 py-4 text-[9px] text-red-400`}>{g.streak}</td>
                    <td className="px-4 py-4 text-xs text-gray-300 font-mono">{g.weapon}</td>
                    <td className="px-4 py-4">
                      <button
                        className={`${mono} text-[9px] rounded px-3 py-1.5 border transition ${
                          g.hot
                            ? "bg-[var(--accent)] text-[var(--accent-fg)] border-transparent hover:brightness-110"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        Challenge
                      </button>
                    </td>
                  </Item>
                ))}
              </Stagger>
            </table>
          </Reveal>
        </section>

        {/* OATHS */}
        <section data-realm="midgard" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
          <SectionLabel n="05" name="Oaths of the Warrior" />
          <Reveal as="h2" dir="up" className="text-3xl md:text-5xl font-extrabold mt-5 max-w-3xl">
            Forged for the fight.
          </Reveal>
          <Stagger stagger={0.15} className="grid md:grid-cols-3 gap-px mt-10 rounded-2xl overflow-hidden border border-white/10 bg-white/10">
            {oaths.map((o) => (
              <Item key={o.l} dir="up" className="bg-[#0a0a0a] p-6 md:p-8 group">
                <span
                  className={`${customFont.className} text-7xl md:text-8xl leading-none text-transparent transition-all duration-500 [-webkit-text-stroke:1px_var(--accent)] group-hover:text-[var(--accent)]`}
                >
                  {o.l}
                </span>
                <h3 className="text-lg font-bold mt-6">{o.t}</h3>
                <p className="text-xs md:text-sm text-gray-400 mt-2">{o.d}</p>
              </Item>
            ))}
          </Stagger>
        </section>

        {/* FINAL CTA */}
        <Reveal dir="scale" id="contact" as="section" data-realm="svartalfheim" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_14%,transparent)] via-[#0f0f10] to-[#0f0f10] px-6 py-12 md:py-20 text-center">
            <Embers color={activeRealm.accent} count={30} />
            <Stagger stagger={0.12} delay={0.15} className="relative flex flex-col items-center">
              <Item as="p" className={`${mono} text-[10px] text-[var(--accent)]`}>⚔ Final Summons // Ragnarok Awaits</Item>
              <Item as="h2" className="text-3xl md:text-6xl font-extrabold mt-2">READY FOR BATTLE?</Item>
              <Item as="p" className="text-sm md:text-base text-gray-400 mt-4 max-w-2xl">
                Connect with our algorithmic duelist friends in the War Rooms. Find 5-stack scrim parties,
                discuss Big-O optimization, and access the open Judge0 competitive API.
              </Item>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Item dir="left">
                  <Link href="/Playground" className="block bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 font-semibold py-3 px-8 rounded-lg transition text-sm">
                    Claim Your Gladiator Tag
                  </Link>
                </Item>
                <Item dir="up">
                  <Link href="/Dashboard" className="block bg-white/5 border border-white/10 hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition text-sm">
                    Enter War Rooms
                  </Link>
                </Item>
                <Item dir="right">
                  <Link href="/contact" className="block bg-white/5 border border-white/10 hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition text-sm">
                    Get in Touch
                  </Link>
                </Item>
              </div>
              <Item className={`${mono} mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[9px] text-gray-500`}>
                <span><span className="text-green-400">●</span> Instant Matchmaking</span>
                <span><span className="text-blue-400">●</span> Verified Judge0 Runtime</span>
                <span><span className="text-purple-400">●</span> Free for Competitive Coders</span>
              </Item>
            </Stagger>
          </div>
        </Reveal>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/10 px-4 md:px-8 pt-10 pb-24">
        <Reveal dir="up" className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <p className={`${customFont.className} text-lg`}>CODE OF WAR</p>
          <p className="text-xs text-gray-500 mt-2 max-w-md">
            Norse-tactical algorithm duels. Prove technical supremacy in 1v1 arenas forged in Spartan embers and
            Leviathan frost.
          </p>
          <button
            onClick={() => setMapOpen(true)}
            className={`${mono} mt-5 text-[10px] text-gray-400 hover:text-[var(--accent)] border border-white/10 rounded-full px-4 py-2 transition`}
          >
            ᛉ Travel the nine realms
          </button>
        </Reveal>
        <Reveal
          dir="up"
          delay={0.15}
          className={`${mono} max-w-6xl mx-auto mt-8 pt-4 border-t border-white/10 flex flex-wrap justify-between gap-2 text-[9px] text-gray-600`}
        >
          <span>
            <span className="text-green-400">●</span> Global Matchmaking Queue Active · <CountUp to={4892} /> Duelists Enlisted
          </span>
          <span>&copy; 2025 Code of War. All rights reserved.</span>
        </Reveal>
      </footer>
    </div>
  );
}