"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserDataContext } from "@/context/UserContext";
import { LobbyDataContext } from "@/context/LobbyContext";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { motion } from "framer-motion";
import axios from "axios";

const customFont = localFont({
  src: "../public/fonts/GODOFWAR.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-custom",
});

const mono = "font-mono uppercase tracking-widest";

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

export default function Home() {
  const [showMore, setShowMore] = useState(false);
  const [gladiators, setGladiators] = useState([]);
  const handleLearnMore = () => setShowMore((v) => !v);

  const socketid = useRef(null);
  const { user } = useContext(UserDataContext);
  const { socket } = useContext(LobbyDataContext);
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard');
        setGladiators(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
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

  const fade = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white max-w-screen overflow-x-hidden">
      <main>
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="px-5 pt-10 md:pt-16 pb-8 flex flex-col items-center text-center"
        >
          

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            SHARPEN YOUR BLADES.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-blue-500">
              WRITE YOUR DESTINY.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm md:text-base text-gray-400">
            Revolutionizing Competitive Programming. Gamified DSA combat inspired by{" "}
            <span className={`${customFont.className} text-white`}>God of War</span> &amp; tactical esports like Valorant
            — party queues, head-to-head duels, and self-hosted Judge0 high-velocity code execution.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              <Link href="/Playground">
                ⚔ Enter the Arena →
              </Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              <Link href="/Dashboard">
                Summon a Party <span className="text-gray-500 text-xs ml-1">1v1 / 5v5</span>
              </Link>
            </motion.button>
          </div>

          <Link
            onClick={handleLearnMore}
            href="#"
            className="mt-5 text-sm text-gray-400 hover:text-white underline underline-offset-4 transition"
          >
            {showMore ? "Show Less" : "Learn More"}
          </Link>
        </motion.section>

        {/* ABOUT (toggle) */}
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
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

        {/* LIVE DUEL */}
        <motion.section {...fade} className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-[#0f0f10] overflow-hidden">
            <div className={`${mono} flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[10px] text-gray-400 border-b border-white/10 bg-black/40`}>
              <span><span className="text-red-500">● Live Duel</span> | Protocol: DSVP</span>
              <span className="hidden sm:inline">Node: Valhalla-Central-01</span>
              <span>⏱ 56:31.79 <span className="ml-2 bg-white/10 px-2 py-0.5 rounded">Graph Traversal</span></span>
            </div>

            <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[16/8]">
              <Image src="/cp.png" alt="Live duel arena" fill priority className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />

              {/* player cards */}
              <div className="absolute top-3 left-3 right-3 flex justify-between gap-2 text-left">
                {[
                  { n: "KRATOS_DEV", s: "1,488 MMR", l: "Lang: C++23 (GCC 13)", c: "border-red-500/50", code: "pq.push({d, src});" },
                  { n: "VIPER_SYNTAX", s: "3,215 MMR", l: "Lang: Rust 1.78", c: "border-cyan-400/50", code: "10/14 Test Cases", right: true },
                ].map((p) => (
                  <div key={p.n} className={`w-[48%] md:w-[30%] rounded-lg border ${p.c} bg-black/70 backdrop-blur p-2 md:p-3`}>
                    <div className="flex items-center justify-between text-[10px] md:text-xs font-bold">
                      <span>{p.n}</span>
                      <span className="text-gray-400">{p.s}</span>
                    </div>
                    <div className={`${mono} text-[8px] md:text-[10px] text-gray-400 mt-1`}>{p.l}</div>
                    <div className="hidden sm:block mt-2 font-mono text-[10px] text-green-300/80 truncate">
                      {p.code}
                    </div>
                  </div>
                ))}
              </div>

              {/* telemetry bar */}
              <div className={`${mono} absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] md:w-auto flex flex-wrap justify-center gap-x-4 gap-y-1 text-[8px] md:text-[10px] text-gray-300 bg-black/70 border border-white/10 rounded-full px-4 py-2`}>
                <span>Judge0 Telemetry: 11.2ms</span>
                <span>Memory: 4.8MB</span>
                <span>Spectators: 3,142</span>
              </div>
            </div>

            <div className={`${mono} flex flex-wrap justify-between gap-2 px-4 py-3 text-[9px] text-gray-500 border-t border-white/10`}>
              <span className="text-green-400">● Anti-Cheat Kernel v4.2 Active</span>
              <span>Deterministic Seed: #0426-8J7</span>
              <span>Time Limit: 3000ms · Stack Limit: 256MB · Sudden Death: Ready</span>
            </div>
          </div>
        </motion.section>

        {/* PARTY FORMATION */}
        <motion.section {...fade} className="px-4 md:px-8 max-w-6xl mx-auto mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className={`${mono} text-[10px] text-red-400`}>▣ Tactical Roster Array</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-1">VALHALLA PARTY FORMATION</h2>
            </div>
            <p className="max-w-sm text-xs md:text-sm text-gray-400">
              Assemble your 5-stack algorithmic strike team. Synchronize voice comms, strategize algorithm ban picks, and
              dominate global ranked brackets.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#0f0f10] p-4 md:p-6">
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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-5">
              {partyMembers.map((m) => (
                <motion.div
                  key={m.name}
                  whileHover={{ y: -4 }}
                  className={`rounded-lg border ${m.tone} bg-black/40 overflow-hidden`}
                >
                  <div className={`${mono} text-[9px] px-3 py-1.5 flex justify-between ${m.role === "CAPTAIN" ? "text-red-400" : "text-green-400"}`}>
                    <span>{m.role}</span>
                    <span>✓</span>
                  </div>
                  <div className="relative aspect-[4/5]">
                    <Image src={m.img} alt={m.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 border border-white/10 rounded px-1.5 py-0.5">
                      LVL {m.level}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-xs md:text-sm truncate">{m.name}</p>
                    <p className={`${mono} text-[8px] text-gray-500 mt-0.5`}>{m.rank}</p>
                    <p className={`${mono} text-[8px] text-gray-400 mt-2 border-t border-white/10 pt-2`}>
                      Specialty: {m.spec}
                    </p>
                  </div>
                </motion.div>
              ))}

              <div className="rounded-lg border border-dashed border-white/15 bg-black/20 flex flex-col items-center justify-center text-center p-4 col-span-2 md:col-span-1 min-h-[140px]">
                <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-xl text-gray-400">+</div>
                <p className="font-bold text-xs mt-3">SUMMON WARRIOR</p>
                <p className="text-[10px] text-gray-500">Click to copy party link</p>
                <span className={`${mono} text-[9px] text-gray-500 mt-2 border border-white/10 rounded px-2 py-0.5`}>Invite +1</span>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/10 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
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
              <Link href="/Playground" className="bg-red-500 hover:bg-red-600 font-semibold py-3 px-8 rounded-lg transition text-sm">
                ▶ Queue Competitive Duel
              </Link>
            </div>
          </div>
        </motion.section>

        {/* FEATURES */}
        <section id="features" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
          <motion.div {...fade} className="text-center">
            <p className={`${mono} text-[10px] text-gray-500`}>// Protocols of War</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-1">BATTLE-GRADE ARCHITECTURE</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-3 max-w-xl mx-auto">
              Engineered for zero-lag algorithmic warfare. Three tactical pillars power the global Code of War matchmaking
              network.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {pillars.map((p) => (
              <motion.div
                key={p.title}
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl border-t-2 ${p.border} border-x border-b border-x-white/10 border-b-white/10 bg-[#0f0f10] p-5 flex flex-col`}
              >
                <span className={`${mono} text-[9px] text-gray-500 self-end`}>{p.tag}</span>
                <h3 className={`text-lg font-bold mt-2 mb-3 ${p.color}`}>{p.title}</h3>
                <p className="text-xs md:text-sm text-gray-400 flex-1">{p.body}</p>
                <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5">
                  {p.stats.map(([k, v]) => (
                    <div key={k} className={`${mono} flex justify-between gap-3 text-[9px]`}>
                      <span className="text-gray-500">{k}:</span>
                      <span className="text-gray-300 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LEADERBOARD */}
        <motion.section {...fade} className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={`${mono} text-[10px] text-yellow-400`}>♛ Hall of Immortals</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-1">VALHALLA TOP GLADIATORS</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`${mono} text-[9px] text-gray-500 hidden sm:inline`}>Global Ranked Matchmaking MMR</span>
              <button className={`${mono} text-[10px] border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg px-4 py-2 transition`}>
                View All Rankings ↗
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#0f0f10] overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className={`${mono} text-[9px] text-gray-500 border-b border-white/10`}>
                  {["Rank", "Gladiator", "Tier Status", "Win Rate", "Streak", "Dominant Weapon", "Quick Duel"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gladiators.map((g) => (
                  <tr key={g.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition">
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
                            ? "bg-red-500 border-red-500 hover:bg-red-600"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        Challenge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* FINAL CTA */}
        <motion.section
          {...fade}
          id="contact"
          className="px-4 md:px-8 max-w-6xl mx-auto mt-24"
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/10 via-[#0f0f10] to-[#0f0f10] px-6 py-12 md:py-16 text-center">
            <p className={`${mono} text-[10px] text-red-400`}>⚔ Final Summons // Ragnarok Awaits</p>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2">READY FOR BATTLE?</h2>
            <p className="text-sm md:text-base text-gray-400 mt-4 max-w-2xl mx-auto">
              Connect with our algorithmic duelist friends in the War Rooms. Find 5-stack scrim parties,
              discuss Big-O optimization, and access the open Judge0 competitive API.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/Playground" className="bg-red-500 hover:bg-red-600 font-semibold py-3 px-8 rounded-lg transition text-sm">
                Claim Your Gladiator Tag
              </Link>
              <Link href="/Dashboard" className="bg-white/5 border border-white/10 hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition text-sm">
                Enter War Rooms
              </Link>
              <Link
                href="/contact"
                className="bg-white/5 border border-white/10 hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition text-sm"
              >
                Get in Touch
              </Link>
            </div>
            <div className={`${mono} mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[9px] text-gray-500`}>
              <span><span className="text-green-400">●</span> Instant Matchmaking</span>
              <span><span className="text-blue-400">●</span> Verified Judge0 Runtime</span>
              <span><span className="text-purple-400">●</span> Free for Competitive Coders</span>
            </div>
          </div>
        </motion.section>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/10 px-4 md:px-8 pt-10 pb-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center">
            <p className={`${customFont.className} text-lg`}>CODE OF WAR</p>
            <p className="text-xs text-gray-500 mt-2">
              Norse-tactical algorithm duels. Prove technical supremacy in 1v1 arenas forged in Spartan embers and
              Leviathan frost.
            </p>
          </div>
          
        </div>
        <div className={`${mono} max-w-6xl mx-auto mt-8 pt-4 border-t border-white/10 flex flex-wrap justify-between gap-2 text-[9px] text-gray-600`}>
          <span><span className="text-green-400">●</span> Global Matchmaking Queue Active · 4,892 Duelists Enlisted</span>
          <span>&copy; 2025 Code of War. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}