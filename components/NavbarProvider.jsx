"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarProvider({ children }) {
  const pathname = usePathname();
  const hideNavbar = ["/login", "/signup", "/forgot-password", "/dashboard", `/code-editor/${pathname.split("/").pop()}`, `/party/${pathname.split("/").pop()}`, `/battles/${pathname.split("/").pop()}`].includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}