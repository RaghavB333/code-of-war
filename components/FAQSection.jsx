
"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Code of War?",
    answer:
      "Code of War is a multiplayer competitive programming platform where you can solve coding challenges, improve your problem-solving skills, and compete with other developers.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create your account, explore the problem library, choose a challenge, and start writing your solution in the built-in code editor.",
  },
  {
    question: "How does code execution work?",
    answer:
      "Write your solution in the editor and run it against sample test cases. When you submit your solution, it is evaluated against the problem's test cases to determine whether it is accepted.",
  },
  {
    question: "Which programming languages are supported?",
    answer:
      "Code of War supports multiple programming languages, including C++, Python, Java, and JavaScript. Available languages can be selected directly from the code editor.",
  },
  {
    question: "How can I compete with my friends?",
    answer:
      "Create a private Party, invite your friends, and bring everyone into the same coding session. Once the competition starts, participants solve the selected problems and compete on the leaderboard.",
  },
  {
    question: "How is the winner decided?",
    answer:
      "Participants earn scores by solving problems during the competition. The leaderboard tracks their performance, and the participant with the highest final score takes the top position.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <div
      className="relative w-full overflow-hidden px-5 py-24 md:py-18"
    >
      <div className="relative mx-auto max-w-[900px]">
        {/* Heading */}
        <div className="mb-12 text-center md:mb-14">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-400">
            Got Questions?
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Frequently Asked{" "}
            <span className="text-blue-400">
              Questions
            </span>
          </h2>
        </div>

        {/* FAQ List */}
        <div className="border-t border-white/[0.12]">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={faq.question}
                className="border-b border-white/[0.12]"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="group flex w-full items-center justify-between gap-6 py-4 text-left transition-colors duration-200"
                >
                  <span
                    className={`text-sm font-medium transition-colors duration-200 sm:text-base md:text-[17px] ${
                      isOpen
                        ? "text-blue-400"
                        : "text-white group-hover:text-blue-400"
                    }`}
                  >
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 bg-blue-500/10 text-blue-400"
                        : "text-white/50 group-hover:text-blue-400"
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>

                {/* Answer */}
                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[760px] pb-6 pr-8 text-sm leading-7 text-white/55 md:text-[15px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-10 text-left">
          <p className="text-sm text-white/80 sm:text-base">
            Still have questions?{" "}
            <a
              href="/contact"
              className="font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300"
            >
              Contact us
              <span className="ml-1 inline-block transition-transform duration-200 hover:translate-x-1">
                →
              </span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

