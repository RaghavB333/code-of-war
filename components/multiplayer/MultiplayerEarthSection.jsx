// "use client";
// import React, { useRef, useLayoutEffect } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import EarthScene from "./EarthScene";

// const features = [
//   {
//     number: "01",
//     title: "Connect with Friends",
//     description:
//       "Connect with your friends from anywhere in the world and get ready for a coding battle.",
//   },
//   {
//     number: "02",
//     title: "Create Your Party",
//     description:
//       "Create a private multiplayer party and choose your battle settings, difficulty and duration.",
//   },
//   {
//     number: "03",
//     title: "Invite & Compete",
//     description:
//       "Invite your friends, join the same arena and solve coding challenges together in real time.",
//   },
//   {
//     number: "04",
//     title: "Prove Your Skills",
//     description:
//       "Compete for points, track your progress and see who wins the battle.",
//   },
// ];

// export default function MultiplayerEarthSection() {
//   const sectionRef = useRef(null);
//   const earthWrapperRef = useRef(null);
//   const leftContentRef = useRef(null);
//   const connectionHintRef = useRef(null);
//   const earthControllerRef = useRef(null);

//   useLayoutEffect(() => {
//     if (typeof window === "undefined") return;
//     gsap.registerPlugin(ScrollTrigger);

//     const ctx = gsap.context(() => {
//       const getTargetX = () => {
//         return window.innerWidth < 768
//           ? 0
//           : Math.min(window.innerWidth * 0.23, 360);
//       };

//       // 1. starting of the animation: earth starts from below and left, hidden 
//       gsap.set(earthWrapperRef.current, {
//         y: "65vh",
//         x: 0,
//         scale: 0.65,
//       });

//       // earth hidden
//       gsap.set(leftContentRef.current, {
//         opacity: 0,
//         x: -70,
//       });

//       gsap.set(connectionHintRef.current, {
//         opacity: 0,
//       });

//       // 2. GSAP
//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: "top top",
//           end: "+=3800",
//           pin: true,
//           scrub: 1.2, 
//           anticipatePin: 1,
//           onUpdate: (self) => {

//             if (earthControllerRef.current?.setConnectionProgress) {
//               earthControllerRef.current.setConnectionProgress(self.progress);
//             }
//           },
//         },
//       });

//       // =====================================================================
//       // timeline animation
//       // =====================================================================

//       // स्टेप 1: earth moves up and (scale: 1.22)
//       tl.to(
//         earthWrapperRef.current,
//         {
//           y: 0,
//           scale: 1.22,
//           ease: "power1.out",
//           duration: 3.5,
//         },
//         0
//       )

//       .to({}, { duration: 0.8 })

//       // स्टेप 3: earth moves right and (scale: 0.74)
//         tl.to(
//         earthWrapperRef.current,
//         {
//             x: getTargetX,
//             scale: 0.74,
//             ease: "power2.inOut",
//             duration: 4.5,
//         },
//         4.2
//         )
//         // स्टेप 4: show text when earth on the right side
//         .to(
//         leftContentRef.current,
//         {
//             opacity: 1,
//             x: 0,
//             ease: "power2.out",
//             duration: 2.8,
//         },
//         6.8
//         )
//         // step 5 show connection hint after a delay, when earth is almost in position
//         .to(
//         connectionHintRef.current,
//         {
//             opacity: 1,
//             ease: "power2.out",
//             duration: 2,
//         },
//         7.6
//         );
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);

//   const CheckIcon = () => (
//     <svg
//         aria-hidden="true"
//         viewBox="0 0 20 20"
//         className="mt-0.5 h-5 w-5 shrink-0 text-blue-400"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//     >
//         <circle cx="10" cy="10" r="8.25" className="opacity-40" />
//         <path d="M6.5 10.2l2.4 2.4 4.6-5" />
//     </svg>
//     );

//   return (
//     <div
//       ref={sectionRef}
//       id="multiplayer"
//       className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] text-white"
//     >
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)]" />
//         <div className="absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.04]" />
//         <div className="absolute left-1/2 top-1/2 h-[950px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.025]" />
//       </div>


//       <div
//         ref={earthWrapperRef}
//         className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform"
//       >
//         <div className="pointer-events-auto relative h-[min(50vh,660px)] md:h-[min(80vh,660px)] w-[min(92vw,700px)]">
//           <EarthScene ref={earthControllerRef} />
//         </div>
//       </div>

