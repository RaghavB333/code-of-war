"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserDataContext } from "@/context/UserContext";
import { LobbyDataContext } from "@/context/LobbyContext";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import axios from "axios";
import ExecutionFlowGSAP from "@/components/ExecutionFlowGSAP";
import MultiplayerEarthSection from "@/components/multiplayer/MultiplayerEarthSection";
import Protocols from "@/components/Protocols";
import FAQSection from "@/components/FAQSection";
import MissionSection from "@/components/Missionsection";
import Logo from "@/lib/Logo";
import ContactSection from "@/components/ContactSection";

const mono = "font-mono uppercase tracking-widest";
const ease = [0.22, 1, 0.36, 1];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const heroLines = [
  ["MASTER", "YOUR", "SKILLS"],
  ["CONQUER", "THE", "ARENA"],
];

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
      <span className="text-blue-300">{n} /</span>
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
        className="w-full h-full text-blue-400"
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
          className="w-9 h-9 -ml-[18px] -mt-[18px] rounded-full border border-blue-300 bg-[color-mix(in_srgb,blue-300_8%,transparent)]"
        />
      </motion.div>
      <motion.div style={{ x, y }} className="fixed top-0 left-0 z-[300] pointer-events-none">
        <div className="w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-blue-300" />
      </motion.div>
    </>
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

const pillars = [
  {
    id: "party",
    icon: "Users",
    tag: "01 / PLAYGROUND",
    title: "Party Creation & Lobby Management",
    color: "text-green-400",
    border: "border-green-400/60",
    body: "Create a private coding arena, configure match settings, invite friends, and bring everyone together in a shared playground. Players join the lobby before the host starts the battle.",
    stats: [
      ["Lobby Settings", "Players · Duration · Difficulty"],
      ["Invitations", "Invite Friends"],
      ["Live Updates", "Socket.IO"],
    ],
  },
  {
    id: "problems",
    icon: "Layers",
    tag: "02 / CHALLENGE SETUP",
    title: "Problem Management & Match Setup",
    color: "text-purple-400",
    border: "border-purple-400/60",
    body: "Every battle starts with a configured set of coding challenges. Problems include descriptions, examples, constraints, and test cases, giving every participant a common challenge to solve.",
    stats: [
      ["Problem Selection", "Difficulty Based"],
      ["Challenge Data", "Examples & Constraints"],
      ["Match Setup", "Fixed Problem Set"],
    ],
  },
  {
    id: "editor",
    icon: "Code2",
    tag: "03 / CODING ENVIRONMENT",
    title: "Multi-Language Code Editor",
    color: "text-blue-400",
    border: "border-blue-400/60",
    body: "Participants write and edit solutions in an interactive Monaco Editor. They can choose from the programming languages configured for the platform and work on their own solutions during the battle.",
    stats: [
      ["Code Editor", "Monaco Editor"],
      ["Language Support", "C++ · Python · Java · JavaScript*"],
      ["Problem Context", "Description · Examples · Limits"],
    ],
  },
  {
    id: "execution",
    icon: "Cpu",
    tag: "04 / EXECUTION ENGINE",
    title: "Judge0-Powered Code Execution",
    color: "text-yellow-400",
    border: "border-yellow-400/60",
    body: "When a player runs or submits code, the backend sends it to the Judge0 execution engine. Run checks the example test cases, while Submit evaluates the solution against the complete test suite.",
    stats: [
      ["Execution Engine", "Judge0"],
      ["Run", "Example Test Cases"],
      ["Submit", "All Configured Test Cases"],
    ],
  },
  {
    id: "scoring",
    icon: "Activity",
    tag: "05 / RESULT & SCORING",
    title: "Test Validation & Live Leaderboard",
    color: "text-pink-400",
    border: "border-pink-400/60",
    body: "The execution result is evaluated and feedback is returned to the player. Successful solutions update the player's score, while Socket.IO events keep the playground leaderboard synchronized for participants.",
    stats: [
      ["Result Feedback", "Accepted · Wrong Answer · Errors"],
      ["Score Updates", "Validated Submissions"],
      ["Live Communication", "Socket.IO Events"],
    ],
  },
  {
    id: "winner",
    icon: "Trophy",
    tag: "06 / BATTLE RESULTS",
    title: "Winner Declaration & Ranking",
    color: "text-orange-400",
    border: "border-orange-400/60",
    body: "When the battle ends, the final scores are compared to determine the winner. If players are tied, the platform uses the last solved time and wrong attempts as tie-breakers before finalizing the results.",
    stats: [
      ["Winner", "Highest Final Score"],
      ["Tie-Breakers", "Last Solved · Wrong Attempts"],
      ["Progression", "Competitive Rankings"],
    ],
  },
];


/* ================================================================== */
/* Cards                                                               */
/* ================================================================== */


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
      <span className={`${mono} text-[10px] text-gray-500`}>Pillar 0{i + 1} / 06</span>
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


