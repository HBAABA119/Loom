"use client";

import { motion } from "framer-motion";
import { memo } from "react";

interface NodeProps {
  id: string;
  x: number;
  y: number;
  value: string | number;
  isActive?: boolean;
  isHighlighted?: boolean;
  isDraggable?: boolean;
  glowColor?: string;
  size?: number;
  onDrag?: (id: string, x: number, y: number) => void;
}

const Node = memo(function Node({
  id,
  x,
  y,
  value,
  isActive = false,
  isHighlighted = false,
  isDraggable = false,
  glowColor = "rgba(255, 255, 255, 0.3)",
  size = 40,
  onDrag,
}: NodeProps) {
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    if (onDrag) {
      onDrag(id, info.point.x, info.point.y);
    }
  };

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      drag={isDraggable}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ cursor: isDraggable ? "grab" : "default" }}
    >
      {/* Glow filter */}
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Node circle */}
      <motion.circle
        r={size / 2}
        fill={isHighlighted ? "#333" : "#1a1a1a"}
        stroke={isActive ? "#fff" : "#444"}
        strokeWidth={isActive ? 2 : 1}
        filter={isActive ? `url(#glow-${id})` : undefined}
        initial={false}
        animate={{
          stroke: isActive ? "#fff" : "#444",
          strokeWidth: isActive ? 2 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          filter: isActive ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
        }}
      />

      {/* Value text */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isActive ? "#fff" : "#888"}
        fontSize={size / 2.5}
        fontFamily="var(--font-geist-mono), monospace"
      >
        {value}
      </text>

      {/* Active indicator ring */}
      {isActive && (
        <motion.circle
          r={size / 2 + 4}
          fill="none"
          stroke={glowColor}
          strokeWidth={1}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </motion.g>
  );
});

export default Node;
