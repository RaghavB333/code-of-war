"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export default function Protocols({ pillars = [], mono = "", SectionLabel, PillarCard }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const progressBarRef = useRef(null);

  useLayoutEffect(() => {
    if (reduce || typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      const getScrollAmount = () => {
        return -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.06);
      };

      // GSAP
      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 1.1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduce, pillars]);

  const intro = (
    <div className="w-[82vw] sm:w-[400px] shrink-0 pr-2 md:pr-6">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight">
            UNDER THE HOOD
            <br />
            <span className="text-blue-500">HOW CODE OF WAR WORKS</span>
        </h2>
      <p className="text-xs md:text-sm text-gray-400 mt-4 leading-relaxed">
        From creating a private playground to executing code and crowning the winner — every step is connected through a real-time coding battle system.
      </p>
      {!reduce && (
        <p className={`${mono} text-[10px] mt-8 flex items-center gap-2 font-mono uppercase tracking-widest`}>
          <span>Keep scrolling</span>
          <span className="inline-block animate-pulse">→</span>
        </p>
      )}
    </div>
  );

  if (reduce) {
    return (
      <section id="features" data-realm="alfheim" className="px-4 md:px-8 max-w-6xl mx-auto mt-24">
        {intro}
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {pillars.map((pl, i) => (
            <PillarCard key={pl.title || i} p={pl} i={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="features"
      data="protocols"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] text-white mt-32"
    >
    {SectionLabel && <SectionLabel n="05" name="Protocols of War" className={"max-w-7xl mx-auto"} />}
      <div className="flex h-full w-full items-center overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max items-center gap-5 md:gap-8 px-[6vw] will-change-transform"
        >
          {intro}
          {pillars.map((pl, i) => (
            <PillarCard key={pl.title || i} p={pl} i={i} pinned />
          ))}
          <div className="w-[6vw] shrink-0" />
        </div>
      </div>
    </section>
  );
}