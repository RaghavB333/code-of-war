'use client'

import ContactSection from '@/components/ContactSection'
import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import localFont from "next/font/local";


const customFont = localFont({
src: "../../public/fonts/GODOFWAR.ttf",
weight: "400",
style: "normal",
variable: "--font-custom",
});

export default function ContactPage() {
  return (
    <section className='bg-[#0a0a0a] overflow-hidden mt-6'>
      <ContactSection/>
      <div className="text-white flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12 w-full max-w-5xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold"
          >
            <span className='text-white'>Let's Connect</span><br />
            <p className='text-2xl md:text-4xl font-bold text-blue-300 mt-1'>THE CREATORS OF <span className={`${customFont.className} text-blue-500 md:text-5xl text-3xl`}><span className='text-white'>Code</span> Of War</span></p>

          </motion.h1>

          {(Math.floor(Math.random() * 9) + 1) % 2 == 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
            {/* Raghav */}
            <div className="space-y-4 flex flex-col items-center">
              <img
                src="https://avatars.githubusercontent.com/u/89807017?v=4" // Add your image URL here
                alt="Raghav"
                className="w-44 h-44 rounded-full object-cover border-4 border-gray-100"
              />
              <motion.a
                href="mailto:raghavbhargava3@gmail.com"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <FaEnvelope className="text-xl" />
                raghavbhargava3@gmail.com
              </motion.a>
              <motion.a
                href="https://github.com/RaghavB333"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                <FaGithub className="text-xl" />
                GitHub
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/raghav-bhargava3235"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-500 transition"
              >
                <FaLinkedin className="text-xl" />
                LinkedIn
              </motion.a>
            </div>

            {/* Tanpreet */}
            <div className="space-y-4 flex flex-col items-center">
              <img
                src="/images/tanpreetimage.jpeg"
                // src="https://avatars.githubusercontent.com/u/150704059?v=4"
                alt="Tanpreet"
                className="w-44 h-44 rounded-full object-cover border-4 border-gray-100"
              />
              <motion.a
                href="mailto:tanpreetjhally300@gmail.com"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <FaEnvelope className="text-xl" />
                tanpreetjhally300@gmail.com
              </motion.a>
              <motion.a
                href="https://github.com/Tanpreet07"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                <FaGithub className="text-xl" />
                GitHub
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/tanpreet-jhally"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-500 transition"
              >
                <FaLinkedin className="text-xl" />
                LinkedIn
              </motion.a>
            </div>
          </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
            {/* Tanpreet */}
            <div className="space-y-4 flex flex-col items-center">
              <img
                 src="/images/tanpreetimage.jpeg"
                alt="Tanpreet"
                className="w-44 h-44 rounded-full object-cover border-4 border-gray-100"
              />
              <motion.a
                href="mailto:tanpreetjhally300@gmail.com"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <FaEnvelope className="text-xl" />
                tanpreetjhally300@gmail.com
              </motion.a>
              <motion.a
                href="https://github.com/Tanpreet07"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                <FaGithub className="text-xl" />
                GitHub
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/tanpreet-jhally"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-500 transition"
              >
                <FaLinkedin className="text-xl" />
                LinkedIn
              </motion.a>
            </div>

            {/* Raghav */}
            <div className="space-y-4 flex flex-col items-center">
              <img
                src="https://avatars.githubusercontent.com/u/89807017?v=4" // Add your image URL here
                alt="Raghav"
                className="w-44 h-44 rounded-full object-cover border-4 border-gray-100"
              />
              <motion.a
                href="mailto:raghavbhargava3@gmail.com"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <FaEnvelope className="text-xl" />
                raghavbhargava3@gmail.com
              </motion.a>
              <motion.a
                href="https://github.com/RaghavB333"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                <FaGithub className="text-xl" />
                GitHub
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/raghav-bhargava3235"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 hover:text-blue-500 transition"
              >
                <FaLinkedin className="text-xl" />
                LinkedIn
              </motion.a>
            </div>
          </div>
          )}

        </motion.div>
      </div>

    </section>
  )
}
