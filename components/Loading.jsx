"use client";
import React from "react";
import { motion } from "framer-motion";

const Loading = ({ message = "Loading" }) => {
  const houses = [0, 1, 2];

  return (
    <div className="flex flex-col justify-center items-center h-[70vh] space-y-6">
      {/* Animated bouncing houses */}
      <div className="flex space-x-4">
        {houses.map((i) => (
          <motion.div
            key={i}
            className="relative w-6 h-6"
            animate={{
              y: [0, -14, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: "easeInOut",
              delay: i * 0.25,
            }}
          >
            {/* House shape: triangle roof + square body */}
            <div className="absolute bottom-0 w-6 h-6 bg-blue-400 rounded-sm flex flex-col items-center">
              <div className="w-0 h-0 border-l-3 border-r-3 border-b-4 border-b-blue-600 border-l-transparent border-r-transparent"></div>
              <div className="w-4 h-4 bg-blue-500 mt-1"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated "Loading..." text */}
      <motion.div
        className="text-gray-700 text-lg font-medium flex items-center"
        initial="hidden"
        animate="visible"
      >
        <motion.span
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.span>

        {/* Animated dots */}
        <motion.span
          key="dots"
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AnimatedDots />
        </motion.span>
      </motion.div>
    </div>
  );
};

// Helper for the animated dots (cycles through ".", "..", "...")
const AnimatedDots = () => {
  const [dotIndex, setDotIndex] = React.useState(0);
  const dots = ["", ".", "..", "..."];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % dots.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span>{dots[dotIndex]}</span>;
};

export default Loading;
