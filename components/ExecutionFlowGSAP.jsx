"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const defaultSteps = [
  {
    title: "Wrap",
    tag: "STATION 01",
    desc: "Your function is placed inside the problem's input and output harness, so you only write the solution.",
  },
  {
    title: "Sandbox",
    tag: "STATION 02",
    desc: "It is compiled and run in an isolated sandbox with strict CPU time and memory limits.",
  },
  {
    title: "Compare",
    tag: "STATION 03",
    desc: "The output of every test case is checked against the expected answer.",
  },
  {
    title: "Verdict",
    tag: "STATION 04",
    desc: "You get Accepted, Wrong Answer, Compilation or Runtime Error, or Time or Memory Limit Exceeded, along with runtime and memory.",
  },
];

export default function ExecutionFlowGSAP({ executionSteps = defaultSteps }) {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const steps = executionSteps?.length >= 4 ? executionSteps : defaultSteps;

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // setupLine
      const setupLine = (id, defaultLen) => {
        const line = document.getElementById(id);
        if (!line) return defaultLen;
        const len = line.getTotalLength ? line.getTotalLength() : defaultLen;
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        return len;
      };

      setupLine("beam-1", 1900);
      setupLine("beam-2", 1400);
      setupLine("beam-3", 1800);

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // camera positions for each step
      const cam1X = vw * 0.35 - 275;
      const cam1Y = vh * 0.5 - 450;

      const cam2X = vw * 0.5 - 2625;
      const cam2Y = cam1Y;

      const cam3X = cam2X;
      const cam3Y = vh * 0.5 - 2150;

      const cam4X = vw * 0.5 - 4875;
      const cam4Y = cam3Y;

      gsap.set(worldRef.current, { x: cam1X, y: cam1Y });

      // master timeline for the entire scroll animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=6000",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // PHASE 1: Step 1 -> Step 2 blue-500 solid line right
      tl.to("#beam-1", { strokeDashoffset: 0, ease: "none", duration: 3 }, 0)
        .to(worldRef.current, { x: cam2X, y: cam2Y, ease: "none", duration: 3 }, 0)
        .to(
          "#gsap-card-2",
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
          },
          2.8
        );

      // PHASE 2: Step 2 -> Step 3 blue-500 solid line down
      tl.to("#beam-2", { strokeDashoffset: 0, ease: "none", duration: 3 }, 3.5)
        .to(worldRef.current, { x: cam3X, y: cam3Y, ease: "none", duration: 3 }, 3.5)
        .to(
          "#gsap-card-3",
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
          },
          6.3
        );

      // PHASE 3: Step 3 -> Step 4 blue-500 solid line right
      tl.to("#beam-3", { strokeDashoffset: 0, ease: "none", duration: 3 }, 7.0)
        .to(worldRef.current, { x: cam4X, y: cam4Y, ease: "none", duration: 3 }, 7.0)
        .to(
          "#gsap-card-4",
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
          },
          9.8
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden text-white mt-12"
    >

      <div
        className="pointer-events-none absolute -inset-[2000px] opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(rgba(59, 130, 246, 0.50) 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(255, 255, 255, 0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.09) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px, 80px 80px, 80px 80px",
        }}
      />

      {/* Top HUD Bar */}
      <div className="max-w-7xl mx-auto md:px-6 pt-8">
        <div className="pointer-events-none flex items-center gap-3">
          <h3 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight">
            How your code <span className="text-blue-500">Runs</span>
          </h3>
        </div>
      </div>

      <div
        ref={worldRef}
        className="pointer-events-auto absolute left-20 md:left-0 top-0 h-[3500px] max-w-7xl"
      >
        <svg
          className="pointer-events-none absolute -left-24 md:left-0 top-0 h-[3500px] w-[6000px]"
          style={{ width: "6000px", height: "3500px" }}
        >
         
          <line
            id="beam-1"
            x1="450"
            y1="412"
            x2="2500"
            y2="410"
            stroke="#3B82F6"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <line
            id="beam-2"
            x1="2625"
            y1="520"
            x2="2625"
            y2="2010"
            stroke="#3B82F6"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <line
            id="beam-3"
            x1="2800"
            y1="2150"
            x2="4750"
            y2="2150"
            stroke="#3B82F6"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* STEP 1: x: 50, y: 300 (Blue Border & Blue Glow Shadow) */}
        <div
          id="gsap-card-1"
          style={{ position: "absolute", top: "300px"}}
          className="rounded-3xl border left-[70px] md:left-[10px] border-x-white/10 border-b-white/10 bg-[#0f0f10] p-8 backdrop-blur-2xl w-[300px] md:w-[450px]"
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-lg font-black text-blue-400">
              01
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">{steps[0].title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">{steps[0].desc}</p>
        
          {/* <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-blue-500 bg-[#101319] shadow-[0_0_12px_#3B82F6]" /> */}
        </div>

        {/* STEP 2: x: 2400, y: 300 (Blue Border & Blue Shadow) */}
        <div
          id="gsap-card-2"
          style={{ position: "absolute", left: "2400px", top: "300px"}}
          className="rounded-3xl border border-x-white/10 border-b-white/10 bg-[#0f0f10] p-8 backdrop-blur-2xl opacity-20 scale-95 transition-all w-[300px] md:w-[450px]"
        >
        
          {/* <div className="absolute -left-3 top-[110px] -translate-y-1/2 h-6 w-6 rounded-full border-2 border-blue-500 bg-[#101319] shadow-[0_0_12px_#3B82F6]" /> */}
          <div className="mb-6 flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-lg font-black text-blue-400">
              02
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">{steps[1].title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">{steps[1].desc}</p>
        
          {/* <div className="absolute left-1/2 -bottom-3 -translate-x-1/2 h-6 w-6 rounded-full border-2 border-blue-500 bg-[#101319] shadow-[0_0_12px_#3B82F6]" /> */}
        </div>

        {/* STEP 3: x: 2400, y: 2000 (Blue Border & Blue Shadow) */}
        <div
          id="gsap-card-3"
          style={{ position: "absolute", left: "2400px", top: "2000px"}}
          className="rounded-3xl border border-x-white/10 border-b-white/10 bg-[#0f0f10] p-8 backdrop-blur-2xl opacity-20 scale-95 transition-all w-[300px] md:w-[450px]"
        >
       
          {/* <div className="absolute left-1/2 -top-3 -translate-x-1/2 h-6 w-6 rounded-full border-2 border-blue-500 bg-[#101319] shadow-[0_0_12px_#3B82F6]" /> */}
          <div className="mb-6 flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-lg font-black text-blue-400">
              03
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">{steps[2].title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">{steps[2].desc}</p>
       
          {/* <div className="absolute -right-3 top-[150px] -translate-y-1/2 h-6 w-6 rounded-full border-2 border-blue-500 bg-[#101319] shadow-[0_0_12px_#3B82F6]" /> */}
        </div>

        {/* STEP 4: x: 4650, y: 2000 (Blue Border & Blue Shadow) */}
        <div
          id="gsap-card-4"
          style={{ position: "absolute", left: "4650px", top: "2000px"}}
          className="rounded-3xl border border-x-white/10 border-b-white/10 bg-[#0f0f10] p-8 backdrop-blur-2xl opacity-20 scale-95 transition-all w-[300px] md:w-[450px]"
        >
    
          {/* <div className="absolute -left-3 top-[150px] -translate-y-1/2 h-6 w-6 rounded-full border-2 border-blue-500 bg-[#101319] shadow-[0_0_12px_#3B82F6]" /> */}
          <div className="mb-6 flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-lg font-black text-blue-400">
              04
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">{steps[3].title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">{steps[3].desc}</p>
        </div>
      </div>
    </div>
  );
}