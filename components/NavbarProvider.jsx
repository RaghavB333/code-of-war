"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarProvider({ children }) {
  const pathname = usePathname();
  const hideNavbar = ["/Login", "/Signup", "/forgot-password", `/CodeEditor/${pathname.split("/").pop()}`].includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}