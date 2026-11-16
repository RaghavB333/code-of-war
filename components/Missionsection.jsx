"use client";

import { useEffect, useRef, useState } from "react";
import Vortex from "./Tornado"; // your 3D tornado (already recoloured by you)

/* ------------------------------ language logos ------------------------------ */
// Single-colour marks (from the open-source Devicon set); they take the text colour.

const LANGUAGES = [
  { name: "C++", d: "M63.443 0c-1.782 0-3.564.39-4.916 1.172L11.594 28.27C8.89 29.828 6.68 33.66 6.68 36.78v54.197c0 1.562.55 3.298 1.441 4.841l-.002.002c.89 1.543 2.123 2.89 3.475 3.672l46.931 27.094c2.703 1.562 7.13 1.562 9.832 0h.002l46.934-27.094c1.352-.78 2.582-2.129 3.473-3.672.89-1.543 1.441-3.28 1.441-4.843V36.779c0-1.557-.55-3.295-1.441-4.838v-.002c-.891-1.545-2.121-2.893-3.473-3.67L68.359 1.173C67.008.39 65.226 0 63.443 0zm.002 26.033c13.465 0 26.02 7.246 32.77 18.91l-16.38 9.479c-3.372-5.836-9.66-9.467-16.39-9.467-10.432 0-18.922 8.49-18.922 18.924S53.013 82.8 63.445 82.8c6.735 0 13.015-3.625 16.395-9.465l16.375 9.477c-6.746 11.662-19.305 18.91-32.77 18.91-20.867 0-37.843-16.977-37.843-37.844s16.976-37.844 37.843-37.844v-.002zM92.881 57.57h4.201v4.207h4.203v4.203h-4.203v4.207h-4.201V65.98h-4.207v-4.203h4.207V57.57zm15.765 0h4.208v4.207h4.203v4.203h-4.203v4.207h-4.208V65.98h-4.205v-4.203h4.205V57.57z" },
  { name: "Java", d: "M47.617 98.12c-19.192 5.362 11.677 16.439 36.115 5.969-4.003-1.556-6.874-3.351-6.874-3.351-10.897 2.06-15.952 2.222-25.844 1.092-8.164-.935-3.397-3.71-3.397-3.71zm33.189-10.46c-14.444 2.779-22.787 2.69-33.354 1.6-8.171-.845-2.822-4.805-2.822-4.805-21.137 7.016 11.767 14.977 41.309 6.336-3.14-1.106-5.133-3.131-5.133-3.131zm11.319-60.575c.001 0-42.731 10.669-22.323 34.187 6.024 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.793 15.634-29.58zm9.998 81.144s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.095.171-4.45-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.952-3.487-32.013 6.85-13.742 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM85 77.896c2.395-1.634 5.703-3.053 5.703-3.053s-9.424 1.685-18.813 2.474c-11.494.964-23.823 1.154-30.012.326-14.652-1.959 8.033-7.348 8.033-7.348s-8.812-.596-19.644 4.644C17.455 81.134 61.958 83.958 85 77.896zm5.609 15.145c-.108.29-.468.616-.468.616 31.273-8.221 19.775-28.979 4.822-23.725-1.312.464-2 1.543-2 1.543s.829-.334 2.678-.72c7.559-1.575 18.389 10.119-5.032 22.286zM64.181 70.069c-4.614-10.429-20.26-19.553.007-35.559C89.459 14.563 76.492 1.587 76.492 1.587c5.23 20.608-18.451 26.833-26.999 39.667-5.821 8.745 2.857 18.142 14.688 28.815zm27.274 51.748c-19.187 3.612-42.854 3.191-56.887.874 0 0 2.874 2.38 17.646 3.331 22.476 1.437 57-.8 57.816-11.436.001 0-1.57 4.032-18.575 7.231z" },
  { name: "Python", d: "M49.33 62h29.159C86.606 62 93 55.132 93 46.981V19.183c0-7.912-6.632-13.856-14.555-15.176-5.014-.835-10.195-1.215-15.187-1.191-4.99.023-9.612.448-13.805 1.191C37.098 6.188 35 10.758 35 19.183V30h29v4H23.776c-8.484 0-15.914 5.108-18.237 14.811-2.681 11.12-2.8 17.919 0 29.53C7.614 86.983 12.569 93 21.054 93H31V79.952C31 70.315 39.428 62 49.33 62zm-1.838-39.11c-3.026 0-5.478-2.479-5.478-5.545 0-3.079 2.451-5.581 5.478-5.581 3.015 0 5.479 2.502 5.479 5.581-.001 3.066-2.465 5.545-5.479 5.545zm74.789 25.921C120.183 40.363 116.178 34 107.682 34H97v12.981C97 57.031 88.206 65 78.489 65H49.33C41.342 65 35 72.326 35 80.326v27.8c0 7.91 6.745 12.564 14.462 14.834 9.242 2.717 17.994 3.208 29.051 0C85.862 120.831 93 116.549 93 108.126V97H64v-4h43.682c8.484 0 11.647-5.776 14.599-14.66 3.047-9.145 2.916-17.799 0-29.529zm-41.955 55.606c3.027 0 5.479 2.479 5.479 5.547 0 3.076-2.451 5.579-5.479 5.579-3.015 0-5.478-2.502-5.478-5.579 0-3.068 2.463-5.547 5.478-5.547z" },
  { name: "JavaScript", d: "M2 1v125h125V1H2zm66.119 106.513c-1.845 3.749-5.367 6.212-9.448 7.401-6.271 1.44-12.269.619-16.731-2.059-2.986-1.832-5.318-4.652-6.901-7.901l9.52-5.83c.083.035.333.487.667 1.071 1.214 2.034 2.261 3.474 4.319 4.485 2.022.69 6.461 1.131 8.175-2.427 1.047-1.81.714-7.628.714-14.065C58.433 78.073 58.48 68 58.48 58h11.709c0 11 .06 21.418 0 32.152.025 6.58.596 12.446-2.07 17.361zm48.574-3.308c-4.07 13.922-26.762 14.374-35.83 5.176-1.916-2.165-3.117-3.296-4.26-5.795 4.819-2.772 4.819-2.772 9.508-5.485 2.547 3.915 4.902 6.068 9.139 6.949 5.748.702 11.531-1.273 10.234-7.378-1.333-4.986-11.77-6.199-18.873-11.531-7.211-4.843-8.901-16.611-2.975-23.335 1.975-2.487 5.343-4.343 8.877-5.235l3.688-.477c7.081-.143 11.507 1.727 14.756 5.355.904.916 1.642 1.904 3.022 4.045-3.772 2.404-3.76 2.381-9.163 5.879-1.154-2.486-3.069-4.046-5.093-4.724-3.142-.952-7.104.083-7.926 3.403-.285 1.023-.226 1.975.227 3.665 1.273 2.903 5.545 4.165 9.377 5.926 11.031 4.474 14.756 9.271 15.672 14.981.882 4.916-.213 8.105-.38 8.581z" },
];

