import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AcceptInvite from "@/components/AcceptInvite";
import UserContext from '@/context/UserContext.jsx';
import LobbyContext from "@/context/LobbyContext.jsx";
import { Providers } from "./Providers";
import NavbarProvider from "@/components/NavbarProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Code of War",
  description: "Revolutionising competitive programming",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        <UserContext>
        <LobbyContext>
        <NavbarProvider>
        <AcceptInvite/>
        {children}
        </NavbarProvider>
        </LobbyContext>
        </UserContext>
        </Providers>
      </body>
    </html>
  );
}
