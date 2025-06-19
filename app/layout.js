import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import UserContext from '@/context/UserContext.jsx';
import LobbyContext from "@/context/LobbyContext.jsx";

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
        <UserContext>
        <LobbyContext>
        <Navbar/>
        {children}
        </LobbyContext>
        </UserContext>
      </body>
    </html>
  );
}
