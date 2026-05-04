"use client";

import { motion } from "framer-motion";
import { memo } from "react";

interface ArrayVisualizerProps {
  id: string;
  elements: (string | number | null)[];
  capacity: number;
  activeIndex?: number | null;
  highlightIndices?: number[];
  cellSize?: number;
  gap?: number;
  showIndices?: boolean;
}

const ArrayVisualizer = memo(function ArrayVisualizer({
  id,
  elements,
  capacity,
  activeIndex = null,
  highlightIndices = [],
  cellSize = 50,
  gap = 4,
  showIndices = true,
}: ArrayVisualizerProps) {
  return (
    <div className="relative">
      {/* Array container */}
      <div
        className="flex items-center"
        style={{ gap: `${gap}px` }}
      >
        {Array.from({ length: capacity }).map((_, index) => {
          const value = elements[index];
          const isFilled = value !== undefined && value !== null;
          const isActive = activeIndex === index;
          const isHighlighted = highlightIndices.includes(index);

          return (
            <motion.div
              key={`${id}-cell-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                backgroundColor: isActive
                  ? "#333"
                  : isHighlighted
                  ? "#2a2a2a"
                  : isFilled
                  ? "#1a1a1a"
                  : "transparent",
                borderColor: isActive ? "#fff" : isFilled ? "#444" : "#333",
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative flex items-center justify-center border"
              style={{
                width: cellSize,
                height: cellSize,
                boxShadow: isActive ? "0 0 12px rgba(255, 255, 255, 0.2)" : undefined,
              }}
            >
              {/* Cell value */}
              {isFilled && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-sm font-mono"
                  style={{
                    color: isActive ? "#fff" : "#888",
                  }}
                >
                  {value}
                </motion.span>
              )}

              {/* Index label */}
              {showIndices && (
                <span
                  className="absolute -bottom-5 text-xs text-muted"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {index}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Size indicator */}
      <div className="mt-6 flex justify-between text-xs text-muted">
        <span>size: {elements.length}</span>
        <span>capacity: {capacity}</span>
      </div>
    </div>
  );
});

export default ArrayVisualizer;
