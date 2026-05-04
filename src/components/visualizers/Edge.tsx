"use client";

import { motion } from "framer-motion";
import { memo } from "react";

interface EdgeProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive?: boolean;
  isDirected?: boolean;
  curve?: number;
}

const Edge = memo(function Edge({
  id,
  x1,
  y1,
  x2,
  y2,
  isActive = false,
  isDirected = false,
  curve = 0,
}: EdgeProps) {
  // Calculate quadratic bezier curve path
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + curve;
  const path = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  // Calculate arrow position if directed
  const arrowOffset = 25;
  const angle = Math.atan2(y2 - midY, x2 - midX);
  const arrowX = x2 - arrowOffset * Math.cos(angle);
  const arrowY = y2 - arrowOffset * Math.sin(angle);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Main edge path */}
      <motion.path
        d={path}
        fill="none"
        stroke={isActive ? "#fff" : "#444"}
        strokeWidth={isActive ? 2 : 1}
        initial={false}
        animate={{
          stroke: isActive ? "#fff" : "#444",
          strokeWidth: isActive ? 2 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          filter: isActive ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))" : undefined,
        }}
      />

      {/* Animated dash effect for active edges */}
      {isActive && (
        <motion.path
          d={path}
          fill="none"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={1}
          strokeDasharray="5,5"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -20 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Arrow head for directed edges */}
      {isDirected && (
        <motion.polygon
          points={`0,-6 12,0 0,6`}
          fill={isActive ? "#fff" : "#444"}
          initial={false}
          animate={{
            fill: isActive ? "#fff" : "#444",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          transform={`translate(${arrowX}, ${arrowY}) rotate(${(angle * 180) / Math.PI})`}
        />
      )}
    </motion.g>
  );
});

export default Edge;