/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function Home() {
  const [mapOpen, setMapOpen] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = mapOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mapOpen]);

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


  const editorFeatures = [
  {
    title: "The editor behind VS Code",
    text: "Syntax highlighting, auto-indent and bracket matching, powered by Monaco.",
  },
  {
    title: "Four languages",
    text: "C++, Java, Python and JavaScript, each with starter code ready to go.",
  },
  {
    title: "Autosave",
    text: "Your code is saved as you type and restored when you come back.",
  },
  {
    title: "Made your way",
    text: "Pick the font, theme and tab size, resize the panels and use keyboard shortcuts.",
  },
];

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="mt-0.5 h-5 w-5 shrink-0 text-blue-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10" cy="10" r="8.25" className="opacity-40" />
    <path d="M6.5 10.2l2.4 2.4 4.6-5" />
  </svg>
);

  return (
    <div
      className="realm-root min-h-screen bg-[#0a0a0a] text-white max-w-screen overflow-x-hidden"
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
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] bg-blue-500"
      />
      <main>
        {/* HERO */}

      <section
          ref={heroRef}
          data-realm="hero"
          className="relative min-h-screen overflow-hidden flex flex-col justify-center"
        >
          {/* 0.0s – background glow blooms from the centre */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.2, ease }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_25%,color-mix(in_srgb,#3182ce_20%,transparent),transparent_60%)]"
          />

          {/* 0.2s – a soft light beam sweeps across the hero once */}
          {/* {!reduce && (
            <motion.div
              initial={{ x: "-30vw", opacity: 0 }}
              animate={{ x: "130vw", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
              className="absolute top-0 bottom-0 left-0 w-[28vw] pointer-events-none bg-gradient-to-r from-transparent via-blue-400/10 to-transparent skew-x-[-18deg]"
            />
          )} */}

          {/* 0.2s – rune ring spins in and fades up */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.7, rotate: reduce ? 0 : -40 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 2.6, ease, delay: 0.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <RuneRing />
          </motion.div>

          {/* 0.5s – embers fade in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Embers color={"#3182ce"} count={300} />
          </motion.div>

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative flex flex-col items-center justify-center text-center px-5 py-20 min-h-screen"
          >
            {/* 0.5s → 2.4s – headline, word by word, rising out of a mask with a blur-to-sharp focus */}
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight">
              {heroLines.map((line, li) => (
                <span
                  key={li}
                  className={`block ${li === 1 ? "text-blue-400" : ""}`}
                >
                  {line.map((word, wi) => (
                    <span
                      key={wi}
                      className={`inline-block overflow-hidden align-bottom pb-1 ${
                        wi < line.length - 1 ? "mr-[0.25em]" : ""
                      }`}
                    >
                      <motion.span
                        initial={{
                          y: reduce ? 0 : "115%",
                          opacity: 0,
                          // filter: "blur(10px)",
                        }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{
                          duration: 1.1,
                          ease,
                          delay: 0.5 + li * 0.5 + wi * 0.12,
                        }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            {/* 2.0s → 3.3s – paragraph, then buttons pop in */}
            <Stagger
              onLoad
              delay={2}
              stagger={0.3}
              className="flex flex-col items-center"
            >
              <Item
                as="p"
                className="mt-6 max-w-2xl text-sm md:text-lg leading-relaxed text-gray-400"
              >
                Sharpen your coding skills, challenge your friends
                in real-time battles, and rise through the ranks.
                Your code is your weapon. Victory is your destiny.
              </Item>

              <Item dir="scale" className="mt-9 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/party"
                    className="block bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3.5 px-9 rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  >
                    Enter the Arena →
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/problems"
                    className="block bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3.5 px-9 rounded-lg transition-all"
                  >
                    Explore Problems
                  </Link>
                </motion.div>
              </Item>
            </Stagger>

            {/* 3.6s – scroll indicator arrives last */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{
                opacity: { delay: 3.6, duration: 0.8 },
                y: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 3.6 },
              }}
              className="absolute bottom-7 flex flex-col items-center gap-2 text-gray-500"
            >
              <span className="text-[10px] tracking-[0.3em] uppercase">
                Scroll to explore
              </span>
              <span className="text-xl text-blue-400">↓</span>
            </motion.div>
          </motion.div>
        </section>


        {/* CODE EDITOR */}     
        <section
          data="Code Editor"
          className="px-4 md:px-8 max-w-7xl mx-auto mt-24 md:mt-32"
        >
          <SectionLabel n="02" name="Code Editor" className="mb-8" />

          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 mt-12">

            {/* ------------------------------ copy ------------------------------ */}
            <div className="lg:col-span-5">

              <Reveal
                as="h2"
                dir="up"
                className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight"
              >
                Write, Run and Submit in
                <span className="text-blue-400"> one focused workspace</span>
              </Reveal>

              <Reveal
                as="p"
                dir="up"
                delay={0.1}
                className="mt-5 text-base leading-relaxed text-gray-400 md:text-lg"
              >
                Experience a powerful coding workspace right in your browser.
                Explore problem descriptions, write and execute your solutions,
                and submit your code to get instant results — all in one place.
              </Reveal>

              <ul className="mt-8 grid gap-6 sm:grid-cols-2">
                {editorFeatures.map((feature, i) => (
                  <Reveal
                    as="li"
                    key={feature.title}
                    dir="up"
                    delay={0.15 + i * 0.08}
                    className="flex gap-3"
                  >
                    <CheckIcon />

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-sm leading-relaxed text-gray-400">
                        {feature.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>

            {/* ---------------------------- screenshot ---------------------------- */}
            <Reveal
              dir="right"
              delay={0.2}
              className="relative isolate lg:col-span-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-5 -z-10 rounded-3xl bg-blue-500/10 blur-3xl"
              />

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f0f10] shadow-2xl shadow-black/50">

                <Image
                  src="/images/editor-preview1.png"
                  alt="Code of War coding workspace featuring problem description, code editor and test results"
                  width={1916}
                  height={352}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="block h-auto w-full object-contain"
                />

              </div>
            </Reveal>

          </div>
        </section>

        {/* How Code runs */}
        <section
          data="Execution Flow"
          className="px-4 md:px-0 mx-auto mt-28 md:mt-32"
        >
          <SectionLabel n="03" name="Execution Flow" className="max-w-7xl mx-auto" />
        <ExecutionFlowGSAP/>
        </section>

        {/* Multiplayer Section */}
        <section
          data="multiplayer"
          className="px-4 md:px-8 max-w-8xl mx-auto mt-24 md:mt-32"
        >
          <SectionLabel n="04" name="Multiplayer Network" className="mb-8 max-w-7xl mx-auto" />
          <MultiplayerEarthSection />
        </section>

        {/* PROTOCOLS: pinned horizontal scroll */}
        <Protocols pillars={pillars} mono={mono} SectionLabel={SectionLabel} PillarCard={PillarCard}/>

        <section
          data="Mission & Vision"
          className="mx-auto mt-24 md:mt-20"
        >
          <SectionLabel n="06" name="Mission & Vision" className="max-w-7xl mx-auto" />
          <MissionSection/>
        </section>

        {/* FAQ */}
        <section
          data="FAQ"
          className="px-4 md:px-8 max-w-8xl mx-auto mt-24 md:mt-20"
        >
          <SectionLabel n="07" name="FAQ" className="max-w-7xl mx-auto" />
        <FAQSection/>
        </section>

        {/* Contact Us */}
        <section
          data="Contact Us"
          className="px-4 md:px-8 max-w-8xl mx-auto mt-24 md:mt-20"
        >
          <SectionLabel n="08" name="Contact Us" className="max-w-7xl mx-auto" />
        <ContactSection/>
        </section>


      </main>

      {/* FOOTER */}

      <footer className="relative mt-24 border-t border-white/[0.08] px-5 md:px-8 pt-14 pb-8 overflow-hidden">

        <div className="relative max-w-6xl mx-auto">

          {/* Main Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-14">

            {/* Brand */}
            <Reveal dir="up" className="lg:col-span-2">
              <Logo/>

              <p className={`${mono} mt-5 max-w-sm text-[11px] md:text-xs leading-7 text-gray-500`}>
                A competitive coding platform built for developers.
                Solve problems, sharpen your skills, and challenge
                your friends in real-time coding battles.
              </p>

              <a
                href="/party"
                className={`${mono} group mt-7 inline-flex items-center gap-3 text-[10px] tracking-[0.15em] uppercase text-blue-400 hover:text-blue-300 transition-colors`}
              >
                Enter the Arena
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>

            {/* Explore */}
            <Reveal dir="up" delay={0.1}>
              <h3 className={`${mono} mb-6 text-[10px] tracking-[0.22em] uppercase text-gray-300`}>
                Explore
              </h3>

              <div className="flex flex-col items-start gap-4">
                {[
                  { label: "Home", href: "/" },
                  { label: "Multiplayer", href: "/party" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`${mono} text-[11px] text-gray-500 hover:text-blue-400 transition-colors duration-300`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </Reveal>

            {/* Account */}
            <Reveal dir="up" delay={0.2}>
              <h3 className={`${mono} mb-6 text-[10px] tracking-[0.22em] uppercase text-gray-300`}>
                Links
              </h3>

              <div className="flex flex-col items-start gap-4">
                <a
                  href="/problems"
                  className={`${mono} text-[11px] text-gray-500 hover:text-blue-400 transition-colors duration-300`}
                >
                  Problems
                </a>

                <a
                  href="/contact"
                  className={`${mono} text-[11px] text-gray-500 hover:text-blue-400 transition-colors duration-300`}
                >
                  Contact Us
                </a>
              </div>
            </Reveal>

          </div>

          {/* Bottom Bar */}
          <div
            className="border-t border-white/[0.08] pt-6 flex flex-col md:flex-row items-center justify-between gap-5"
          >
            <p className={`${mono} text-[9px] tracking-wider text-gray-600 text-center md:text-left`}>
              © {new Date().getFullYear()} CODE OF WAR. ALL RIGHTS RESERVED.
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
              <span className={`${mono} text-[9px] tracking-[0.16em] uppercase text-gray-600`}>
                Built for the love of code
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}


