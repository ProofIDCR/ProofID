"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { memo } from "react";

const StarsBackground = memo(() => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 2,
      initialX: Math.random() * 120 - 10,
      initialY: Math.random() * 120 - 20,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 20,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.initialX}%`,
            top: `${star.initialY}%`,
          }}
          animate={{
            x: [0, -screenSize.width * 1.2],
            y: [0, screenSize.height * 1.2],
            opacity: [0, star.opacity, star.opacity, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

StarsBackground.displayName = "StarsBackground";
export default StarsBackground;
