import React from 'react'
import localFont from "next/font/local";
import Link from 'next/link';
import Image from 'next/image';

const customFont = localFont({
src: "../public/fonts/GODOFWAR.ttf",
weight: "400",
style: "normal",
variable: "--font-custom",
});

const Logo = () => {
  return (
    <Link href="/" aria-label="Go to the home page" className={`flex relative items-center w-fit`}>
    {/* <Image
      src="/images/cowring.png"
      alt="Code Of War"
      width={90}
      height={98}
      sizes="160px"
      priority
      className="w-auto absolute right-8 object-contain h-[85px] md:h-[98px]"
    /> */}
        <span className={`${customFont.className} md:text-3xl text-2xl tracking-wide text-white`}>
        CODE <span className="text-blue-400">OF WAR</span>
        </span>
    </Link>
  )
}

export default Logo