//       <div
//         ref={leftContentRef}
//         className="pointer-events-auto absolute left-6 top-1/2 z-20 w-[calc(100%-48px)] -translate-y-1/2 md:left-[6vw] md:w-[44vw] max-w-[560px]"
//       >
//         <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
//           Code Together. Compete Anywhere.
//         </p>

//         <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight">
//           ONE WORLD
//           <br />
//           ONE <span className="text-blue-500">ARENA</span>
//           <br />
//           ENDLESS BATTLES
//         </h2>

//         <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-400 md:text-base">
//           Distance doesn't matter. Connect with your friends, create a private
//           coding party and compete together from anywhere in the world.
//         </p>

//         <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
//           {features.map((feature) => (
//             <div key={feature.number} className="flex items-start gap-3.5">
//               <CheckIcon />
//               <div>
//                 <h3 className="text-sm font-semibold text-white md:text-base">
//                   {feature.title}
//                 </h3>

//                 <p className="mt-1 text-xs leading-relaxed text-gray-400 md:text-sm">
//                   {feature.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-7 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-widest text-blue-400/80">
//           <span>Your friends. Your party. Your arena.</span>
//         </div>
//       </div>

//       <div
//         ref={connectionHintRef}
//         className="pointer-events-none absolute bottom-10 right-6 z-20 text-right md:right-12"
//       >
//         <p className="mt-1 text-xs font-mono text-gray-500">
//           Connected beyond boundaries.
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EarthScene from "./EarthScene";

const features = [
  {
    number: "01",
    title: "Connect with Friends",
    description:
      "Connect with your friends from anywhere in the world and get ready for a coding battle.",
  },
  {
    number: "02",
    title: "Create Your Party",
    description:
      "Create a private multiplayer party and choose your battle settings, difficulty and duration.",
  },
  {
    number: "03",
    title: "Invite & Compete",
    description:
      "Invite your friends, join the same arena and solve coding challenges together in real time.",
  },
  {
    number: "04",
    title: "Prove Your Skills",
    description:
      "Compete for points, track the leaderboard and see who wins the battle.",
  },
];

