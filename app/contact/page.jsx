'use client'

import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
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
          <span className='gradient-text'>Let's Connect</span><br />
          <span className='text-2xl md:text-4xl font-bold text-orange-300'>The Creators of Code Of War</span>

        </motion.h1>

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
              src="https://avatars.githubusercontent.com/u/150704059?v=4" // Add your image URL here
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
      </motion.div>
    </div>
  )
}