function LanguageLogo({ d }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 128 128" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* --------------------------------- helpers --------------------------------- */

// near: the section is on screen or about to be (the tornado only renders then, to save the GPU)
// seen: the section has been on screen at least once (plays the entrance animation once)
function useVisibility(ref) {
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const nearObserver = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "300px",
    });
    const seenObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          seenObserver.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    nearObserver.observe(element);
    seenObserver.observe(element);
    return () => {
      nearObserver.disconnect();
      seenObserver.disconnect();
    };
  }, [ref]);

  return { near, seen };
}

function FadeUp({ show, delay = 0, className = "", children }) {
  return (
    <div
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: show ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- section ---------------------------------- */

export default function MissionSection() {
  const sectionRef = useRef(null);
  const { seen } = useVisibility(sectionRef);

  return (
    <div
      ref={sectionRef}
      aria-labelledby="mission-heading"
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0A0A] text-white mt-20"
    >
      <style>{`
        @keyframes floor-ripple {
          from { transform: scale(0.05); opacity: 0.7; }
          to   { transform: scale(1.1);  opacity: 0; }
        }
        .floor-ripple { transform-box: fill-box; transform-origin: center; animation: floor-ripple 7.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .floor-ripple { animation: none; opacity: 0; } }
      `}</style>

      {/* ---- blue lighting ---- */}
      {/* top-left ambient glow */}
      <div className="pointer-events-none absolute left-0 top-0 z-50 h-[650px] w-[650px] bg-[radial-gradient(ellipse_at_top_left,rgba(49,130,206,0.28)_0%,transparent_65%)]" />
      {/* soft glow on the left edge */}
      <div className="pointer-events-none absolute -left-40 top-1/2 z-50 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 z-50 h-[200px] w-[420px] -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 z-50 h-[100px] w-[420px] -translate-y-1 rounded-full bg-blue-500/10 blur-3xl" />

      {/* ---- 3D tornado, anchored to the right ---- */}
      <div className="pointer-events-none absolute right-[-15%] top-0 z-[1] flex h-full w-full items-center justify-center opacity-60 sm:right-[-10%] md:right-[-5%] md:w-[65%] md:opacity-95 lg:-right-80 lg:w-[110%]">
        <Vortex />
      </div>

      {/* ---- soft dark vignette so the text stays crisp ---- */}
      <div className="pointer-events-none absolute inset-0 z-10 w-full bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent md:w-[60%]" />

      {/* ---- content ---- */}
      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 pb-12 pt-32 lg:px-12">
        <div className="max-w-2xl">
          <FadeUp show={seen}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#0a0a0a] px-3.5 py-1.5 text-xs font-medium text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0a0a0a] text-blue-300">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span>Our Mission &amp; Vision</span>
            </div>
          </FadeUp>

          <FadeUp show={seen} delay={100}>
            <h2
              id="mission-heading"
              className="mt-6 text-4xl font-normal leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.2rem]"
            >
              Learn by Solving
              <br />
              Grow by Competing
            </h2>
          </FadeUp>

          <FadeUp show={seen} delay={200}>
            <p className="mt-6 max-w-lg text-base font-normal leading-relaxed text-gray-300/80 sm:text-lg">
              Code Of War is built on a simple idea: the best way to master programming is to practise every day, and
              to do it together.
            </p>
          </FadeUp>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <FadeUp show={seen} delay={300}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors duration-300 hover:border-blue-400/30 hover:bg-white/[0.07]">
                <div className="mb-3 flex items-center gap-2.5 text-blue-300">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                  </svg>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Mission</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-300/85">
                  To make competitive programming accessible and social: real problems, instant feedback and friends
                  to race against, wherever they are in the world.
                </p>
              </article>
            </FadeUp>

            <FadeUp show={seen} delay={400}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors duration-300 hover:border-blue-400/30 hover:bg-white/[0.07]">
                <div className="mb-3 flex items-center gap-2.5 text-blue-300">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Vision</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-300/85">
                  A global arena where every developer sharpens their skills, builds a daily habit and grows with a
                  community that pushes them further.
                </p>
              </article>
            </FadeUp>
          </div>
        </div>

        {/* ---- languages your code runs in ---- */}
        <FadeUp show={seen} delay={600} className="mt-14 border-t border-white/5 pt-8">
          <p className="mb-6 text-xs font-medium tracking-wide text-gray-400/80">Your code runs in</p>
          <ul className="flex flex-wrap items-center gap-8 opacity-80 sm:gap-12">
            {LANGUAGES.map((language) => (
              <li
                key={language.name}
                className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white/90 transition-colors hover:text-white"
              >
                <span className="text-blue-300">
                  <LanguageLogo d={language.d} />
                </span>
                <span>{language.name}</span>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </div>
  );
}