export default function MultiplayerEarthSection() {
  const sectionRef = useRef(null);
  const earthWrapperRef = useRef(null);
  const leftContentRef = useRef(null);
  const connectionHintRef = useRef(null);
  const progressBarRef = useRef(null);
  const earthControllerRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // gsap.matchMedia ensure karta hai ki Desktop aur Mobile/Tab dono ka alag responsive timeline ho
      const mm = gsap.matchMedia();

      // =========================================================================
      // 1. DESKTOP / LAPTOP (Screen >= 1024px)
      // Existing working 100% untouched:
      // Earth upar aayegi -> RIGHT side shift hogi -> Text LEFT me aayega.
      // =========================================================================
      mm.add("(min-width: 1024px)", () => {
        const getTargetX = () => Math.min(window.innerWidth * 0.23, 360);

        // Initial setup for Desktop
        gsap.set(earthWrapperRef.current, {
          y: "65vh",
          x: 0,
          scale: 0.65,
        });

        gsap.set(leftContentRef.current, {
          opacity: 0,
          x: -70,
          y: 0,
        });

        gsap.set(connectionHintRef.current, {
          opacity: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=3800",
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${self.progress * 100}%`;
              }
              if (earthControllerRef.current?.setConnectionProgress) {
                earthControllerRef.current.setConnectionProgress(self.progress);
              }
            },
          },
        });

        // Desktop Choreography:
        tl.to(
          earthWrapperRef.current,
          {
            y: 0,
            scale: 1.22,
            ease: "power1.out",
            duration: 3.5,
          },
          0
        )
          .to({}, { duration: 0.8 })
          .to(
            earthWrapperRef.current,
            {
              x: getTargetX,
              scale: 0.76,
              ease: "power2.inOut",
              duration: 4.2,
            },
            4.3
          )
          .to(
            leftContentRef.current,
            {
              opacity: 1,
              x: 0,
              y: -250,
              ease: "power2.out",
              duration: 3.0,
            },
            5.2
          )
          .to(
            connectionHintRef.current,
            {
              opacity: 1,
              ease: "power2.out",
              duration: 2,
            },
            6.8
          );
      });

      // =========================================================================
      // 2. MOBILE & TABLET (Screen < 1024px)
      // Vertical Stacking: Text UPAR rahega, aur Earth NICHE glide hogi!
      // =========================================================================
      mm.add("(max-width: 1023px)", () => {
        const isTablet = window.innerWidth >= 640;

        // Initial setup for Mobile/Tablet
        gsap.set(earthWrapperRef.current, {
          y: "60vh",
          x: 0,
          scale: 0.55,
        });

        // Content upar positioned hai, halka sa y-offset se smooth fade-in hoga
        gsap.set(leftContentRef.current, {
          opacity: 0,
          y: -25,
          x: 0,
        });

        gsap.set(connectionHintRef.current, {
          opacity: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=3200",
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${self.progress * 100}%`;
              }
              if (earthControllerRef.current?.setConnectionProgress) {
                earthControllerRef.current.setConnectionProgress(self.progress);
              }
            },
          },
        });

        // 1. Earth screen ke center me aayegi
        tl.to(
          earthWrapperRef.current,
          {
            y: 0,
            scale: isTablet ? 1.02 : 0.84,
            ease: "power1.out",
            duration: 3.2,
          },
          0
        )
          .to({}, { duration: 0.6 })

          // 2. Earth niche (bottom half) me shift ho jayegi taki upar text ke liye clear space ban jaye
          .to(
            earthWrapperRef.current,
            {
              x: 0,
              y: isTablet ? "22vh" : "24vh",
              scale: isTablet ? 0.68 : 0.52,
              ease: "power2.inOut",
              duration: 4.2,
            },
            3.8
          )

          // 3. Text UPAR wale half me smoothly reveal hoga
          .to(
            leftContentRef.current,
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              duration: 2.8,
            },
            5.6
          )

          // 4. Live Nodes Hint bottom me appear hoga
          .to(
            connectionHintRef.current,
            {
              opacity: 1,
              ease: "power2.out",
              duration: 1.8,
            },
            6.8
          );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);


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
      ref={sectionRef}
      id="multiplayer"
      data="multiplayer"
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.04]" />
        <div className="absolute left-1/2 top-1/2 h-[950px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.025]" />
      </div>

      {/* 
        3D EARTH WRAPPER:
        Desktop par right me slide hota hai, Phone/Tab par niche bottom half me slide hota hai.
      */}
      <div
        ref={earthWrapperRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform z-10"
      >
        <div className="pointer-events-auto relative h-[min(48vh,400px)] sm:h-[min(54vh,480px)] lg:h-[min(80vh,660px)] w-[min(92vw,700px)] flex items-center justify-center">
          <EarthScene ref={earthControllerRef} />
        </div>
      </div>

      {/* 
        TEXT CONTENT:
        - Mobile & Tablet (<1024px): Screen ke TOP half me rehta hai (top-14 sm:top-16) aur center-aligned.
        - Laptop & Desktop (>=1024px): Screen ke LEFT side me rehta hai (lg:top-1/2 lg:-translate-y-1/2 lg:left-[6vw]).
      */}
      <div
        ref={leftContentRef}
        className="pointer-events-auto absolute z-20 px-4 sm:px-8 
                   top-14 sm:top-16 md:top-20 lg:top-1/2 lg:-translate-y-1/2 
                   left-0 right-0 mx-auto lg:mx-0 lg:left-[6vw] 
                   w-full max-w-[560px] lg:max-w-[540px]"
      >
        <p className="font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Code Together. Compete Anywhere.
        </p>

        <h2 className="mt-2 sm:mt-2.5 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight sm:leading-[1.08] tracking-tight text-white">
          ONE WORLD.
          <br className="hidden sm:inline" />
          ONE <span className="text-blue-500">ARENA.</span>
          <br className="hidden sm:inline" />
          ENDLESS BATTLES.
        </h2>

        <p className="mt-4 sm:mt-3 text-xs sm:text-sm md:text-base leading-relaxed text-gray-400 max-w-md line-clamp-2 sm:line-clamp-none">
          Distance doesn't matter. Connect with your friends, create a private
          coding party and compete together from anywhere in the world.
        </p>

        {/* 2x2 Grid Features */}
        <div className="mt-6 sm:mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4">
          {features.map((feature) => (
            <div key={feature.number} className="flex items-start gap-2.5 sm:gap-3.5">
              <CheckIcon/>

              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs md:text-sm leading-relaxed text-gray-400 line-clamp-2 sm:line-clamp-none">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 hidden sm:flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-blue-400/80">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Your friends. Your party. Your arena.</span>
        </div>
      </div>

      {/* Connection label (Bottom Right) */}
      <div
        ref={connectionHintRef}
        className="pointer-events-none absolute bottom-4 sm:bottom-8 right-4 sm:right-6 md:right-12 z-20 text-right"
      >
        <p className="mt-0.5 text-[10px] sm:text-xs font-mono text-gray-500">
          Connected beyond boundaries.
        </p>
      </div>
    </div>
  );
}
