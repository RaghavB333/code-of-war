"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { UserDataContext } from "@/context/UserContext";
import Logo from "@/lib/Logo";


const NAV_LINKS = [
  { href: "/party", label: "Multiplayer" },
  { href: "/problems", label: "Problems" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/battles", label: "Battles" },
  { href: "/contact", label: "Contact Us" },
];



const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const pathname = usePathname();

  // Glass effect appears as soon as the page is scrolled a little.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating, on Escape, and when the screen gets wide.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    const onResize = () => window.innerWidth >= 768 && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      const response = await axios.get("/api/logout", { withCredentials: true });
      if (response.status === 200) setUser(null);
    } catch (error) {
      console.log(error);
    }
    signOut({ callbackUrl: "/" });
  };

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);
  const glass = scrolled || isOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${
        glass
          ? "border-b border-white/10 py-1 bg-black/60 shadow-lg shadow-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        {/* Logo */}
        <Logo/>
        {/* Desktop links */}
        <ul className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} className={!user?._id && label == 'Dashboard' ? "hidden" : ''}>
              <Link
                href={href == '/battles' && !user?._id ? '/login' : href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative rounded py-1 text-[15px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-blue-300 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 ${focusRing} ${
                  isActive(href) ? "text-blue-300 after:scale-x-100" : "text-gray-300 after:scale-x-0"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link
                href="/login"
                className={`rounded-lg px-4 py-2 text-[15px] font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white ${focusRing}`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`rounded-lg bg-blue-500 px-5 py-2 text-[15px] font-semibold text-white transition hover:bg-blue-400 ${focusRing}`}
              >
                Sign up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className={`rounded-lg border border-white/15 px-4 py-2 text-[15px] font-medium text-gray-200 transition-colors hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300 ${focusRing}`}
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`rounded-md p-2 text-blue-300 md:hidden ${focusRing}`}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </nav>

      {/* Mobile menu: slides open */}
      <div
        id="mobile-menu"
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1 px-4 pb-4 pt-1 sm:px-6">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href} className={!user?._id && label == 'Dashboard' ? "hidden" : ''}>
                <Link
                  href={href == '/battles' && !user?._id ? '/login' : href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`relative rounded py-1 text-[15px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-blue-300 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 ${focusRing} ${
                    isActive(href) ? "text-blue-300 after:scale-x-100" : "text-gray-300 after:scale-x-0"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-3 border-t border-white/10 pt-4">
              {!user ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    tabIndex={isOpen ? 0 : -1}
                    className={`rounded-lg border border-white/15 px-4 py-2.5 text-center font-medium text-gray-100 transition-colors hover:bg-white/10 ${focusRing}`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    tabIndex={isOpen ? 0 : -1}
                    className={`rounded-lg bg-blue-400 px-4 py-2.5 text-center font-semibold text-black transition hover:brightness-110 ${focusRing}`}
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  tabIndex={isOpen ? 0 : -1}
                  className={`w-full rounded-lg border border-white/15 px-4 py-2.5 font-medium text-gray-100 transition-colors hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300 ${focusRing}`}
                >
                  Logout
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
